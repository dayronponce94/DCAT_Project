from pydantic import BaseModel, Field


class PatientInput(BaseModel):
    EDAD: int = Field(
        ...,
        ge=0,
        le=50,
        description="Edad de la paciente (acotado a menores de 50 años por criterios del modelo)",
    )
    ESTADO_CONYUGAL: int = Field(
        ..., description="ID nominal del estado conyugal según catálogo SINAIS"
    )
    ESCOLARIDAD: int = Field(..., description="ID nominal del nivel de escolaridad")
    DERECHOHABIENCIA: int = Field(
        ..., description="ID de la institución de derechohabiencia"
    )
    ENTIDAD_OCURRENCIA: int = Field(
        ..., description="ID de la entidad federativa donde ocurrió el deceso"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "EDAD": 18,
                "ESTADO_CONYUGAL": 1,
                "ESCOLARIDAD": 1,
                "DERECHOHABIENCIA": 0,
                "ENTIDAD_OCURRENCIA": 1,
            }
        }
