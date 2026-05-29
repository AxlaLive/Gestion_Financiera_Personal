package com.app_financiera.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para respuesta de Tendencias - HU-16 "Gráfico de tendencias"
 * 
 * Estructura de respuesta para el endpoint GET /api/transacciones/tendencias
 * Contiene datos comparativos entre el mes actual y el mes anterior.
 * 
 * Casos de uso:
 * - Caso 1: Datos disponibles para ambos meses → Calcula porcentaje de diferencia
 * - Caso 2: Sin datos del mes anterior → hasData=false con mensaje descriptivo
 */
public class TendenciasDTO {
    
    @JsonProperty("mesActual")
    private String mesActual;
    
    @JsonProperty("montoMesActual")
    private Double montoMesActual;
    
    @JsonProperty("mesAnterior")
    private String mesAnterior;
    
    @JsonProperty("montoMesAnterior")
    private Double montoMesAnterior;
    
    @JsonProperty("porcentajeDiferencia")
    private Double porcentajeDiferencia;
    
    @JsonProperty("hasData")
    private Boolean hasData;
    
    @JsonProperty("mensaje")
    private String mensaje;

    // Constructor: Caso 1 - Datos disponibles para ambos meses
    public TendenciasDTO(String mesActual, Double montoMesActual, 
                         String mesAnterior, Double montoMesAnterior, 
                         Double porcentajeDiferencia) {
        this.mesActual = mesActual;
        this.montoMesActual = montoMesActual;
        this.mesAnterior = mesAnterior;
        this.montoMesAnterior = montoMesAnterior;
        this.porcentajeDiferencia = porcentajeDiferencia;
        this.hasData = true;
        this.mensaje = "Datos disponibles para comparativa";
    }

    // Constructor: Caso 2 - Sin datos del mes anterior
    public TendenciasDTO(String mesActual, Double montoMesActual) {
        this.mesActual = mesActual;
        this.montoMesActual = montoMesActual;
        this.mesAnterior = null;
        this.montoMesAnterior = null;
        this.porcentajeDiferencia = null;
        this.hasData = false;
        this.mensaje = "Se requiere un mes adicional de datos para generar la comparativa";
    }

    // Getters y Setters
    public String getMesActual() {
        return mesActual;
    }

    public void setMesActual(String mesActual) {
        this.mesActual = mesActual;
    }

    public Double getMontoMesActual() {
        return montoMesActual;
    }

    public void setMontoMesActual(Double montoMesActual) {
        this.montoMesActual = montoMesActual;
    }

    public String getMesAnterior() {
        return mesAnterior;
    }

    public void setMesAnterior(String mesAnterior) {
        this.mesAnterior = mesAnterior;
    }

    public Double getMontoMesAnterior() {
        return montoMesAnterior;
    }

    public void setMontoMesAnterior(Double montoMesAnterior) {
        this.montoMesAnterior = montoMesAnterior;
    }

    public Double getPorcentajeDiferencia() {
        return porcentajeDiferencia;
    }

    public void setPorcentajeDiferencia(Double porcentajeDiferencia) {
        this.porcentajeDiferencia = porcentajeDiferencia;
    }

    public Boolean getHasData() {
        return hasData;
    }

    public void setHasData(Boolean hasData) {
        this.hasData = hasData;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
