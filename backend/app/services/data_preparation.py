import os
import sqlite3
import pandas as pd
import numpy as np


def get_db_connection():
    """Establece la conexión física con la base de datos SQLite."""
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    db_path = os.path.join(base_dir, "data", "project_db.sqlite")

    if not os.path.exists(db_path):
        raise FileNotFoundError(
            f"No se encontró la base de datos en la ruta: {db_path}"
        )

    conn = sqlite3.connect(db_path)
    return conn


def load_and_clean_data():
    """
    Extrae las columnas numéricas nativas de la base de datos,
    limpia el TARGET de asistencia médica y remueve outliers de edad.
    """
    conn = get_db_connection()

    # 1. Traemos los IDs numéricos directos y la columna de texto objetivo
    query = """
        SELECT 
            EDAD, 
            ESTADO_CONYUGAL, 
            ESCOLARIDAD, 
            DERECHOHABIENCIA,
            ENTIDAD_OCURRENCIA,
            ASISTENCIA_MEDICAD
        FROM mortalidad_materna_2002_2022
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    # 2. Tratamiento de Outliers en Edad (Menores de 50 años)
    df = df[df["EDAD"] < 50].copy()

    # 3. Limpieza de la Variable Objetivo (ASISTENCIA_MEDICAD)
    df["ASISTENCIA_MEDICAD"] = (
        df["ASISTENCIA_MEDICAD"].str.upper().str.strip().str.replace("É", "E")
    )

    mapeo_target = {
        "CON ATENCION MEDICA": 1,
        "CON ASISTENCIA MEDICA": 1,
        "SI": 1,
        "SIN ATENCION MEDICA": 0,
        "SIN ASISTENCIA MEDICA": 0,
        "NO": 0,
    }

    df["TARGET"] = df["ASISTENCIA_MEDICAD"].map(mapeo_target)
    df = df.dropna(subset=["TARGET"])
    df["TARGET"] = df["TARGET"].astype(int)
    df = df.drop(columns=["ASISTENCIA_MEDICAD"])

    # 4. Tratamiento de nulos en los IDs numéricos predictore
    # Si hay algún valor faltante, lo rellenamos con 0 (que suele mapear a "Se ignora" o "No especificado")
    predictors = [
        "ESTADO_CONYUGAL",
        "ESCOLARIDAD",
        "DERECHOHABIENCIA",
        "ENTIDAD_OCURRENCIA",
    ]
    for col in predictors:
        df[col] = df[col].fillna(0).astype(int)

    return df


if __name__ == "__main__":
    try:
        data = load_and_clean_data()
        print("\n[ÉXITO] Datos numéricos nativos procesados correctamente.")
        print(f"Dimensiones: {data.shape[0]} filas, {data.shape[1]} columnas.")
        print("\nColumnas listas para la IA:", list(data.columns))
    except Exception as e:
        print(f"\n[ERROR]: {e}")
