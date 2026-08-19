import pandas as pd
import numpy as np
from app.services.data_preparation import load_and_clean_data

# Diccionarios de mapeo categórico para traducir los IDs numéricos a etiquetas legibles
MAPA_ESCOLARIDAD = {
    0: "NO ESPECIFICADA",
    1: "NINGUNA",
    2: "BACHILLERATO O PREPARATORIA COMPLETA",
    3: "BACHILLERATO O PREPARATORIA INCOMPLETA",
    4: "POSGRADO",
    5: "PREESCOLAR",
    6: "PRIMARIA COMPLETA",
    7: "PRIMARIA INCOMPLETA",
    8: "PROFESIONAL",
    9: "SECUNDARIA COMPLETA",
    10: "SECUNDARIA INCOMPLETA",
}

MAPA_DERECHOHABIENCIA = {
    0: "NO ESPECIFICADA",
    1: "NINGUNA",
    2: "IMSS",
    3: "IMSS OPORTUNIDADES",
    4: "IMSS PROSPERA",
    5: "ISSFAM",
    6: "ISSSTE",
    7: "OTRA",
    8: "PEMEX",
    9: "SECRETARIA DE LA DEFENSA NACIONAL",
    10: "SECRETARIA DE MARINA",
    11: "SEGURO POPULAR",
}

MAPA_ESTADO_CONYUGAL = {
    0: "SE IGNORA",
    1: "SOLTERO/A",
    2: "DIVORCIADO/A",
    3: "VIUDO/A",
    4: "UNIÓN LIBRE",
    5: "CASADO/A",
    6: "SEPARADO/A",
    8: "NO APLICA (<12 AÑOS)",
}


def calculate_real_socioeconomic_metrics(entidad: int = 0):
    """
    Carga el DataFrame real y calcula los indicadores socioeconómicos agregados.
    TARGET == 1: Con Atención Médica
    TARGET == 0: Sin Atención Médica (Riesgo de Desamparo)
    """
    df = load_and_clean_data()

    # Filtrar por Entidad de Ocurrencia si se selecciona una en específico
    if entidad != 0 and "ENTIDAD_OCURRENCIA" in df.columns:
        df = df[df["ENTIDAD_OCURRENCIA"] == entidad]

    total_casos = int(len(df))
    if total_casos == 0:
        return {"error": "No hay datos para la entidad seleccionada."}

    # 1. KPIs Globales Reales
    # Recordamos que TARGET = 0 representa Desamparo / Sin Atención
    casos_desamparo = int((df["TARGET"] == 0).sum())
    casos_atencion = int((df["TARGET"] == 1).sum())

    tasa_desamparo_global = round((casos_desamparo / total_casos) * 100, 2)
    cobertura_medica = round((casos_atencion / total_casos) * 100, 2)

    # Cálculo del grupo de edad de mayor riesgo real
    bins = [0, 19, 29, 39, 100]
    labels = ["< 20 años", "20 - 29 años", "30 - 39 años", "40+ años"]
    df["RANGO_EDAD"] = pd.cut(df["EDAD"], bins=bins, labels=labels, right=True)

    riesgo_por_edad = df.groupby("RANGO_EDAD", observed=False)["TARGET"].apply(
        lambda x: (x == 0).mean() * 100
    )
    grupo_edad_mayor_riesgo = (
        str(riesgo_por_edad.idxmax()) if not riesgo_por_edad.empty else "N/A"
    )

    # 2. Agregación Real por Escolaridad
    por_escolaridad = []
    if "ESCOLARIDAD" in df.columns:
        grp_esc = (
            df.groupby("ESCOLARIDAD")
            .agg(
                total_pacientes=("TARGET", "count"),
                casos_desamparo=("TARGET", lambda x: (x == 0).sum()),
            )
            .reset_index()
        )

        for _, row in grp_esc.iterrows():
            codigo = int(row["ESCOLARIDAD"])
            total_p = int(row["total_pacientes"])
            riesgo = (
                round((row["casos_desamparo"] / total_p) * 100, 2)
                if total_p > 0
                else 0.0
            )

            por_escolaridad.append(
                {
                    "nivel": MAPA_ESCOLARIDAD.get(codigo, f"Código {codigo}"),
                    "riesgo_medio": riesgo,
                    "total_pacientes": total_p,
                }
            )

    # 3. Agregación Real por Derechohabiencia
    por_derechohabiencia = []
    if "DERECHOHABIENCIA" in df.columns:
        grp_der = df["DERECHOHABIENCIA"].value_counts().reset_index()
        grp_der.columns = ["DERECHOHABIENCIA", "casos"]

        for _, row in grp_der.iterrows():
            codigo = int(row["DERECHOHABIENCIA"])
            casos = int(row["casos"])
            porcentaje = round((casos / total_casos) * 100, 2)

            por_derechohabiencia.append(
                {
                    "institucion": MAPA_DERECHOHABIENCIA.get(
                        codigo, f"Código {codigo}"
                    ),
                    "porcentaje": porcentaje,
                }
            )

    # 4. Agregación Real por Estado Conyugal
    por_estado_conyugal = []
    if "ESTADO_CONYUGAL" in df.columns:
        grp_ec = (
            df.groupby("ESTADO_CONYUGAL")
            .agg(
                casos=("TARGET", "count"),
                casos_desamparo=("TARGET", lambda x: (x == 0).sum()),
            )
            .reset_index()
        )

        for _, row in grp_ec.iterrows():
            codigo = int(row["ESTADO_CONYUGAL"])
            casos = int(row["casos"])
            riesgo = (
                round((row["casos_desamparo"] / casos) * 100, 2) if casos > 0 else 0.0
            )

            por_estado_conyugal.append(
                {
                    "estado": MAPA_ESTADO_CONYUGAL.get(codigo, f"Código {codigo}"),
                    "casos": casos,
                    "riesgo": riesgo,
                }
            )

    return {
        "kpis": {
            "total_casos": total_casos,
            "tasa_desamparo_global": tasa_desamparo_global,
            "cobertura_medica": cobertura_medica,
            "grupo_edad_mayor_riesgo": grupo_edad_mayor_riesgo,
        },
        "por_escolaridad": por_escolaridad,
        "por_derechohabiencia": por_derechohabiencia,
        "por_estado_conyugal": por_estado_conyugal,
    }
