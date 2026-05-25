package com.app_financiera.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GastoCategoriaDTO {
    private String categoriaNombre;
    private Double montoTotal;
}
