package com.app_financiera.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LimiteGastoHormigaRequest {
    private BigDecimal limite;
}
