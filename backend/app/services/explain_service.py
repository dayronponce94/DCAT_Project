import os
import pickle
import pandas as pd
import numpy as np
import shap


def get_shap_explanation(patient_data: dict):
    """
    Recibe un diccionario con el perfil del paciente (IDs numéricos),
    calcula la probabilidad de riesgo y genera la explicación local con SHAP.
    """
    # 1. Cargar el Pipeline entrenado de manera segura
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    model_path = os.path.join(base_dir, "app", "models_ml", "xgboost_model.pkl")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No se encontró el modelo entrenado en: {model_path}")

    with open(model_path, "rb") as f:
        pipeline = pickle.load(f)

    # Extraemos los dos pasos de nuestro pipeline
    preprocessor = pipeline.named_steps["preprocessor"]
    xgb_model = pipeline.named_steps["classifier"]

    # 2. Convertir el diccionario del paciente en un DataFrame de una sola fila
    df_patient = pd.DataFrame([patient_data])

    # 3. Calcular la probabilidad real de recibir asistencia médica
    prob_atencion = pipeline.predict_proba(df_patient)[0][1]
    riesgo_desamparo = 1.0 - prob_atencion  # El riesgo inverso (Clase 0)

    # 4. PASO CLAVE XAI: Transformar los datos con el OneHotEncoder para que SHAP los entienda
    # SHAP necesita inspeccionar las columnas exactamente en el formato matemático que ve el modelo interno
    X_transformed = preprocessor.transform(df_patient)

    # Obtener los nombres correctos de las columnas transformadas por el OneHotEncoder
    feature_names = preprocessor.get_feature_names_out()
    df_transformed = pd.DataFrame(X_transformed, columns=feature_names)

    # 5. Inicializar el explicador de SHAP optimizado para árboles (TreeExplainer)
    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer.shap_values(df_transformed)

    if isinstance(shap_values, list):
        shap_local = shap_values[0][0]
    else:
        shap_local = shap_values[0]

    # AJUSTE DOCTORAL: Invertimos el signo del valor SHAP (* -1)
    # Como el modelo predice "Atención" (1), al invertirlo logramos que SHAP
    # explique directamente el riesgo de "Desamparo" (0).
    shap_local = shap_local * -1

    # 6. Mapear los nombres de las variables con sus respectivos impactos
    explicacion_detallada = []
    for col, val in zip(feature_names, shap_local):
        if val != 0:
            explicacion_detallada.append(
                {
                    "caracteristica_binaria": col,
                    "impacto_shap": float(val),
                    # Ahora la lógica es directa: positivo incrementa riesgo, negativo lo disminuye
                    "direccion": (
                        "Incrementa Riesgo Desamparo"
                        if val > 0
                        else "Disminuye Riesgo Desamparo"
                    ),
                }
            )

    # Ordenar los impactos de mayor a menor relevancia absoluta
    explicacion_detallada = sorted(
        explicacion_detallada, key=lambda x: abs(x["impacto_shap"]), reverse=True
    )

    return {
        "probabilidad_atencion_medica": float(prob_atencion),
        "probabilidad_riesgo_desamparo": float(riesgo_desamparo),
        "analisis_explicable_xai": explicacion_detallada,
    }


if __name__ == "__main__":
    # Caso de prueba sintético: Simulamos una paciente de alta vulnerabilidad
    # EDAD = 18, ESTADO_CONYUGAL = 1 (Soltera), ESCOLARIDAD = 1 (Ninguna),
    # DERECHOHABIENCIA = 0 (Se ignora/Ninguna), ENTIDAD_OCURRENCIA = 1 (Aguascalientes)
    test_patient = {
        "EDAD": 18,
        "ESTADO_CONYUGAL": 1,
        "ESCOLARIDAD": 1,
        "DERECHOHABIENCIA": 0,
        "ENTIDAD_OCURRENCIA": 1,
    }

    try:
        print(
            "\n[PROCESO] Calculando predicción y valores SHAP para el paciente de prueba..."
        )
        resultado = get_shap_explanation(test_patient)
        print("\n================ RESULTADOS DEL MOTOR XAI ================")
        print(
            f"Probabilidad de recibir Atención Médica: {resultado['probabilidad_atencion_medica'] * 100:.2f}%"
        )
        print(
            f"Probabilidad de morir en el DESAMPARO: {resultado['probabilidad_riesgo_desamparo'] * 100:.2f}%"
        )
        print("\nTop Factores SHAP que influyeron en la decisión:")
        for factor in resultado["analisis_explicable_xai"][:4]:
            print(
                f" -> {factor['caracteristica_binaria']}: {factor['impacto_shap']:.4f} ({factor['direccion']})"
            )
    except Exception as e:
        print(f"\n[ERROR] Fallo en el motor XAI: {e}")
