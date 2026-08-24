"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

interface SocioeconomicData {
    kpis: {
        total_casos: number;
        tasa_desamparo_global: number;
        cobertura_medica: number;
        grupo_edad_mayor_riesgo: string;
    };
    por_escolaridad: Array<{ nivel: string; riesgo_medio: number; total_pacientes: number }>;
    por_derechohabiencia: Array<{ institucion: string; porcentaje: number }>;
    por_estado_conyugal: Array<{ estado: string; casos: number; riesgo: number }>;
}

const COLOR_PALETTE = ["#0284c7", "#0d9488", "#d97706", "#dc2626", "#7c3aed", "#2563eb", "#059669", "#475569", "#ea580c"];

export default function ObservatoryPage() {
    const [data, setData] = useState<SocioeconomicData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroEntidad, setFiltroEntidad] = useState<string>("0");

    useEffect(() => {
        const fetchBIData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/socioeconomic-metrics?entidad=${filtroEntidad}`);
                if (!res.ok) {
                    throw new Error(`Error en el servidor: ${res.statusText}`);
                }
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                } else {
                    throw new Error("Respuesta no satisfactoria del servidor.");
                }
            } catch (err: any) {
                setError(err.message || "No se pudo conectar con el backend analítico.");
            } finally {
                setLoading(false);
            }
        };

        fetchBIData();
    }, [filtroEntidad]);

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Encabezado del Módulo */}
                <header className="border-b border-slate-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard de Inteligencia de Negocios (BI)</h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Análisis Macro-Socioeconómico Real del Dataset de Mortalidad Materna
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={filtroEntidad}
                            onChange={(e) => setFiltroEntidad(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg text-sm p-2 shadow-xs focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="0">Todas las Entidades</option>
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
                            <option value="11">GUANAJUATO</option>
                            <option value="12">GUERRERO</option>
                            <option value="13">HIDALGO</option>
                            <option value="14">JALISCO</option>
                            <option value="15">MÉXICO</option>
                            <option value="16">MICHOACÁN</option>
                            <option value="17">MORELOS</option>
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

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al Menú Principal
                        </Link>
                    </div>
                </header>

                {/* Manejo de Estados de Carga y Error */}
                {loading && (
                    <div className="p-12 text-center text-slate-600 font-medium bg-white rounded-xl border border-slate-200">
                        Procesando dataset y calculando métricas reales...
                    </div>
                )}

                {error && (
                    <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        <h3 className="font-bold text-lg mb-1">Error de Conexión o Procesamiento</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Fila de KPIs Reales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Muestra Registrada</span>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{data.kpis.total_casos.toLocaleString()} <span className="text-xs font-normal text-slate-500">casos</span></p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Tasa de Desamparo Real</span>
                                <p className="text-3xl font-bold text-rose-600 mt-1">{data.kpis.tasa_desamparo_global}%</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Cobertura Médica Real</span>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">{data.kpis.cobertura_medica}%</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Rango Etario Crítico</span>
                                <p className="text-2xl font-bold text-amber-700 mt-1">{data.kpis.grupo_edad_mayor_riesgo}</p>
                            </div>
                        </div>

                        {/* Fila de Gráficos de Agregación */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Gráfico 1: Riesgo Medio por Escolaridad */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Tasa de Desamparo por Escolaridad (%)</h3>
                                <p className="text-xs text-slate-500 mb-4">Riesgo promedio observado en la cohorte real según nivel educativo</p>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.por_escolaridad} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="nivel" interval={0} angle={-35} textAnchor="end" style={{ fontSize: '10px' }} />
                                            <YAxis unit="%" />
                                            <Tooltip formatter={(value: any) => [`${value}%`, "Riesgo de Desamparo"]} />
                                            <Bar dataKey="riesgo_medio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Gráfico 2: Distribución por Derechohabiencia */}
                            {/* Gráfico 2: Donut Chart con Tooltip Dinámico por Institución */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Distribución Poblacional por Derechohabiencia</h3>
                                <p className="text-xs text-slate-500 mb-4">Proporción (%) según afiliación a instituciones sanitarias</p>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.por_derechohabiencia}
                                                dataKey="porcentaje"
                                                nameKey="institucion"
                                                cx="45%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={3}
                                            >
                                                {data.por_derechohabiencia.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: any, name: any) => [`${val}%`, `${name} (Proporción Real)`]} />

                                            <Legend
                                                layout="vertical"
                                                align="right"
                                                verticalAlign="middle"
                                                wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Tabla Bivariada: Estado Conyugal */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Desglose Analítico por Estado Conyugal</h3>
                            <p className="text-xs text-slate-500 mb-4">Distribución de frecuencias e incidencia observada del desamparo institucional</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                                            <th className="p-3">Estado Conyugal</th>
                                            <th className="p-3">Total Muestral (N)</th>
                                            <th className="p-3">Proporción Poblacional</th>
                                            <th className="p-3">Riesgo de Desamparo (%)</th>
                                            <th className="p-3">Evaluación de Riesgo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.por_estado_conyugal.map((row, idx) => {
                                            const prop = ((row.casos / data.kpis.total_casos) * 100).toFixed(1);
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-800">{row.estado}</td>
                                                    <td className="p-3 text-slate-600">{row.casos.toLocaleString()}</td>
                                                    <td className="p-3 text-slate-600">{prop}%</td>
                                                    <td className="p-3 font-bold text-slate-800">{row.riesgo}%</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${row.riesgo > 30
                                                            ? "bg-rose-100 text-rose-800"
                                                            : row.riesgo > 15
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-emerald-100 text-emerald-800"
                                                            }`}>
                                                            {row.riesgo > 30 ? "Alto Riesgo" : row.riesgo > 15 ? "Riesgo Moderado" : "Bajo Riesgo"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}