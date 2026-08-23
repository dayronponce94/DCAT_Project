import os
import pickle
import pandas as pd
import numpy as np
import shap
from lime.lime_tabular import LimeTabularExplainer
from sklearn.model_selection import train_test_split

from app.services.catalog_service import translate_feature_name
from app.services.data_preparation import load_and_clean_data

# ------------------------------------------------------------------
# CACHÉ A NIVEL DE MÓDULO: el pipeline y el explainer de LIME se
# construyen UNA sola vez cuando el módulo se importa, no en cada
# request. Construir LimeTabularExplainer es costoso (arma
# estadísticas de discretización sobre todo el training set), así
# que hacerlo por petición sería muy lento en producción.
# ------------------------------------------------------------------
_pipeline = None
_lime_explainer = None
_feature_names = None


def _cargar_pipeline():
    global _pipeline
    if _pipeline is None:
        base_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        model_path = os.path.join(
            base_dir, "app", "models_ml", "random_forest_model.pkl"
        )
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"No se encontró el modelo entrenado en: {model_path}"
            )
        with open(model_path, "rb") as f:
            _pipeline = pickle.load(f)
    return _pipeline


def _construir_lime_explainer():
    """
    Construye el LimeTabularExplainer UNA sola vez, sobre las columnas
    ORIGINALES (sin OneHotEncoder), usando exactamente el mismo split
    de entrenamiento que se usó para entrenar el modelo final (60/20/20,
    random_state=42).

    IMPORTANTE: a diferencia del intento anterior, aquí NO se le pasan
    a LIME las columnas ya expandidas por OneHotEncoder. Con una
    variable como ENTIDAD_OCURRENCIA (32 categorías = 32 columnas
    binarias), LIME fragmenta la explicación en docenas de banderas de
    baja señal individual ("NO es entidad 12", "NO es entidad 20"...)
    y el ruido de esas columnas dispersas termina dominando sobre las
    variables que realmente importan. Dándole las columnas categóricas
    ORIGINALES (una sola columna por variable, con sus códigos enteros),
    LIME perturba muestreando de la distribución real de cada categoría
    en el training set, y cada variable queda como UNA sola
    característica en la explicación — igual que en SHAP.
    """
    global _lime_explainer, _feature_names

    if _lime_explainer is not None:
        return _lime_explainer

    pipeline = _cargar_pipeline()

    # Reproducir EXACTAMENTE el mismo split usado en train_model.py
    df = load_and_clean_data()
    X = df.drop(columns=["TARGET"])
    y = df["TARGET"]

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.40, random_state=42, stratify=y
    )

    _feature_names = list(
        X_train.columns
    )  # ['EDAD','ESTADO_CONYUGAL','ESCOLARIDAD','DERECHOHABIENCIA','ENTIDAD_OCURRENCIA']

    categorical_features_orig = [
        "ESTADO_CONYUGAL",
        "ESCOLARIDAD",
        "DERECHOHABIENCIA",
        "ENTIDAD_OCURRENCIA",
    ]
    categorical_indices = [_feature_names.index(c) for c in categorical_features_orig]

    _lime_explainer = LimeTabularExplainer(
        training_data=X_train.values,  # datos ORIGINALES, sin one-hot
        feature_names=_feature_names,
        categorical_features=categorical_indices,
        class_names=["Desamparo", "Atención Médica"],
        mode="classification",
        discretize_continuous=True,
        random_state=42,
    )
    return _lime_explainer


def _predict_proba_desde_crudo(pipeline):
    """
    LIME perturba en el espacio de columnas ORIGINALES (crudas). Para
    predecir necesita una función que reciba esas filas crudas y
    devuelva probabilidades — así que envolvemos el pipeline COMPLETO
    (preprocessor + modelo), no solo el clasificador. El pipeline se
    encarga de aplicar el mismo OneHotEncoder internamente antes de
    predecir, exactamente igual que en producción.
    """

    def _predict(raw_rows: np.ndarray) -> np.ndarray:
        df_rows = pd.DataFrame(raw_rows, columns=_feature_names)
        return pipeline.predict_proba(df_rows)

    return _predict


def get_shap_explanation(patient_data: dict):
    """
    Recibe un diccionario con el perfil del paciente (IDs numéricos),
    calcula la probabilidad de riesgo y genera la explicación local
    con SHAP y LIME (ambos reales, ambos sobre el mismo modelo).
    """
    pipeline = _cargar_pipeline()
    preprocessor = pipeline.named_steps["preprocessor"]
    rf_model = pipeline.named_steps["classifier"]

    df_patient = pd.DataFrame([patient_data])

    prob_atencion = pipeline.predict_proba(df_patient)[0][1]
    riesgo_desamparo = 1.0 - prob_atencion

    X_transformed = preprocessor.transform(df_patient)
    feature_names = preprocessor.get_feature_names_out()
    df_transformed = pd.DataFrame(X_transformed, columns=feature_names)

    # ---------------- SHAP (Compatible con TreeExplainer de Random Forest) ----------------
    explainer_shap = shap.TreeExplainer(rf_model)
    shap_values = explainer_shap.shap_values(df_transformed)

    # Manejo flexible de dimensiones de SHAP para clasificadores de scikit-learn
    if isinstance(shap_values, list):
        # shap_values[0] corresponde a la Clase 0 (Desamparo)
        shap_local = shap_values[0][0]
    elif len(shap_values.shape) == 3:
        # Array 3D: (muestras, características, clases)
        shap_local = shap_values[0, :, 0]
    else:
        shap_local = shap_values[0] * -1

    explicacion_detallada = []
    fila_transformada = df_transformed.iloc[0]
    for col, val in zip(feature_names, shap_local):
        if val != 0:
            if fila_transformada[col] == 1.0 or col.startswith("remainder__"):
                nombre_limpio = col.replace("cat__", "").replace("remainder__", "")
                nombre_traducido = translate_feature_name(nombre_limpio)
                explicacion_detallada.append(
                    {
                        "caracteristica_binaria": nombre_limpio,
                        "caracteristica_traducida": nombre_traducido,
                        "impacto_shap": float(val),
                        "direccion": (
                            "Incrementa Riesgo Desamparo"
                            if val > 0
                            else "Disminuye Riesgo Desamparo"
                        ),
                    }
                )
    explicacion_detallada = sorted(
        explicacion_detallada, key=lambda x: abs(x["impacto_shap"]), reverse=True
    )

    # ---------------- LIME REAL (columnas originales, no one-hot) ----------------
    lime_explainer = _construir_lime_explainer()
    predict_fn = _predict_proba_desde_crudo(
        pipeline
    )  # pipeline completo: aplica OneHotEncoder + Random Forest

    exp = lime_explainer.explain_instance(
        data_row=df_patient.iloc[
            0
        ].values,  # fila CRUDA del paciente (EDAD, ESTADO_CONYUGAL, ...), sin transformar      ].values,  # fila CRUDA del paciente (EDAD, ESTADO_CONYUGAL, ...), sin transformar
        predict_fn=predict_fn,
        num_features=5,  # solo hay 5 variables originales, así que las pedimos todas
        labels=(0,),  # explicamos la clase 0 = Desamparo directamente
    )

    # exp.as_list(label=0) da pares (regla/variable, peso) reales, calculados
    # por el modelo lineal local que LIME ajustó sobre las perturbaciones.
    analisis_lime = []
    for regla, peso in exp.as_list(label=0):
        analisis_lime.append(
            {
                "regla_lime": regla,  # ej. "cat__ESCOLARIDAD_1 > 0.50"
                "impacto_probabilidad": round(
                    float(peso), 4
                ),  # peso real del modelo lineal local, en escala de probabilidad
                "efecto": (
                    "Aumenta Riesgo Desamparo"
                    if peso > 0
                    else "Disminuye Riesgo Desamparo"
                ),
            }
        )

    # ---------------- Narrativa (usa el top factor REAL de LIME, no una regla fija hardcodeada) ----------------
    factor_critico_lime = analisis_lime[0]["regla_lime"] if analisis_lime else "N/D"

    narrativa_clinica = (
        f"El motor de Inteligencia Artificial predice un riesgo de desamparo del {riesgo_desamparo * 100:.2f}%. "
        f"Al auditar el caso con LIME, el factor local más determinante fue: '{factor_critico_lime}', "
        f"con un impacto de {analisis_lime[0]['impacto_probabilidad']*100:.2f} puntos porcentuales sobre la probabilidad "
        f"de desamparo (si LIME encontró resultados).\n\n"
        f"Esto es consistente con el análisis SHAP, que identificó a {explicacion_detallada[0]['caracteristica_traducida']} "
        f"como el principal impulsor del riesgo."
    )

    return {
        "probabilidad_atencion_medica": float(prob_atencion),
        "probabilidad_riesgo_desamparo": float(riesgo_desamparo),
        "analisis_explicable_xai": explicacion_detallada,
        "analisis_lime": analisis_lime,
        "narrativa_clinica": narrativa_clinica,
    }


if __name__ == "__main__":
    test_patient = {
        "EDAD": 18,
        "ESTADO_CONYUGAL": 1,
        "ESCOLARIDAD": 1,
        "DERECHOHABIENCIA": 0,
        "ENTIDAD_OCURRENCIA": 1,
    }

    print(
        "\n[PROCESO] Calculando predicción, SHAP y LIME para el paciente de prueba..."
    )
    resultado = get_shap_explanation(test_patient)

    print("\n================ RESULTADOS DEL MOTOR XAI ================")
    print(
        f"Probabilidad de recibir Atención Médica: {resultado['probabilidad_atencion_medica'] * 100:.2f}%"
    )
    print(
        f"Probabilidad de morir en el DESAMPARO: {resultado['probabilidad_riesgo_desamparo'] * 100:.2f}%"
    )

    print("\nTop Factores SHAP:")
    for factor in resultado["analisis_explicable_xai"][:4]:
        print(
            f" -> {factor['caracteristica_binaria']}: {factor['impacto_shap']:.4f} ({factor['direccion']})"
        )

    print("\nTop Factores LIME:")
    for factor in resultado["analisis_lime"][:4]:
        print(
            f" -> {factor['regla_lime']}: {factor['impacto_probabilidad']:.4f} ({factor['efecto']})"
        )
