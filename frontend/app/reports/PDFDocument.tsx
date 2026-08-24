import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Recomendacion } from "@/app/lib/recommendations";

const styles = StyleSheet.create({
    page: { padding: 35, backgroundColor: '#FFFFFF', fontSize: 10, fontFamily: 'Helvetica' },
    header: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', pb: 10, mb: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
    subtitle: { fontSize: 10, color: '#64748B', marginTop: 3 },
    badge: { backgroundColor: '#EEF2FF', color: '#3730A3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8, width: 140, marginBottom: 5 },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1E293B', mb: 6, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', pb: 3 },
    text: { fontSize: 9, color: '#334155', leading: 1.4 },
    table: { width: '100%', borderStyle: 'solid', borderWidth: 0.5, borderColor: '#CBD5E1', marginTop: 6 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', minHeight: 20, alignItems: 'center' },
    tableHeader: { backgroundColor: '#F8FAFC', fontWeight: 'bold' },
    colVariable: { width: '45%', paddingLeft: 6 },
    colShap: { width: '25%', textAnchor: 'middle', textAlign: 'center' },
    colLime: { width: '30%', textAnchor: 'middle', textAlign: 'center' },
    recBox: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 4, mb: 6 },
    recTitle: { fontSize: 9, fontWeight: 'bold', color: '#0F172A' },
    footer: { position: 'absolute', bottom: 20, left: 35, right: 35, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 0.5, borderTopColor: '#E2E8F0', pt: 5 }
});

interface Props {
    datosPaciente: any;
    resultadoPredictivo: any;
    recomendaciones: Recomendacion[];
}

export const PDFReportDocument: React.FC<Props> = ({ datosPaciente, resultadoPredictivo, recomendaciones }) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.badge}>PROYECTO DOCTORAL DCAT - UAA</Text>
                <Text style={styles.title}>Ficha de Auditoría Médica y Explicabilidad XAI</Text>
                <Text style={styles.subtitle}>
                    Sistema DSS de Evaluación del Riesgo de Desamparo Institucional en Salud Pública
                </Text>
            </View>

            {/* Resumen Epidemiológico */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Diagnóstico del Modelo Predictivo (Random Forest)</Text>
                <Text style={styles.text}>
                    Probabilidad Estimada de Desamparo Institucional: {(resultadoPredictivo.probabilidad_riesgo_desamparo * 100).toFixed(2)}%
                </Text>
                <Text style={styles.text}>
                    Probabilidad de Atención Médica Efectiva: {(resultadoPredictivo.probabilidad_atencion_medica * 100).toFixed(2)}%
                </Text>
            </View>

            {/* Narrativa Clínica */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Interpretación Axiomática SHAP</Text>
                <Text style={styles.text}>{resultadoPredictivo.narrativa_clinica}</Text>
            </View>

            {/* Tabla Comparativa XAI */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Desglose Técnico de Atribución Local</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.colVariable}>Variable Sociodemográfica</Text>
                        <Text style={styles.colShap}>SHAP (Log-Odds)</Text>
                        <Text style={styles.colLime}>LIME (Impacto %)</Text>
                    </View>
                    {resultadoPredictivo.analisis_explicable_xai?.map((item: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.colVariable}>{item.caracteristica_traducida}</Text>
                            <Text style={styles.colShap}>{item.impacto_shap.toFixed(4)}</Text>
                            <Text style={styles.colLime}>
                                {resultadoPredictivo.analisis_lime?.[idx]
                                    ? `${(resultadoPredictivo.analisis_lime[idx].impacto_probabilidad * 100).toFixed(2)}%`
                                    : 'N/D'}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recomendaciones de Precisión */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Plan de Recomendaciones Médicas y de Política Pública</Text>
                {recomendaciones.map((rec, i) => (
                    <View key={i} style={styles.recBox}>
                        <Text style={styles.recTitle}>[{rec.nivel}] {rec.titulo} (Prioridad: {rec.prioridad})</Text>
                        <Text style={styles.text}>{rec.descripcion}</Text>
                    </View>
                ))}
            </View>

            {/* Pie de Página */}
            <Text style={styles.footer}>
                Documento generado automáticamente por la Plataforma DSS-XAI. Válido como instrumento de auditoría científica y apoyo a la toma de decisiones asistenciales.
            </Text>
        </Page>
    </Document>
);