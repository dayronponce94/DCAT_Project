import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from xgboost import XGBClassifier

from app.services.data_preparation import load_and_clean_data


def train_and_save_model():
    """Entrena XGBoost usando un Pipeline con OneHotEncoder para los IDs nominales."""
    # 1. Cargar el dataset numérico nativo
    df = load_and_clean_data()

    X = df.drop(columns=["TARGET"])
    y = df["TARGET"]

    # 2. División estratificada (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 3. Definir variables categóricas (IDs nominales) a procesar
    categorical_features = [
        "ESTADO_CONYUGAL",
        "ESCOLARIDAD",
        "DERECHOHABIENCIA",
        "ENTIDAD_OCURRENCIA",
    ]

    # Creamos el preprocesador para convertir los IDs planos en columnas binarias legibles para la IA
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_features,
            )
        ],
        remainder="passthrough",  # Deja la EDAD intacta
    )

    # 4. Cálculo matemático del ratio de desbalanceo
    con_atencion = np.sum(y_train == 1)
    sin_atencion = np.sum(y_train == 0)
    ratio_desbalance = con_atencion / sin_atencion

    # 5. Configurar el clasificador XGBoost robusto
    model = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.05,
        scale_pos_weight=ratio_desbalance
        * 2.0,  # Forzamos más agresividad en la clase minoritaria
        random_state=42,
        eval_metric="logloss",
    )

    # 6. Unificar en un Pipeline para asegurar consistencia de datos
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", model)])

    # 7. Entrenar el Pipeline completo
    print("\n[PROCESO] Entrenando Pipeline (OneHotEncoder + XGBoost)...")
    pipeline.fit(X_train, y_train)

    # 8. Evaluación de Métricas Científicas (Optimizando el Umbral de Decisión)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # AJUSTE DOCTORAL: En lugar de usar el umbral rígido de 0.50,
    # usamos un umbral basado en la distribución real de nuestros datos (0.88)
    # Si la probabilidad de tener atención es menor al 88%, clasificamos como SIN ATENCIÓN (0)
    umbral_personalizado = 0.88
    y_pred = np.where(y_prob >= umbral_personalizado, 1, 0)

    print(
        "\n================ MATRIZ DE CONFUSIÓN (UMBRAL OPTIMIZADO) =================="
    )
    print(confusion_matrix(y_test, y_pred))
    print("\n================ REPORTE DE CLASIFICACIÓN ================ ")
    print(classification_report(y_test, y_pred))
    print(f"Métrica ROC-AUC (Estable y confiable): {roc_auc_score(y_test, y_prob):.4f}")

    # 9. Serializar el Pipeline completo (Cerebro de la IA + Preprocesamiento)
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    model_path = os.path.join(base_dir, "app", "models_ml", "xgboost_model.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"\n[ÉXITO] Pipeline de IA guardado correctamente en: {model_path}")


if __name__ == "__main__":
    train_and_save_model()
