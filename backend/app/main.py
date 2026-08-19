from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.patient import PatientInput
from app.services.explain_service import get_shap_explanation
from app.services.bi_service import calculate_real_socioeconomic_metrics

app = FastAPI(
    title="DCAT_Project - API de Inferencia Explicable (XAI) y BI",
    description="Backend doctoral para la predicción, auditoría local del riesgo y analítica socioeconómica.",
    version="1.0.0",
)

# Configuración de CORS para permitir la conexión con el frontend en Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar por la URL específica
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Online", "proyecto": "DCAT_Project XAI & BI Backend"}


@app.post(
    "/api/v1/predict-explain",
    summary="Calcula la probabilidad de riesgo y genera el desglose analítico SHAP",
)
def predict_and_explain(patient: PatientInput):
    try:
        patient_dict = patient.model_dump()
        result = get_shap_explanation(patient_dict)
        return {"success": True, "data": result}
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno: Modelo predictivo no encontrado. {str(fnf)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Fallo en el procesamiento del motor XAI: {str(e)}"
        )


@app.get(
    "/api/v1/socioeconomic-metrics",
    summary="Obtiene indicadores macro reales y agregaciones socioeconómicas poblacionales",
)
def get_socioeconomic_metrics(
    entidad: int = Query(
        0, description="Filtrar por Entidad de Ocurrencia (0 para todas)"
    )
):
    try:
        # Llamada directa al procesamiento en tiempo real sobre el DataFrame
        metrics = calculate_real_socioeconomic_metrics(entidad=entidad)
        return {"success": True, "data": metrics}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al calcular métricas analíticas reales: {str(e)}",
        )
