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
    narrativeBox: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        padding: 10,
        marginBottom: 12
    },
    narrativeText: {
        fontSize: 8,
        color: '#334155',
        leading: 1.4
    },
    colVarNombre: { width: '35%' },
    colValorObs: { width: '25%' },
    colShapVal: { width: '15%', textAlign: 'center' },
    colShapEffect: { width: '20%', textAlign: 'center' },

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

const getPdfRiskBadge = (prob: number) => {
    if (prob >= 0.5) {
        return { text: "Riesgo Alto de Desamparo", bg: "#FEE2E2", border: "#FCA5A5", textCol: "#991B1B" };
    }
    if (prob >= 0.2) {
        return { text: "Riesgo Moderado de Desamparo", bg: "#FEF3C7", border: "#FDE047", textCol: "#92400E" };
    }
    return { text: "Riesgo Bajo de Desamparo", bg: "#D1FAE5", border: "#6EE7B7", textCol: "#065F46" };
};

const obtenerValorObservado = (shapItem: any, datosPaciente: any) => {
    const texto: string = shapItem.caracteristica_traducida || shapItem.caracteristica_binaria || '';

    // Si contiene ":", el backend envió "NombreVariable: Valor"
    if (texto.includes(':')) {
        const partes = texto.split(':');
        return {
            nombreLimpio: partes[0].trim(),
            valorObservado: partes[1].trim()
        };
    }

    // Manejo de caso especial: Edad
    if (texto.toLowerCase().includes('edad')) {
        return {
            nombreLimpio: 'Edad',
            valorObservado: `${datosPaciente?.EDAD || datosPaciente?.edad || 18} años`
        };
    }

    return {
        nombreLimpio: texto,
        valorObservado: 'Registrado'
    };
};

export const PDFReportDocument: React.FC<Props> = ({ datosPaciente, resultadoPredictivo, recomendaciones }) => {
    const recsClinicas = recomendaciones.filter(r => r.nivel === 'CLINICO');
    const recsPolitica = recomendaciones.filter(r => r.nivel === 'POLITICA_PUBLICA');
    const probDecimal = resultadoPredictivo?.probabilidad_riesgo_desamparo ?? 0;
    const probRiesgo = probDecimal * 100;
    const riskBadge = getPdfRiskBadge(probDecimal);

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
                    <View style={[
                        styles.metricCard,
                        {
                            backgroundColor: riskBadge.bg,
                            borderColor: riskBadge.border
                        }
                    ]}>
                        <Text style={[styles.metricTitle, { color: riskBadge.textCol }]}>
                            Probabilidad Estimada de Desamparo (Random Forest)
                        </Text>
                        <Text style={[styles.metricValue, { color: riskBadge.textCol }]}>
                            {probRiesgo.toFixed(1)}%
                        </Text>
                        <Text style={[styles.metricSubtitle, { color: riskBadge.textCol }]}>
                            Nivel de Riesgo: {riskBadge.text}
                        </Text>
                    </View>

                    {/* 1. Diagnóstico e Interpretación Clínica */}
                    <Text style={styles.sectionTitle}>1. Diagnóstico e Interpretación Clínica</Text>
                    <View style={styles.narrativeBox}>
                        <Text style={styles.narrativeText}>
                            {resultadoPredictivo?.narrativa_clinica || "No hay narrativa clínica disponible para este expediente."}
                        </Text>
                    </View>

                    {/* 2. Análisis de Explicabilidad Local (SHAP) */}
                    <Text style={styles.sectionTitle}>2. Análisis de Explicabilidad Local (SHAP)</Text>
                    <View style={styles.table}>
                        {/* Encabezados de la Tabla */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.thText, styles.colVarNombre]}>Variable</Text>
                            <Text style={[styles.thText, styles.colValorObs]}>Valor Observado</Text>
                            <Text style={[styles.thText, styles.colShapVal]}>SHAP (Log-Odds)</Text>
                            <Text style={[styles.thText, styles.colShapEffect]}>Efecto (SHAP)</Text>
                        </View>

                        {/* Filas Dinámicas */}
                        {resultadoPredictivo?.analisis_explicable_xai?.map((shapItem: any, idx: number) => {
                            const { nombreLimpio, valorObservado } = obtenerValorObservado(shapItem, datosPaciente);
                            const shapAumenta = shapItem.impacto_shap > 0;

                            return (
                                <View key={idx} style={styles.tableRow}>
                                    {/* 1. Variable (Limpia, ej: "Derechohabiencia") */}
                                    <Text style={[styles.tdText, styles.colVarNombre]}>
                                        {nombreLimpio}
                                    </Text>

                                    {/* 2. Valor Observado (ej: "IMSS / ISSSTE" o "18 años") */}
                                    <Text style={[styles.tdText, styles.colValorObs]}>
                                        {valorObservado}
                                    </Text>

                                    {/* 3. SHAP Valor */}
                                    <Text style={[styles.tdText, styles.colShapVal]}>
                                        {shapAumenta ? `+${shapItem.impacto_shap.toFixed(4)}` : shapItem.impacto_shap.toFixed(4)}
                                    </Text>

                                    {/* 4. SHAP Efecto Badge */}
                                    <View style={styles.colShapEffect}>
                                        <Text style={shapAumenta ? styles.badgeRed : styles.badgeGreen}>
                                            {shapAumenta ? 'Aumenta Desamparo' : 'Disminuye Desamparo'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* 3. Recomendaciones de Precisión e Intervención */}
                    <Text style={styles.sectionTitle}>3. Recomendaciones de Precisión e Intervención</Text>
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