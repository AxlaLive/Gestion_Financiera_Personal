package com.app_financiera.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GastosPorCategoriaDTO {
    private String categoria;
    private BigDecimal monto;
}
