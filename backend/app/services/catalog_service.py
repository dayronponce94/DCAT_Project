# Catálogos oficiales extraídos del SINAIS / Base de Datos histórica

CAT_ESCOLARIDAD = {
    0: "SE IGNORA",
    1: "NINGUNA",
    2: "PRIMARIA INCOMPLETA",
    3: "PRIMARIA COMPLETA",
    4: "SECUNDARIA INCOMPLETA",
    5: "SECUNDARIA COMPLETA",
    6: "BACHILLERATO O PREPARATORIA COMPLETA",
    7: "PROFESIONAL",
    8: "POSGRADO",
    9: "NO ESPECIFICADO",
}

CAT_DERECHOHABIENCIA = {
    0: "NO ESPECIFICADA",
    1: "NINGUNA",
    2: "IMSS",
    3: "ISSSTE",
    4: "PEMEX",
    5: "SECRETARIA DE LA DEFENSA NACIONAL",
    6: "SECRETARIA DE MARINA",
    7: "SEGURO POPULAR",
    8: "OTRA",
    9: "IMSS PROSPERA",
    10: "IMSS OPORTUNIDADES",
    11: "ISSFAM",
}

CAT_ESTADO_CONYUGAL = {
    0: "SE IGNORA",
    1: "SOLTERA",
    2: "VIUDA",
    3: "DIVORCIADA",
    4: "UNION LIBRE",
    5: "CASADA",
    9: "NO ESPECIFICADO",
}

# Diccionario rápido para los nombres de las entidades federativas (Códigos INEGI)
CAT_ENTIDADES = {
    1: "Aguascalientes",
    2: "Baja California",
    3: "Baja California Sur",
    4: "Campeche",
    5: "Coahuila",
    6: "Colima",
    7: "Chiapas",
    8: "Chihuahua",
    9: "Ciudad de México",
    10: "Durango",
    11: "Guanajuato",
    12: "Guerrero",
    13: "Hidalgo",
    14: "Jalisco",
    15: "México",
    16: "Michoacán",
    17: "Morelos",
    18: "Nayarit",
    19: "Nuevo León",
    20: "Oaxaca",
    21: "Puebla",
    22: "Querétaro",
    23: "Quintana Roo",
    24: "San Luis Potosí",
    25: "Sinaloa",
    26: "Sonora",
    27: "Tabasco",
    28: "Tamaulipas",
    29: "Tlaxcala",
    30: "Veracruz",
    31: "Yucatán",
    32: "Zacatecas",
}


def translate_feature_name(feature_binary_name: str) -> str:
    """
    Toma un nombre de característica transformado (ej. 'ESCOLARIDAD_1')
    y lo traduce a un formato legible por un médico (ej. 'Escolaridad: NINGUNA').
    """
    # Si es la edad, la devolvemos limpia directamente
    if feature_binary_name == "EDAD":
        return "Edad de la paciente"

    try:
        # Separamos el nombre de la variable y el ID (ej. 'ESCOLARIDAD' y '1')
        parts = feature_binary_name.rsplit("_", 1)
        if len(parts) != 2:
            return feature_binary_name

        variable, str_id = parts
        cat_id = int(str_id)

        if variable == "ESCOLARIDAD":
            return f"Escolaridad: {CAT_ESCOLARIDAD.get(cat_id, 'Desconocido')}"
        elif variable == "DERECHOHABIENCIA":
            return (
                f"Derechohabiencia: {CAT_DERECHOHABIENCIA.get(cat_id, 'Desconocido')}"
            )
        elif variable == "ESTADO_CONYUGAL":
            return f"Estado Conyugal: {CAT_ESTADO_CONYUGAL.get(cat_id, 'Desconocido')}"
        elif variable == "ENTIDAD_OCURRENCIA":
            return f"Entidad de Ocurrencia: {CAT_ENTIDADES.get(cat_id, 'Desconocido')}"

        return feature_binary_name
    except Exception:
        return feature_binary_name
