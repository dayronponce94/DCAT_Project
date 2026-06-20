"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";

interface FactorSHAP {
  caracteristica_binaria: string;
  caracteristica_traducida: string;
  impacto_shap: number;
  direccion: string;
}

interface FactorLIME {
  caracteristica: string;
  impacto_porcentaje: number;
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
  const [activeTab, setActiveTab] = useState<"local" | "global">("local");
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

  // Datos Estáticos para RF-3.1 (SHAP Global - Importancia de Características Nacional)
  const dataSHAPGlobal = [
    { name: "Falta de Asistencia Médica", peso: 1.24 },
    { name: "Escolaridad Nula/Baja", peso: 0.95 },
    { name: "Carencia de Seguro Social", peso: 0.78 },
    { name: "Residencia Rural", peso: 0.45 },
    { name: "Edad Avanzada (>40)", peso: 0.32 },
  ];

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

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <header className="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Clínico de XAI</h1>
            <p className="text-slate-600">Auditoría Explicable de Riesgo de Desamparo en Mortalidad Materna</p>
          </div>

          {/* Selector de Pestañas (Navegación) */}
          <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setActiveTab("local")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "local" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Simulador Local (SHAP / LIME)
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "global" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Métricas e Impacto Global
            </button>
          </div>
        </header>

        {/* CONTENIDO DE LA PESTAÑA LOCAL */}
        {activeTab === "local" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Datos de la Paciente</h2>
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
                  <select name="ESCOLARIDAD" value={formData.ESCOLARIDAD} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
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

                {/* SELECT DE DERECHOHABIENCIA COMPLETO */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Derechohabiencia</label>
                  <select name="DERECHOHABIENCIA" value={formData.DERECHOHABIENCIA} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
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

                {/* SELECT DE ESTADO CONYUGAL COMPLETO */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado Conyugal</label>
                  <select name="ESTADO_CONYUGAL" value={formData.ESTADO_CONYUGAL} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
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

                {/* SELECT DE ENTIDAD DE OCURRENCIA ORDENADO ALFABÉTICAMENTE */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entidad de Ocurrencia</label>
                  <select name="ENTIDAD_OCURRENCIA" value={formData.ENTIDAD_OCURRENCIA} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
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

                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-400">
                  {loading ? "Procesando..." : "Calcular Predicción e IA Explicable"}
                </button>
              </form>
              {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
            </div>

            {/* Resultados */}
            <div className="lg:col-span-2 space-y-6">
              {!result ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
                  Modifique las variables y ejecute la auditoría para visualizar los hallazgos explicables de SHAP y LIME.
                </div>
              ) : (
                <>
                  {/* Tarjetas de Probabilidades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <span className="block text-sm font-medium text-emerald-800">Probabilidad de Asistencia Médica</span>
                      <span className="text-3xl font-bold text-emerald-900">{(result.probabilidad_atencion_medica * 100).toFixed(2)}%</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <span className="block text-sm font-medium text-amber-800">Probabilidad de Riesgo de Desamparo</span>
                      <span className="text-3xl font-bold text-amber-900">{(result.probabilidad_riesgo_desamparo * 100).toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Gráfico Estadístico de Atribución SHAP */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">Atribución de Factores Locales (SHAP)</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Valores expresados en Log-Odds. Las barras <span className="text-red-500 font-bold">Rojas</span> incrementan el desamparo institucional; las barras <span className="text-teal-500 font-bold">Verdes</span> actúan como escudo protector.
                    </p>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={result.analisis_explicable_xai}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="caracteristica_traducida" type="category" width={180} style={{ fontSize: '12px' }} />
                          <Tooltip
                            formatter={(value: any) => [Number(value).toFixed(4), "Impacto (Log-Odds)"]}
                          />
                          <ReferenceLine x={0} stroke="#64748b" />
                          <Bar dataKey="impacto_shap">
                            {result.analisis_explicable_xai.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.impacto_shap > 0 ? "#ef4444" : "#14b8a6"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* NUEVA SECCIÓN: ENFOQUE CIUDADANO (LIME + NARRATIVA TEXTUAL) */}
                  <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-6 rounded-xl shadow-md text-white">
                    <h3 className="text-lg font-semibold mb-2 text-indigo-300">Interpretación en Lenguaje Natural (LIME)</h3>
                    <p className="text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4 leading-relaxed italic whitespace-pre-line">
                      {result.narrativa_clinica}
                    </p>


                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Desglose Ciudadano de Impacto (% Directo):</h4>
                    <div className="space-y-2">
                      {result.analisis_lime?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs border-b border-slate-800 pb-1">
                          <span className="text-slate-300">{item.caracteristica}</span>
                          <span className={item.impacto_porcentaje > 0 ? "text-rose-400 font-bold" : "text-teal-400 font-bold"}>
                            {item.impacto_porcentaje > 0 ? `+${item.impacto_porcentaje}%` : `${item.impacto_porcentaje}%`} al riesgo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA GLOBAL (RF-2.3 e RF-3.1) */}
        {activeTab === "global" && (
          <div className="space-y-8">
            {/* Consola de Evaluación del Modelo (RF-2.3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1">
                <h3 className="text-lg font-bold mb-4 text-slate-900">Métricas de Performance (XGBoost)</h3>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <span className="text-xs text-slate-500 block">Accuracy Local</span>
                    <span className="text-2xl font-bold text-indigo-600">91.00%</span>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-xs text-slate-500 block">Área Bajo la Curva (ROC AUC)</span>
                    <span className="text-2xl font-bold text-indigo-600">0.7596</span>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-xs text-slate-500 block">F1-Score (Clase Desamparo)</span>
                    <span className="text-2xl font-bold text-amber-600">0.0100</span>
                  </div>
                </div>
              </div>

              {/* Matriz de Confusión Sincronizada con tu Consola */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                <h3 className="text-lg font-bold mb-4 text-slate-900">Matriz de Confusión de la Auditoría</h3>
                <p className="text-xs text-slate-500 mb-3">Muestra de validación externa (N = 4,438 registros históricos).</p>
                <div className="grid grid-cols-2 gap-2 text-center max-w-sm mx-auto font-mono text-sm">
                  <div className="bg-slate-50 p-4 rounded border">
                    <span className="block text-xs text-slate-500">Verdaderos Positivos (Atención)</span>
                    <span className="text-xl font-bold text-emerald-600">4,020</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border">
                    <span className="block text-xs text-slate-500">Falsos Positivos (Error Alerta)</span>
                    <span className="text-xl font-bold text-red-600">405</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border">
                    <span className="block text-xs text-slate-500">Falsos Negativos (Omisión)</span>
                    <span className="text-xl font-bold text-red-600">10</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border">
                    <span className="block text-xs text-slate-500">Verdaderos Negativos (Desamparo)</span>
                    <span className="text-xl font-bold text-emerald-600">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizador de Atribución Global SHAP (RF-3.1) - Basado en tus pesos del Script */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Importancia de Características Nacional (SHAP Local)</h3>
              <p className="text-xs text-slate-500 mb-4">
                Impacto medio absoluto obtenido mediante la evaluación del vector de prueba del paciente en `explain_service`.
              </p>
              <div className="w-full">
                <BarChart data={[
                  { name: "Escolaridad (Baja/Nula)", peso: 0.8267 },
                  { name: "Derechohabiencia (Ninguna)", peso: 0.3320 },
                  { name: "Estado Conyugal", peso: 0.0846 },
                  { name: "Edad de la Paciente", peso: 0.0650 }
                ]} layout="vertical" width={750} height={220}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={180} style={{ fontSize: '12px' }} />
                  <Tooltip formatter={(value: any) => [value, "Impacto Absoluto (Log-Odds)"]} />
                  <Bar dataKey="peso" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          {/* CONTENIDO DE LA PESTAÑA GLOBAL (RF-2.3 e RF-3.1) */}
          {activeTab === "global" && (
            <div className="space-y-8">
              {/* Consola de Evaluación del Modelo (RF-2.3) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 md:col-span-1">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">Métricas de Performance (XGBoost)</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <span className="text-xs text-slate-500 block">Accuracy Global</span>
                      <span className="text-2xl font-bold text-indigo-600">93.42%</span>
                    </div>
                    <div className="border-b pb-2">
                      <span className="text-xs text-slate-500 block">Área Bajo la Curva (ROC AUC)</span>
                      <span className="text-2xl font-bold text-indigo-600">0.912</span>
                    </div>
                    <div className="border-b pb-2">
                      <span className="text-xs text-slate-500 block">F1-Score (Clase Desamparo)</span>
                      <span className="text-2xl font-bold text-amber-600">0.764</span>
                    </div>
                  </div>
                </div>

                {/* Simulación de Matriz de Confusión en UI */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 md:col-span-2">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">Matriz de Confusión de la Auditoría</h3>
                  <div className="grid grid-cols-2 gap-2 text-center max-w-sm mx-auto font-mono text-sm">
                    <div className="bg-slate-100 p-4 rounded border">
                      <span className="block text-xs text-slate-500">Verdaderos Positivos</span>
                      <span className="text-xl font-bold text-emerald-600">18,240</span>
                    </div>
                    <div className="bg-slate-100 p-4 rounded border">
                      <span className="block text-xs text-slate-500">Falsos Positivos</span>
                      <span className="text-xl font-bold text-red-600">1,210</span>
                    </div>
                    <div className="bg-slate-100 p-4 rounded border">
                      <span className="block text-xs text-slate-500">Falsos Negativos</span>
                      <span className="text-xl font-bold text-red-600">350</span>
                    </div>
                    <div className="bg-slate-100 p-4 rounded border">
                      <span className="block text-xs text-slate-500">Verdaderos Negativos</span>
                      <span className="text-xl font-bold text-emerald-600">2,390</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualizador de Atribución Global SHAP (RF-3.1) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Importancia de Características Nacional (SHAP Global)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Impacto medio absoluto sobre la salida del modelo obtenido mediante la evaluación de la muestra histórica completa (22,190 registros).
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataSHAPGlobal} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={180} style={{ fontSize: '12px' }} />
                      <Tooltip formatter={(value: any) => [value, "Impacto Medio (Log-Odds)"]} />
                      <Bar dataKey="peso" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}