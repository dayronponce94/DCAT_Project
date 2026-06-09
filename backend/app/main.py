from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.patient import PatientInput
from app.services.explain_service import get_shap_explanation

app = FastAPI(
    title="DCAT_Project - API de Inferencia Explicable (XAI)",
    description="Backend doctoral para la predicción y auditoría local del riesgo de desamparo en mortalidad materna.",
    version="1.0.0",
)

# Configuración de CORS: Permite que tu frontend en Next.js (normalmente en el puerto 3000) se comunique con FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar por la URL específica de Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Online", "proyecto": "DCAT_Project XAI Backend"}


@app.post(
    "/api/v1/predict-explain",
    summary="Calcula la probabilidad de riesgo y genera el desglose analítico SHAP",
)
def predict_and_explain(patient: PatientInput):
    try:
        # Convertimos el objeto Pydantic a un diccionario clásico de Python
        patient_dict = patient.model_dump()

        # Invocamos el motor analítico de SHAP que calibramos previamente
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
