export interface Recomendacion {
    nivel: "CLINICO" | "POLITICA_PUBLICA";
    titulo: string;
    descripcion: string;
    prioridad: "ALTA" | "MEDIA" | "BAJA";
}

export function generarRecomendaciones(
    probabilidadRiesgo: number,
    factoresShap: Array<{ caracteristica_traducida?: string; caracteristica_binaria?: string; impacto_shap: number }>
): Recomendacion[] {
    const recomendaciones: Recomendacion[] = [];

    // 1. Regla global por probabilidad de riesgo
    if (probabilidadRiesgo >= 0.6) {
        recomendaciones.push({
            nivel: "CLINICO",
            titulo: "Activación de Protocolo de Alerta Temprana",
            descripcion: "El perfil presenta un riesgo elevado de desamparo institucional. Se recomienda asignación prioritaria a red hospitalaria de tercer nivel y seguimiento por trabajo social.",
            prioridad: "ALTA",
        });
    }

    // 2. Reglas dinámicas por variables SHAP dominantes
    factoresShap.forEach((factor) => {
        const nombre = (factor.caracteristica_traducida || factor.caracteristica_binaria || "").toLowerCase();

        if (nombre.includes("escolaridad") && factor.impacto_shap > 0) {
            recomendaciones.push({
                nivel: "CLINICO",
                titulo: "Adaptación del Consentimiento y Comunicación Intercultural",
                descripcion: "Dado el factor de vulnerabilidad por escolaridad/alfabetización, emplear material explicativo visual y validación verbal activa de la comprensión del tratamiento.",
                prioridad: "ALTA",
            });
            recomendaciones.push({
                nivel: "POLITICA_PUBLICA",
                titulo: "Fortalecimiento de Brigadas Comunitarias Informativas",
                descripcion: "Diseño de campañas territoriales de salud materna con enfoque de equidad educativa en la entidad de ocurrencia.",
                prioridad: "MEDIA",
            });
        }

        if (nombre.includes("derechohabiencia") && factor.impacto_shap > 0) {
            recomendaciones.push({
                nivel: "CLINICO",
                titulo: "Vincular a Convenio de Gratuidad y Afiliación Emergente",
                descripcion: "Iniciar trámite inmediato de adscripción a programas de cobertura pública de salud para garantizar insumos y atención sin barreras financieras.",
                prioridad: "ALTA",
            });
            recomendaciones.push({
                nivel: "POLITICA_PUBLICA",
                titulo: "Garantía de Portabilidad Universal de Salud Materna",
                descripcion: "Asegurar el cumplimiento del Convenio Interinstitucional de Atención de Emergencias Obstétricas en la región sin importar la derechohabiencia.",
                prioridad: "ALTA",
            });
        }
    });

    return recomendaciones;
}