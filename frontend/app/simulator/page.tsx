"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import { pdf } from '@react-pdf/renderer';
import { generarRecomendaciones } from '@/app/lib/recommendations';
import { PDFReportDocument } from '@/app/reports/PDFDocument';


interface FactorSHAP {
    caracteristica_binaria: string;
    caracteristica_traducida: string;
    impacto_shap: number;
    direccion: string;
}

interface FactorLIME {
    regla_lime: string;
    impacto_probabilidad: number;
    efecto: string;
}

interface XAIResponse {
    probabilidad_atencion_medica: number;
    probabilidad_riesgo_desamparo: number;
    analisis_explicable_xai: FactorSHAP[];
    analisis_lime: FactorLIME[];
    narrativa_clinica: string;
}

export default function Home() {
    const [formData, setFormData] = useState({
        EDAD: 18,
        ESTADO_CONYUGAL: 1,
        ESCOLARIDAD: 1,
        DERECHOHABIENCIA: 0,
        ENTIDAD_OCURRENCIA: 1,
    });

    const [result, setResult] = useState<XAIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/predict-explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Error en el motor analítico.");
            const jsonRes = await response.json();
            if (jsonRes.success) setResult(jsonRes.data);
        } catch (err: any) {
            setError(err.message || "Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    const getRiskBadge = (prob: number) => {
        if (prob >= 0.5) return { text: "Riesgo Alto de Desamparo", bg: "bg-red-100", border: "border-red-300", textCol: "text-red-800", badge: "bg-red-600" };
        if (prob >= 0.2) return { text: "Riesgo Moderado", bg: "bg-amber-100", border: "border-amber-300", textCol: "text-amber-800", badge: "bg-amber-600" };
        return { text: "Riesgo Bajo de Desamparo", bg: "bg-emerald-100", border: "border-emerald-300", textCol: "text-emerald-800", badge: "bg-emerald-600" };
    };

    // Helper para extraer el valor numérico porcentual de LIME independientemente de la clave recibida
    const getLimeValue = (item?: FactorLIME): number => {
        if (!item) return 0;
        return (item.impacto_probabilidad ?? 0) * 100;
    };

    const getLimeLabel = (item?: FactorLIME): string => {
        if (!item) return "N/A";
        return item.regla_lime;
    };

    const handleExportPDF = async () => {
        // 1. Validar que exista un resultado de la API
        if (!result) return;

        // 2. Mapear los factores SHAP desde el estado `result`
        const factoresShap = result.analisis_explicable_xai.map((item) => ({
            caracteristica_traducida: item.caracteristica_traducida,
            caracteristica_binaria: item.caracteristica_binaria,
            impacto_shap: item.impacto_shap,
        }));

        // 3. Generar las recomendaciones dinámicas según el riesgo y SHAP
        const recomendaciones = generarRecomendaciones(
            result.probabilidad_riesgo_desamparo,
            factoresShap
        );

        // 4. Adaptar el objeto de datos para la plantilla del PDF
        const resultadoPredictivoAdaptado = {
            probabilidad_riesgo_desamparo: result.probabilidad_riesgo_desamparo,
            probabilidad_atencion_medica: result.probabilidad_atencion_medica,
            analisis_explicable_xai: result.analisis_explicable_xai,
            analisis_lime: result.analisis_lime,
            narrativa_clinica: result.narrativa_clinica,
        };

        // 5. Renderizar y descargar el PDF de forma directa
        const blob = await pdf(
            <PDFReportDocument
                datosPaciente={formData}
                resultadoPredictivo={resultadoPredictivoAdaptado}
                recomendaciones={recomendaciones}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ficha_Oficial_Riesgo_${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sistema DSS - Salud Pública (XAI)</h1>
                        <p className="text-slate-600">Simulador de Riesgo de Desamparo Institucional y Auditoría de Explicabilidad</p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al Menú Principal
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-900">Perfil del Paciente</h2>
                            <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-1 rounded">Simulador Activo</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Edad ({formData.EDAD} años)</label>
                                <input
                                    type="range"
                                    name="EDAD"
                                    min="10"
                                    max="50"
                                    value={formData.EDAD}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridad</label>
                                <select name="ESCOLARIDAD" value={formData.ESCOLARIDAD} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm">
                                    <option value="0">NO ESPECIFICADA</option>
                                    <option value="1">NINGUNA</option>
                                    <option value="2">PREESCOLAR</option>
                                    <option value="3">PRIMARIA INCOMPLETA</option>
                                    <option value="4">PRIMARIA COMPLETA</option>
                                    <option value="5">SECUNDARIA INCOMPLETA</option>
                                    <option value="6">SECUNDARIA COMPLETA</option>
                                    <option value="7">BACHILLERATO O PREPARATORIA INCOMPLETA</option>
                                    <option value="8">BACHILLERATO O PREPARATORIA COMPLETA</option>
                                    <option value="9">PROFESIONAL</option>
                                    <option value="10">POSGRADO</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Derechohabiencia</label>
                                <select name="DERECHOHABIENCIA" value={formData.DERECHOHABIENCIA} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm">
                                    <option value="0">NO ESPECIFICADA</option>
                                    <option value="1">NINGUNA</option>
                                    <option value="2">IMSS</option>
                                    <option value="3">ISSSTE</option>
                                    <option value="4">PEMEX</option>
                                    <option value="5">SECRETARIA DE LA DEFENSA NACIONAL</option>
                                    <option value="6">SECRETARIA DE MARINA</option>
                                    <option value="7">SEGURO POPULAR</option>
                                    <option value="8">OTRA</option>
                                    <option value="9">IMSS PROSPERA</option>
                                    <option value="10">IMSS OPORTUNIDADES</option>
                                    <option value="11">ISSFAM</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado Conyugal</label>
                                <select name="ESTADO_CONYUGAL" value={formData.ESTADO_CONYUGAL} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm">
                                    <option value="0">SE IGNORA</option>
                                    <option value="1">SOLTERO</option>
                                    <option value="2">DIVORCIADO</option>
                                    <option value="3">VIUDO</option>
                                    <option value="4">UNION LIBRE</option>
                                    <option value="5">CASADO</option>
                                    <option value="6">SEPARADO</option>
                                    <option value="8">NO APLICA A MENORES DE 12 AÑOS</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Entidad de Ocurrencia</label>
                                <select name="ENTIDAD_OCURRENCIA" value={formData.ENTIDAD_OCURRENCIA} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm">
                                    <option value="1">AGUASCALIENTES</option>
                                    <option value="2">BAJA CALIFORNIA</option>
                                    <option value="3">BAJA CALIFORNIA SUR</option>
                                    <option value="4">CAMPECHE</option>
                                    <option value="7">CHIAPAS</option>
                                    <option value="8">CHIHUAHUA</option>
                                    <option value="9">CIUDAD DE MÉXICO</option>
                                    <option value="5">COAHUILA</option>
                                    <option value="6">COLIMA</option>
                                    <option value="10">DURANGO</option>
                                    <option value="33">ESTADOS UNIDOS DE NORTEAMÉRICA</option>
                                    <option value="11">GUANAJUATO</option>
                                    <option value="12">GUERRERO</option>
                                    <option value="13">HIDALGO</option>
                                    <option value="14">JALISCO</option>
                                    <option value="16">MICHOACÁN</option>
                                    <option value="17">MORELOS</option>
                                    <option value="15">MÉXICO</option>
                                    <option value="18">NAYARIT</option>
                                    <option value="19">NUEVO LEÓN</option>
                                    <option value="20">OAXACA</option>
                                    <option value="21">PUEBLA</option>
                                    <option value="22">QUERÉTARO</option>
                                    <option value="23">QUINTANA ROO</option>
                                    <option value="24">SAN LUIS POTOSÍ</option>
                                    <option value="25">SINALOA</option>
                                    <option value="26">SONORA</option>
                                    <option value="27">TABASCO</option>
                                    <option value="28">TAMAULIPAS</option>
                                    <option value="29">TLAXCALA</option>
                                    <option value="30">VERACRUZ</option>
                                    <option value="31">YUCATÁN</option>
                                    <option value="32">ZACATECAS</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-400 shadow-sm">
                                {loading ? "Calculando Diagnóstico..." : "Evaluar Perfil en Modelo XAI"}
                            </button>
                        </form>
                        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
                    </div>

                    {/* Resultados */}
                    <div className="lg:col-span-2 space-y-6">
                        {!result ? (
                            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
                                Modifique las variables sociodemográficas y ejecute la evaluación para visualizar el diagnóstico de riesgo y la auditoría explicable.
                            </div>
                        ) : (
                            <>
                                {/* CAPA 1: RESUMEN EJECUTIVO */}
                                {(() => {
                                    const risk = getRiskBadge(result.probabilidad_riesgo_desamparo);
                                    return (
                                        <div className={`p-6 rounded-xl border ${risk.border} ${risk.bg} shadow-sm transition-all`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-block w-3 h-3 rounded-full ${risk.badge}`}></span>
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${risk.textCol}`}>Categoría de Riesgo Epidemiológico</span>
                                                    </div>
                                                    <h3 className={`text-2xl font-bold ${risk.textCol}`}>{risk.text}</h3>
                                                    <p className="text-xs text-slate-600 mt-1">Modelo activo: <strong>Random Forest (Class Weight Balanced)</strong></p>
                                                </div>
                                                <div className="text-left sm:text-right bg-white/80 p-3 rounded-lg border border-slate-200/50 backdrop-blur-xs">
                                                    <span className="block text-xs font-semibold text-slate-500">Probabilidad de Desamparo</span>
                                                    <span className="text-3xl font-extrabold text-slate-900">{(result.probabilidad_riesgo_desamparo * 100).toFixed(2)}%</span>
                                                    <span className="block text-[11px] text-slate-500 mt-0.5">Atención médica: {(result.probabilidad_atencion_medica * 100).toFixed(2)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* CAPA 2: NARRATIVA Y RECOMENDACIÓN CLÍNICA (LIME TABULAR) */}
                                <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-6 rounded-xl shadow-md text-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-indigo-300">Diagnóstico e Interpretación Clínica</h3>
                                        <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">Lenguaje Natural</span>
                                    </div>

                                    <p className="text-sm bg-slate-800/60 p-4 rounded-lg border border-slate-700/60 mb-5 leading-relaxed text-slate-200">
                                        {result.narrativa_clinica}
                                    </p>
                                </div>

                                {/* Sección de Recomendaciones de Precisión */}
                                {result && (
                                    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Recomendaciones de Precisión e Intervención
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {/* Protocolo Clínico */}
                                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                                                    Protocolo Clínico Prioritario
                                                </h4>

                                                {/* 1. Obtenemos y filtramos la lista de recomendaciones */}
                                                {(() => {
                                                    const recsClinicas = generarRecomendaciones(result.probabilidad_riesgo_desamparo, result.analisis_explicable_xai)
                                                        .filter(r => r.nivel === 'CLINICO');

                                                    {/* 2. Aplicamos la condición por longitud */ }
                                                    return recsClinicas.length > 0 ? (
                                                        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                                                            {recsClinicas.map((rec, idx) => (
                                                                <li key={idx}>
                                                                    <strong className="text-slate-800">{rec.titulo}:</strong> {rec.descripcion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        /* Mensaje alternativo si el arreglo viene vacío */
                                                        <p className="text-xs text-slate-400 italic pl-1">
                                                            Sin recomendaciones clínicas adicionales para este perfil.
                                                        </p>
                                                    );
                                                })()}
                                            </div>


                                            {/* Política Pública */}
                                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                                    Política Pública y Protección Social
                                                </h4>

                                                {/* 1. Obtenemos y filtramos la lista para políticas públicas */}
                                                {(() => {
                                                    const recsPoliticas = generarRecomendaciones(result.probabilidad_riesgo_desamparo, result.analisis_explicable_xai)
                                                        .filter(r => r.nivel === 'POLITICA_PUBLICA');

                                                    {/* 2. Evaluamos la longitud del arreglo */ }
                                                    return recsPoliticas.length > 0 ? (
                                                        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                                                            {recsPoliticas.map((rec, idx) => (
                                                                <li key={idx}>
                                                                    <strong className="text-slate-800">{rec.titulo}:</strong> {rec.descripcion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        /* Texto de escape idéntico al solicitado en formato web */
                                                        <p className="text-xs text-slate-400 italic pl-1">
                                                            Sin recomendaciones de política pública adicionales.
                                                        </p>
                                                    );
                                                })()}
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* CAPA 3: AUDITORÍA TÉCNICA Y MATEMÁTICA */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <button
                                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                        className="w-full p-4 bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-semibold text-sm flex justify-between items-center transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Auditoría Técnica y Fundamentación Matemática (SHAP Log-Odds & LIME)
                                        </span>
                                        <span className="text-xs text-indigo-600 font-normal">
                                            {showTechnicalDetails ? "Ocultar panel técnico ▲" : "Desplegar panel técnico ▼"}
                                        </span>
                                    </button>

                                    {showTechnicalDetails && (
                                        <div className="p-6 space-y-8 border-t border-slate-200">
                                            {/* Gráfico SHAP */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-1">Valores de Atribución Local SHAP (Shapley Additive exPlanations)</h4>
                                                <p className="text-xs text-slate-500 mb-4">
                                                    Mide la contribución marginal exacta de cada característica a la salida del modelo. Expresado en unidades de <strong>Log-Odds</strong>.
                                                </p>

                                                <div className="h-60">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={result.analisis_explicable_xai.map(item => {
                                                                const isEdad = item.caracteristica_traducida.toLowerCase().includes("edad");
                                                                return {
                                                                    ...item,
                                                                    caracteristica_traducida: isEdad ? `Edad: ${formData.EDAD} años` : item.caracteristica_traducida
                                                                };
                                                            })}
                                                            layout="vertical"
                                                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis type="number" />
                                                            <YAxis dataKey="caracteristica_traducida" type="category" width={180} style={{ fontSize: '11px' }} />
                                                            <Tooltip
                                                                formatter={(value: any) => [Number(value).toFixed(4), "Valor SHAP (Log-Odds)"]}
                                                            />
                                                            <ReferenceLine x={0} stroke="#64748b" />
                                                            <Bar dataKey="impacto_shap">
                                                                {result.analisis_explicable_xai.map((entry, index) => (
                                                                    <Cell
                                                                        key={`cell-shap-${index}`}
                                                                        fill={entry.impacto_shap > 0 ? "#ef4444" : "#10b981"}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Gráfico LIME */}
                                            <div className="pt-6 border-t border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-900 mb-1">Ponderación Local de Importancia LIME (Local Interpretable Model-agnostic Explanations)</h4>
                                                <p className="text-xs text-slate-500 mb-4">
                                                    Modelo sustituto lineal ajustado localmente alrededor del perfil evaluado. Expresado en <strong>porcentaje de impacto en riesgo</strong>.
                                                </p>

                                                <div className="h-60">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            /* 
                                                              Mapeamos el arreglo de SHAP para asegurar que LIME use exactamente 
                                                              los mismos nombres de variables ("Escolaridad: NINGUNA") y el mismo orden.
                                                            */
                                                            data={result.analisis_explicable_xai.map((shapItem, i) => {
                                                                const limeMatch = result.analisis_lime?.[i];
                                                                const val = getLimeValue(limeMatch);
                                                                const isEdad = shapItem.caracteristica_traducida.toLowerCase().includes("edad");

                                                                return {
                                                                    label: isEdad ? `Edad: ${formData.EDAD} años` : shapItem.caracteristica_traducida,
                                                                    impacto_lime: val
                                                                };
                                                            })}
                                                            layout="vertical"
                                                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis type="number" unit="%" />
                                                            {/* Ahora el YAxis lee la propiedad 'label' que contiene el formato limpio de SHAP */}
                                                            <YAxis dataKey="label" type="category" width={180} style={{ fontSize: '11px' }} />
                                                            <Tooltip
                                                                formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "Impacto LIME"]}
                                                            />
                                                            <ReferenceLine x={0} stroke="#64748b" />
                                                            <Bar dataKey="impacto_lime">
                                                                {/* 
                      Pintamos las celdas recorriendo el arreglo de SHAP 
                      para mantener sincronía total con la propiedad 'data' del gráfico
                    */}
                                                                {result.analisis_explicable_xai.map((_, index) => {
                                                                    const limeMatch = result.analisis_lime?.[index];
                                                                    const val = getLimeValue(limeMatch);
                                                                    return (
                                                                        <Cell
                                                                            key={`cell-lime-${index}`}
                                                                            fill={val > 0 ? "#ef4444" : "#10b981"}
                                                                        />
                                                                    );
                                                                })}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>


                                            {/* Tabla Comparativa SHAP vs LIME */}
                                            <div className="pt-6 border-t border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-900 mb-2">Convergencia Inter-metodológica (SHAP vs. LIME)</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                                                <th className="p-2 font-semibold">Variable</th>
                                                                <th className="p-2 font-semibold">SHAP (Log-Odds)</th>
                                                                <th className="p-2 font-semibold">Efecto en Riesgo (SHAP)</th>
                                                                <th className="p-2 font-semibold">LIME (% Riesgo)</th>
                                                                <th className="p-2 font-semibold">Efecto en Riesgo (LIME)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {result.analisis_explicable_xai.map((shapItem, i) => {
                                                                const limeMatch = result.analisis_lime?.[i];
                                                                const limeVal = getLimeValue(limeMatch);
                                                                const isEdad = shapItem.caracteristica_traducida.toLowerCase().includes("edad");
                                                                const nombreVariable = isEdad ? `Edad: ${formData.EDAD} años` : shapItem.caracteristica_traducida;

                                                                return (
                                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                                        {/* 1. Variable */}
                                                                        <td className="p-2 font-medium text-slate-800">{nombreVariable}</td>

                                                                        {/* 2. SHAP (Log-Odds) */}
                                                                        <td className="p-2 font-mono text-slate-600">{shapItem.impacto_shap.toFixed(4)}</td>

                                                                        {/* 3. Efecto en Riesgo (SHAP) */}
                                                                        <td className="p-2">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shapItem.impacto_shap > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                                {shapItem.impacto_shap > 0 ? 'Aumenta Desamparo' : 'Disminuye Desamparo'}
                                                                            </span>
                                                                        </td>

                                                                        {/* 4. LIME (% Riesgo) */}
                                                                        <td className="p-2 font-mono text-slate-600">
                                                                            {limeMatch ? `${limeVal > 0 ? '+' : ''}${limeVal.toFixed(2)}%` : 'N/A'}
                                                                        </td>

                                                                        {/* 5. Efecto en Riesgo (LIME) */}
                                                                        <td className="p-2">
                                                                            {limeMatch ? (
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${limeVal > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                                    {limeVal > 0 ? 'Aumenta Desamparo' : 'Disminuye Desamparo'}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">
                                                                                    Sin Datos
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Botón Destacado de Exportación */}
            {/* Cambiamos justify-end por justify-center y agregamos mt-6 para despegarlo */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-md transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Ficha Oficial en PDF
                </button>
            </div>

        </main>
    );
}