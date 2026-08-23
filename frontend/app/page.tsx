"use client";

import Link from "next/link";

export default function MainDashboard() {
  const modules = [
    {
      id: "observatory",
      title: "Módulo 1: Observatorio Geo-Socioeconómico",
      description:
        "Visualización Global de la Tasa de Mortalidad Materna a Nivel Nacional mediante Filtros Interactivos de BI.",
      status: "Operativo (100%)",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      href: "/observatory",
      badge: "BI & Mapas",
    },
    {
      id: "simulator",
      title: "Módulo 2 y 3: Simulador Predictivo & Auditoría XAI",
      description:
        "Evaluación individual de vulnerabilidad mediante IA (XGBoost) y explicación local interprete basada en SHAP y LIME en lenguaje natural.",
      status: "Operativo (100%)",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: "/simulator",
      badge: "Inferencia & XAI",
    },
    {
      id: "metrics",
      title: "Módulo Técnico: Evaluación y Desempeño Global",
      description:
        "Consola de métricas científicas del modelo predictivo (ROC-AUC, Matriz de Confusión) e impacto SHAP global a nivel nacional.",
      status: "Operativo (100%)",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      href: "/metrics",
      badge: "Validación IA",
    },
    {
      id: "reports",
      title: "Módulo 4: Generador de Reportes Científicos",
      description:
        "Exportador oficial de fichas de auditoría médica y recomendaciones de política pública de precisión en formato PDF.",
      status: "Pendiente",
      statusColor: "bg-slate-100 text-slate-700 border-slate-300",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/reports",
      badge: "Exportador PDF",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ENCABEZADO DEL HUB */}
        <header className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                Proyecto Doctoral DCAT
              </span>
              <span className="text-xs text-slate-500">Versión 1.0.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Plataforma de Auditoría e Inteligencia Artificial Explicable (XAI)
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Prevención y Diagnóstico del Riesgo de Desamparo Institucional en Mortalidad Materna en México
            </p>
          </div>
        </header>

        {/* MÁTRICA RÁPIDA / STATUS GENERAL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-xl">22K+</div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Registros Analizados</p>
              <p className="text-sm font-bold text-slate-900">Base SINAIS (2002–2022)</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-xl">0.7596</div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Rendimiento ROC-AUC</p>
              <p className="text-sm font-bold text-slate-900">Modelo XGBoost Calibrado</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600 font-bold text-xl">SHAP</div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Motor Explicable</p>
              <p className="text-sm font-bold text-slate-900">Auditoría Local & Global</p>
            </div>
          </div>
        </div>

        {/* PARRILLA DE TARJETAS DE MÓDULOS */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Módulos del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      {mod.icon}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${mod.statusColor}`}>
                      {mod.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {mod.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                <Link
                  href={mod.href}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
                >
                  Acceder al Módulo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}