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
from sklearn.metrics import precision_recall_curve, f1_score
from app.services.data_preparation import load_and_clean_data


def train_and_save_model():
    """Entrena XGBoost usando un Pipeline con OneHotEncoder para los IDs nominales."""
    # 1. Cargar el dataset numérico nativo
    df = load_and_clean_data()

    X = df.drop(columns=["TARGET"])
    y = df["TARGET"]

    # 2. División en TRES partes: 60% train / 20% validation / 20% test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.40, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
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

    # --- Búsqueda del umbral óptimo sobre VALIDACIÓN (no sobre test) ---
    y_val_prob = pipeline.predict_proba(X_val)[:, 1]

    precisions, recalls, thresholds = precision_recall_curve(
        y_val, y_val_prob, pos_label=1
    )
    # precision_recall_curve calcula P y R para la clase positiva (1);
    # como te interesa la clase 0 (Desamparo), es más directo barrer
    # manualmente y evaluar F1 de la clase 0 en cada punto:

    mejor_umbral, mejor_f1_clase0 = 0.5, 0.0
    for t in np.arange(0.50, 0.99, 0.01):
        y_val_pred = np.where(y_val_prob >= t, 1, 0)
        f1_clase0 = f1_score(y_val, y_val_pred, pos_label=0, zero_division=0)
        if f1_clase0 > mejor_f1_clase0:
            mejor_f1_clase0, mejor_umbral = f1_clase0, t

    print(
        f"Umbral óptimo (validación): {mejor_umbral:.2f} — F1 clase 0: {mejor_f1_clase0:.4f}"
    )

    # --- Evaluación final, SOLO AHORA, sobre test (nunca antes visto) ---
    y_test_prob = pipeline.predict_proba(X_test)[:, 1]
    y_test_pred = np.where(y_test_prob >= mejor_umbral, 1, 0)

    print("\n================ MATRIZ DE CONFUSIÓN (UMBRAL VALIDADO) ==================")
    print(confusion_matrix(y_test, y_test_pred))
    print("\n================ REPORTE DE CLASIFICACIÓN ================ ")
    print(classification_report(y_test, y_test_pred))
    print(
        f"Métrica ROC-AUC (Estable y confiable): {roc_auc_score(y_test, y_test_prob):.4f}"
    )

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
