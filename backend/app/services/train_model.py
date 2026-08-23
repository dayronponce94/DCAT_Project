import os
import time
import pickle
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
    auc,
    f1_score,
    precision_score,
    recall_score,
)
from statsmodels.stats.contingency_tables import mcnemar

from app.services.data_preparation import load_and_clean_data


def evaluate_model_performance(model_name, y_true, y_prob, threshold):
    """
    Calcula e imprime las métricas rigurosas requeridas para publicaciones científicas.
    """
    y_pred = np.where(y_prob >= threshold, 1, 0)

    # 1. Matriz de confusión
    cm = confusion_matrix(y_true, y_pred)

    # 2. ROC-AUC y PR-AUC (Precision-Recall AUC)
    roc_auc = roc_auc_score(y_true, y_prob)

    # Para PR-AUC evaluamos la curva respecto a la clase minoritaria (0 = Desamparo)
    prec_arr, rec_arr, _ = precision_recall_curve(y_true, 1 - y_prob, pos_label=0)
    pr_auc_clase0 = auc(rec_arr, prec_arr)

    # 3. Métricas desglosadas por clase
    prec_0 = precision_score(y_true, y_pred, pos_label=0, zero_division=0)
    rec_0 = recall_score(y_true, y_pred, pos_label=0, zero_division=0)
    f1_0 = f1_score(y_true, y_pred, pos_label=0, zero_division=0)

    prec_1 = precision_score(y_true, y_pred, pos_label=1, zero_division=0)
    rec_1 = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
    f1_1 = f1_score(y_true, y_pred, pos_label=1, zero_division=0)

    print(f"\n==================================================================")
    print(f"         EVALUACIÓN CIENTÍFICA EN TEST SET: {model_name.upper()}")
    print(f"==================================================================")
    print(f"Umbral de Decisión Optimizado : {threshold:.2f}")
    print(f"ROC-AUC Global                : {roc_auc:.4f}")
    print(f"PR-AUC (Clase 0 - Desamparo)  : {pr_auc_clase0:.4f}")
    print("\n---------------- Matriz de Confusión ----------------")
    print(f"TN: {cm[0,0]:<6} | FP: {cm[0,1]:<6}")
    print(f"FN: {cm[1,0]:<6} | TP: {cm[1,1]:<6}")
    print("\n---------------- Métricas por Clase ------------------")
    print(f"CLASE 0 (Desamparo / Sin Atención):")
    print(f"  - Precisión : {prec_0:.4f}")
    print(f"  - Recall    : {rec_0:.4f}")
    print(f"  - F1-Score  : {f1_0:.4f}")
    print(f"\nCLASE 1 (Con Atención Médica):")
    print(f"  - Precisión : {prec_1:.4f}")
    print(f"  - Recall    : {rec_1:.4f}")
    print(f"  - F1-Score  : {f1_1:.4f}")
    print("\n---------------- Reporte de Clasificación ------------")
    print(classification_report(y_true, y_pred, digits=4))

    return y_pred


def optimize_threshold(pipeline, X_val, y_val):
    """
    Busca el umbral óptimo sobre el conjunto de VALIDACIÓN maximizando el F1-Score de la Clase 0.
    """
    y_val_prob = pipeline.predict_proba(X_val)[:, 1]
    mejor_umbral, mejor_f1_clase0 = 0.5, 0.0

    for t in np.arange(0.50, 0.99, 0.01):
        y_val_pred = np.where(y_val_prob >= t, 1, 0)
        f1_clase0 = f1_score(y_val, y_val_pred, pos_label=0, zero_division=0)
        if f1_clase0 > mejor_f1_clase0:
            mejor_f1_clase0, mejor_umbral = f1_clase0, t

    return mejor_umbral, mejor_f1_clase0


def run_mcnemar_test(y_true, y_pred_xgb, y_pred_rf):
    """
    Ejecuta la Prueba Estadística de McNemar entre las predicciones de XGBoost y Random Forest.
    """
    # Construcción de la tabla de contingencia de aciertos y errores cruzados
    correct_xgb = y_pred_xgb == y_true
    correct_rf = y_pred_rf == y_true

    # a: Ambos acertaron, b: XGB acertó y RF falló, c: XGB falló y RF acertó, d: Ambos fallaron
    b = np.sum(correct_xgb & ~correct_rf)
    c = np.sum(~correct_xgb & correct_rf)

    contingency_table = [
        [np.sum(correct_xgb & correct_rf), b],
        [c, np.sum(~correct_xgb & ~correct_rf)],
    ]

    # Prueba de McNemar con corrección de continuidad de Yates
    result = mcnemar(contingency_table, exact=False, correction=True)

    print("\n==================================================================")
    print("      PRUEBA ESTADÍSTICA DE MCNEMAR (XGBoost vs. Random Forest)    ")
    print("==================================================================")
    print(f"Casos donde solo XGBoost acertó (b)   : {b}")
    print(f"Casos donde solo Random Forest acertó (c): {c}")
    print(f"Estadístico Chi-cuadrado de McNemar  : {result.statistic:.4f}")
    print(f"p-valor                              : {result.pvalue:.6e}")

    if result.pvalue < 0.05:
        print(
            "Conclusión: Existe una diferencia ESTADÍSTICAMENTE SIGNIFICATIVA (p < 0.05) entre ambos modelos."
        )
    else:
        print(
            "Conclusión: No existe diferencia estadísticamente significativa entre el rendimiento de ambos clasificadores."
        )


def train_and_compare_models():
    """Pipeline completo de carga, entrenamiento, optimización y evaluación comparativa."""

    # 1. Cargar dataset numérico
    df = load_and_clean_data()
    X = df.drop(columns=["TARGET"])
    y = df["TARGET"]

    # 2. Splits estrictos y estratificados: 60% Train / 20% Val / 20% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.40, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    # 3. Preprocesador OneHotEncoder
    categorical_features = [
        "ESTADO_CONYUGAL",
        "ESCOLARIDAD",
        "DERECHOHABIENCIA",
        "ENTIDAD_OCURRENCIA",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_features,
            )
        ],
        remainder="passthrough",
    )

    # Cálculo del ratio de desbalanceo para XGBoost
    con_atencion = np.sum(y_train == 1)
    sin_atencion = np.sum(y_train == 0)
    ratio_desbalance = con_atencion / sin_atencion

    # =========================================================================
    # BLOQUE 1: ENTRENAMIENTO Y EVALUACIÓN DE XGBOOST
    # =========================================================================
    xgb_model = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.05,
        scale_pos_weight=ratio_desbalance * 2.0,
        random_state=42,
        eval_metric="logloss",
    )
    xgb_pipeline = Pipeline(
        steps=[("preprocessor", preprocessor), ("classifier", xgb_model)]
    )

    print("\n[1/4] Entrenando XGBoost...")
    start_train_xgb = time.time()
    xgb_pipeline.fit(X_train, y_train)
    time_train_xgb = time.time() - start_train_xgb

    # Optimización de umbral sobre validación
    umbral_xgb, f1_val_xgb = optimize_threshold(xgb_pipeline, X_val, y_val)
    print(
        f"  -> Umbral óptimo XGBoost (Validación): {umbral_xgb:.2f} (F1 Clase 0: {f1_val_xgb:.4f})"
    )

    # Inferencia y evaluación en Test Set
    start_inf_xgb = time.time()
    y_test_prob_xgb = xgb_pipeline.predict_proba(X_test)[:, 1]
    time_inf_xgb = time.time() - start_inf_xgb

    y_pred_test_xgb = evaluate_model_performance(
        "XGBoost Classifier", y_test, y_test_prob_xgb, umbral_xgb
    )

    # =========================================================================
    # BLOQUE 2: ENTRENAMIENTO Y EVALUACIÓN DE RANDOM FOREST
    # =========================================================================
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    rf_pipeline = Pipeline(
        steps=[("preprocessor", preprocessor), ("classifier", rf_model)]
    )

    print("\n[2/4] Entrenando Random Forest...")
    start_train_rf = time.time()
    rf_pipeline.fit(X_train, y_train)
    time_train_rf = time.time() - start_train_rf

    # Optimización de umbral sobre validación
    umbral_rf, f1_val_rf = optimize_threshold(rf_pipeline, X_val, y_val)
    print(
        f"  -> Umbral óptimo Random Forest (Validación): {umbral_rf:.2f} (F1 Clase 0: {f1_val_rf:.4f})"
    )

    # Inferencia y evaluación en Test Set
    start_inf_rf = time.time()
    y_test_prob_rf = rf_pipeline.predict_proba(X_test)[:, 1]
    time_inf_rf = time.time() - start_inf_rf

    y_pred_test_rf = evaluate_model_performance(
        "Random Forest Classifier", y_test, y_test_prob_rf, umbral_rf
    )

    # =========================================================================
    # BLOQUE 3: COMPARATIVA DE TIEMPOS DE EJECUCIÓN
    # =========================================================================
    print("\n==================================================================")
    print("            COMPARATIVA DE TIEMPOS Y EFICIENCIA COMPUTACIONAL     ")
    print("==================================================================")
    print(
        f"XGBoost       | Entrenamiento: {time_train_xgb:.3f} s | Inferencia (Test): {time_inf_xgb:.4f} s"
    )
    print(
        f"Random Forest | Entrenamiento: {time_train_rf:.3f} s | Inferencia (Test): {time_inf_rf:.4f} s"
    )

    # =========================================================================
    # BLOQUE 4: PRUEBA DE HIPÓTESIS ESTADÍSTICA (MCNEMAR)
    # =========================================================================
    run_mcnemar_test(y_test.values, y_pred_test_xgb, y_pred_test_rf)

    # =========================================================================
    # BLOQUE 5: SERIALIZACIÓN DEL MODELO DE PRODUCCIÓN (Random Forest)
    # =========================================================================
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    model_path = os.path.join(base_dir, "app", "models_ml", "random_forest_model.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(rf_pipeline, f)

    print(
        f"\n[ÉXITO] Pipeline Random Forest (Modelo en Producción) guardado en: {model_path}"
    )


if __name__ == "__main__":
    train_and_compare_models()
