package com.app_financiera.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GastoHormigaResumenDTO {
    private BigDecimal limite;
    private Double acumuladoMes;
    private Integer cantidadTransacciones;
    private Double totalGastosMes;
    private Double porcentajeDelTotal;
    private String recomendacion;
}
