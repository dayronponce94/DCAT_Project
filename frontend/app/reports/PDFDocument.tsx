import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Recomendacion } from "@/app/lib/recommendations";

const styles = StyleSheet.create({
    page: {
        paddingTop: 0,
        paddingBottom: 30,
        paddingHorizontal: 0,
        backgroundColor: '#FFFFFF',
        fontSize: 9,
        fontFamily: 'Helvetica'
    },
    headerContainer: {
        backgroundColor: '#1E1B4B',
        paddingVertical: 18,
        paddingHorizontal: 25,
        marginBottom: 15
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -0.3
    },
    headerSubtitle: {
        fontSize: 8,
        color: '#C7D2FE',
        marginTop: 3
    },
    bodyContainer: {
        paddingHorizontal: 25
    },
    metricCard: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 6,
        padding: 10,
        textAlign: 'center',
        marginBottom: 14
    },
    metricTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#991B1B',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#DC2626',
        marginVertical: 2
    },
    metricSubtitle: {
        fontSize: 8,
        color: '#7F1D1D'
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E1B4B',
        borderLeftWidth: 3,
        borderLeftColor: '#4F46E5',
        paddingLeft: 6,
        marginTop: 10,
        marginBottom: 8
    },
    table: {
        width: '100%',
        borderWidth: 0.5,
        borderColor: '#CBD5E1',
        borderRadius: 4,
        marginBottom: 10
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
        paddingVertical: 5,
        paddingHorizontal: 6
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 5,
        paddingHorizontal: 6,
        alignItems: 'center'
    },
    thText: {
        fontWeight: 'bold',
        color: '#334155',
        fontSize: 8
    },
    tdText: {
        color: '#334155',
        fontSize: 8
    },
    colVar: { width: '45%' },
    colShap: { width: '25%', textAlign: 'center' },
    colLime: { width: '30%', textAlign: 'center' },
    badgeRed: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 7,
        fontWeight: 'bold'
    },
    badgeGreen: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 7,
        fontWeight: 'bold'
    },
    twoColumns: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10
    },
    column: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        padding: 8
    },
    colTitleClinico: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#4338CA',
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    colTitlePolitica: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4
    },
    bullet: {
        width: 8,
        fontSize: 8,
        color: '#64748B'
    },
    listText: {
        flex: 1,
        fontSize: 7.5,
        color: '#334155',
        leading: 1.3
    },
    footer: {
        position: 'absolute',
        bottom: 12,
        left: 25,
        right: 25,
        textAlign: 'center',
        fontSize: 7,
        color: '#94A3B8',
        borderTopWidth: 0.5,
        borderTopColor: '#E2E8F0',
        paddingTop: 6
    }
});

interface Props {
    datosPaciente?: any;
    resultadoPredictivo: any;
    recomendaciones: Recomendacion[];
}

export const PDFReportDocument: React.FC<Props> = ({ resultadoPredictivo, recomendaciones }) => {
    const probRiesgo = (resultadoPredictivo?.probabilidad_riesgo_desamparo * 100) || 0;
    const recsClinicas = recomendaciones.filter(r => r.nivel === 'CLINICO');
    const recsPolitica = recomendaciones.filter(r => r.nivel === 'POLITICA_PUBLICA');

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Encabezado Principal */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Ficha Oficial de Evaluación de Riesgo y Explicabilidad (XAI)</Text>
                    <Text style={styles.headerSubtitle}>
                        Sistema Predictivo DSS de Apoyo a la Decisión Clínica y de Política Pública
                    </Text>
                </View>

                <View style={styles.bodyContainer}>
                    {/* Tarjeta de Riesgo */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricTitle}>Probabilidad Estimada de Desamparo (Random Forest)</Text>
                        <Text style={styles.metricValue}>{probRiesgo.toFixed(1)}%</Text>
                        <Text style={styles.metricSubtitle}>
                            Nivel de Riesgo: {probRiesgo >= 60 ? 'ALTO — Requiere Atención Prioritaria' : 'MODERADO / BAJO'}
                        </Text>
                    </View>

                    {/* Desglose Técnico SHAP y LIME */}
                    <Text style={styles.sectionTitle}>1. Análisis de Explicabilidad Local (SHAP & LIME)</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.thText, styles.colVar]}>Variable Observada</Text>
                            <Text style={[styles.thText, styles.colShap]}>Impacto SHAP</Text>
                            <Text style={[styles.thText, styles.colLime]}>Efecto en Riesgo (LIME)</Text>
                        </View>
                        {resultadoPredictivo?.analisis_explicable_xai?.map((item: any, idx: number) => {
                            const limeVal = resultadoPredictivo?.analisis_lime?.[idx]?.impacto_probabilidad ?? 0;
                            return (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.tdText, styles.colVar]}>
                                        {item.caracteristica_traducida || item.caracteristica_binaria}
                                    </Text>
                                    <Text style={[styles.tdText, styles.colShap]}>
                                        {item.impacto_shap > 0 ? `+${item.impacto_shap.toFixed(3)}` : item.impacto_shap.toFixed(3)}
                                    </Text>
                                    <View style={styles.colLime}>
                                        <Text style={limeVal > 0 ? styles.badgeRed : styles.badgeGreen}>
                                            {limeVal > 0 ? 'Aumenta Riesgo' : 'Disminuye Riesgo'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Recomendaciones de Precisión */}
                    <Text style={styles.sectionTitle}>2. Recomendaciones de Precisión e Intervención</Text>
                    <View style={styles.twoColumns}>
                        {/* Protocolo Clínico */}
                        <View style={styles.column}>
                            <Text style={styles.colTitleClinico}>Protocolo Clínico Prioritario</Text>
                            {recsClinicas.length > 0 ? (
                                recsClinicas.map((rec, i) => (
                                    <View key={i} style={styles.listItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.listText}>
                                            <Text style={{ fontWeight: 'bold' }}>{rec.titulo}: </Text>
                                            {rec.descripcion}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.listText}>Sin recomendaciones clínicas adicionales.</Text>
                            )}
                        </View>

                        {/* Política Pública */}
                        <View style={styles.column}>
                            <Text style={styles.colTitlePolitica}>Política Pública y Protección Social</Text>
                            {recsPolitica.length > 0 ? (
                                recsPolitica.map((rec, i) => (
                                    <View key={i} style={styles.listItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.listText}>
                                            <Text style={{ fontWeight: 'bold' }}>{rec.titulo}: </Text>
                                            {rec.descripcion}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.listText}>Sin recomendaciones de política pública adicionales.</Text>
                            )}
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Ficha generada automáticamente por el Sistema DSS-XAI • Documento confidencial de uso clínico e institucional.
                </Text>
            </Page>
        </Document>
    );
};