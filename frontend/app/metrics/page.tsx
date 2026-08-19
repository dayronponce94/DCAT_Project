"use client";

import Link from "next/link";

export default function MetricsPage() {
    // Datos reales de evaluación del modelo XGBoost (Muestra N = 4,438)
    const metricsData = {
        accuracy: "91.00%",
        rocAuc: "0.7596",
        f1Score: "0.0100",
        prAuc: "0.0125",
        totalValidation: "4,438",
    };

    const confusionMatrix = {
        tp: { label: "Verdaderos Positivos (Atención Médica)", value: "4,020", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
        fp: { label: "Falsos Positivos (Alerta Innecesaria)", value: "405", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
        fn: { label: "Falsos Negativos (Riesgo No Detectado)", value: "10", color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
        tn: { label: "Verdaderos Negativos (Desamparo Confirmado)", value: "3", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
    };

    const modelMetadata = [
        { label: "Algoritmo Base", value: "XGBoost Classifier" },
        { label: "Técnica de Balanceo", value: "SMOTE / Class Weighting" },
        { label: "Estrategia de Explicabilidad", value: "TreeSHAP + LIME Local" },
        { label: "Variable Objetivo", value: "Presencia de Atención Médica" },
    ];

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Encabezado con Botón de Regreso */}
                <header className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Validación IA
                            </span>
                            <span className="text-xs text-slate-500">Módulo Técnico</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Evaluación y Desempeño Global
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Consola de métricas científicas y auditoría de matriz de confusión del modelo predictivo.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar al Inicio
                    </Link>
                </header>

                {/* Bloque Superior: Métricas de Performance y Ficha Técnica */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta de Métricas Directas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-base font-bold mb-4 text-slate-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Performance Global
                            </h2>
                            <div className="space-y-4">
                                <div className="border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-500 block">Exactitud (Accuracy)</span>
                                    <span className="text-2xl font-bold text-indigo-600">{metricsData.accuracy}</span>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-500 block">Área Bajo la Curva (ROC-AUC)</span>
                                    <span className="text-2xl font-bold text-indigo-600">{metricsData.rocAuc}</span>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-500 block">Área Curva PR (PR-AUC)</span>
                                    <span className="text-2xl font-bold text-indigo-600">{metricsData.prAuc}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">F1-Score (Clase Desamparo)</span>
                                    <span className="text-2xl font-bold text-amber-600">{metricsData.f1Score}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-6 italic">
                            * Muestra de validación externa (N = {metricsData.totalValidation} registros históricos).
                        </p>
                    </div>

                    {/* Matriz de Confusión */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Matriz de Confusión de la Auditoría</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Clasificación cruzada de predicciones vs. eventos reales en salud materna.
                                    </p>
                                </div>
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200">
                                    N = {metricsData.totalValidation}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 font-mono text-sm mt-6">
                                <div className={`p-4 rounded-lg border ${confusionMatrix.tp.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{confusionMatrix.tp.label}</span>
                                    <span className={`text-2xl font-bold ${confusionMatrix.tp.color}`}>{confusionMatrix.tp.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${confusionMatrix.fp.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{confusionMatrix.fp.label}</span>
                                    <span className={`text-2xl font-bold ${confusionMatrix.fp.color}`}>{confusionMatrix.fp.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${confusionMatrix.fn.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{confusionMatrix.fn.label}</span>
                                    <span className={`text-2xl font-bold ${confusionMatrix.fn.color}`}>{confusionMatrix.fn.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${confusionMatrix.tn.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{confusionMatrix.tn.label}</span>
                                    <span className={`text-2xl font-bold ${confusionMatrix.tn.color}`}>{confusionMatrix.tn.value}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Nota epidemiológica:</span> El desbalance de clases (alta proporción de atención frente a desamparo) explica la brecha entre el Accuracy ({metricsData.accuracy}) y el F1-Score de la clase minoritaria ({metricsData.f1Score}).
                        </div>
                    </div>
                </div>

                {/* Ficha de Configuración del Modelo */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-base font-bold text-slate-900 mb-4">Parámetros del Sistema Predictivo</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {modelMetadata.map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-500 block mb-1">{item.label}</span>
                                <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}