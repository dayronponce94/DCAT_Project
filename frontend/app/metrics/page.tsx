"use client";

import Link from "next/link";

export default function MetricsPage() {
    // 1. Datos comparativos obtenidos del Test Set (N = 4,438)
    const comparisonData = [
        {
            metric: "Exactitud (Accuracy)",
            xgb: "88.94%",
            rf: "74.25%",
            winner: "xgb",
            note: "Engañoso por desbalance (91/9)",
        },
        {
            metric: "ROC-AUC Global",
            xgb: "0.7413",
            rf: "0.7381",
            winner: "xgb",
            note: "Capacidad de discriminación similar",
        },
        {
            metric: "PR-AUC (Clase 0 - Desamparo)",
            xgb: "0.2477",
            rf: "0.2466",
            winner: "xgb",
            note: "Evaluado en la clase minoritaria",
        },
        {
            metric: "Recall / Sensibilidad (Clase 0)",
            xgb: "21.57%",
            rf: "62.01%",
            winner: "rf",
            note: "RF detecta casi 3x más casos de riesgo",
        },
        {
            metric: "Precisión (Clase 0)",
            xgb: "33.98%",
            rf: "20.39%",
            winner: "xgb",
            note: "RF genera más alertas preventivas",
        },
        {
            metric: "F1-Score (Clase 0 - Desamparo)",
            xgb: "0.2639",
            rf: "0.3069",
            winner: "rf",
            note: "Métrica clave de balance clínico",
        },
        {
            metric: "Tiempo de Inferencia (Test)",
            xgb: "0.0217 s",
            rf: "0.1077 s",
            winner: "xgb",
            note: "Ambos sub-segundo en producción",
        },
    ];

    // 2. Matriz de confusión del modelo elegido para producción (Random Forest)
    const rfConfusionMatrix = {
        tn: { label: "Verdaderos Negativos (Desamparo Detectado)", value: "253", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        fp: { label: "Falsos Positivos (Alerta Innecesaria)", value: "155", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
        fn: { label: "Falsos Negativos (Riesgo No Detectado)", value: "988", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
        tp: { label: "Verdaderos Positivos (Atención Confirmada)", value: "3,042", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Encabezado */}
                <header className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Benchmarking Causal & ML
                            </span>
                            <span className="text-xs text-slate-500">Módulo de Auditoría Científica</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Evaluación y Comparativa de Modelos
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Auditoría de rendimiento entre XGBoost Classifier y Random Forest Classifier sobre el Test Set (N = 4,438).
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar al Dashboard
                    </Link>
                </header>

                {/* Banner del Modelo Seleccionado */}
                <section className="bg-indigo-900 text-white p-6 rounded-xl shadow-sm border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                                Modelo Operacional en Producción
                            </span>
                            <span className="text-xs text-indigo-200">Umbral Óptimo: 0.50</span>
                        </div>
                        <h2 className="text-xl font-bold">Random Forest Classifier (Balanced Subsample)</h2>
                        <p className="text-xs text-indigo-200 max-w-3xl">
                            Seleccionado para inferencia en tiempo real debido a su superioridad en la tasa de detección de desamparo sanitario (Recall = 62.01%), minimizando la omisión de pacientes en riesgo social extremo.
                        </p>
                    </div>
                </section>

                {/* Tabla Comparativa XGBoost vs. Random Forest */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">Comparativa Experimental en Test Set</h2>
                        <p className="text-xs text-slate-500">Métricas evaluadas tras la optimización del umbral de decisión en el conjunto de validación.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Métrica de Evaluación</th>
                                    <th className="px-6 py-3 text-center">XGBoost</th>
                                    <th className="px-6 py-3 text-center">Random Forest</th>
                                    <th className="px-6 py-3">Interpretación Clínica / Técnica</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {comparisonData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-3.5 font-medium text-slate-900">{row.metric}</td>
                                        <td className={`px-6 py-3.5 text-center font-semibold ${row.winner === 'xgb' ? 'text-indigo-600 bg-indigo-50/40' : 'text-slate-600'}`}>
                                            {row.xgb}
                                        </td>
                                        <td className={`px-6 py-3.5 text-center font-semibold ${row.winner === 'rf' ? 'text-emerald-600 bg-emerald-50/40' : 'text-slate-600'}`}>
                                            {row.rf}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-500">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Bloque de Matriz de Confusión & Prueba de McNemar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Matriz de Confusión - Random Forest */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Matriz de Confusión (Random Forest)</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Distribución de clasificaciones del modelo operacional en la muestra de prueba (N = 4,438).
                                    </p>
                                </div>
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200">
                                    Umbral: 0.50
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 font-mono text-sm mt-4">
                                <div className={`p-4 rounded-lg border ${rfConfusionMatrix.tn.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{rfConfusionMatrix.tn.label} (TN)</span>
                                    <span className={`text-2xl font-bold ${rfConfusionMatrix.tn.color}`}>{rfConfusionMatrix.tn.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${rfConfusionMatrix.fp.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{rfConfusionMatrix.fp.label} (FP)</span>
                                    <span className={`text-2xl font-bold ${rfConfusionMatrix.fp.color}`}>{rfConfusionMatrix.fp.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${rfConfusionMatrix.fn.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{rfConfusionMatrix.fn.label} (FN)</span>
                                    <span className={`text-2xl font-bold ${rfConfusionMatrix.fn.color}`}>{rfConfusionMatrix.fn.value}</span>
                                </div>
                                <div className={`p-4 rounded-lg border ${rfConfusionMatrix.tp.bg}`}>
                                    <span className="block text-xs font-sans text-slate-600 mb-1">{rfConfusionMatrix.tp.label} (TP)</span>
                                    <span className={`text-2xl font-bold ${rfConfusionMatrix.tp.color}`}>{rfConfusionMatrix.tp.value}</span>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-[11px] text-slate-500 italic">
                            * TN = Desamparo bien clasificado | FP = Falsa alarma de atención | FN = Caso de desamparo no detectado | TP = Atención médica bien clasificada.
                        </p>
                    </div>

                    {/* Validación Estadística: Test de McNemar */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 mb-1">Prueba de McNemar</h2>
                            <p className="text-xs text-slate-500 mb-4">Validación de hipótesis estadística de significancia.</p>

                            <div className="space-y-3 font-mono text-xs">
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                    <span className="text-slate-500 block">Solo XGBoost acertó (b):</span>
                                    <span className="text-sm font-bold text-slate-800">824 casos</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                    <span className="text-slate-500 block">Solo Random Forest acertó (c):</span>
                                    <span className="text-sm font-bold text-slate-800">172 casos</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                    <span className="text-slate-500 block">Estadístico Chi-cuadrado:</span>
                                    <span className="text-sm font-bold text-indigo-600">425.5030</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                    <span className="text-slate-500 block">p-valor:</span>
                                    <span className="text-sm font-bold text-emerald-600">1.5476e-94</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                            <span className="font-bold block mb-0.5">Conclusión {"(p < 0.05)"}:</span>
                            Existe una diferencia estadísticamente significativa entre ambos modelos, respaldando la selección de Random Forest.
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
}