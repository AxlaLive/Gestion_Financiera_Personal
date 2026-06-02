package com.app_financiera.api.dto;

public class ComparativaMensualDTO {
    private String etiqueta;
    private Double montoMesActual;
    private Double montoMesAnterior;

    public ComparativaMensualDTO(String etiqueta, Double montoMesActual, Double montoMesAnterior) {
        this.etiqueta = etiqueta;
        this.montoMesActual = montoMesActual;
        this.montoMesAnterior = montoMesAnterior;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public Double getMontoMesActual() {
        return montoMesActual;
    }

    public Double getMontoMesAnterior() {
        return montoMesAnterior;
    }
}
