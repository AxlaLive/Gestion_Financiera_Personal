package com.app_financiera.api.dto;

import java.time.LocalDate;
import java.util.List;

public class ComparativaMensualResponseDTO {
    private List<ComparativaMensualDTO> comparativa;
    private boolean hasPreviousData;
    private String message;
    private LocalDate periodoActualDesde;
    private LocalDate periodoActualHasta;
    private LocalDate periodoAnteriorDesde;
    private LocalDate periodoAnteriorHasta;

    public ComparativaMensualResponseDTO(
            List<ComparativaMensualDTO> comparativa,
            boolean hasPreviousData,
            String message,
            LocalDate periodoActualDesde,
            LocalDate periodoActualHasta,
            LocalDate periodoAnteriorDesde,
            LocalDate periodoAnteriorHasta) {
        this.comparativa = comparativa;
        this.hasPreviousData = hasPreviousData;
        this.message = message;
        this.periodoActualDesde = periodoActualDesde;
        this.periodoActualHasta = periodoActualHasta;
        this.periodoAnteriorDesde = periodoAnteriorDesde;
        this.periodoAnteriorHasta = periodoAnteriorHasta;
    }

    public List<ComparativaMensualDTO> getComparativa() {
        return comparativa;
    }

    public boolean isHasPreviousData() {
        return hasPreviousData;
    }

    public String getMessage() {
        return message;
    }

    public LocalDate getPeriodoActualDesde() {
        return periodoActualDesde;
    }

    public LocalDate getPeriodoActualHasta() {
        return periodoActualHasta;
    }

    public LocalDate getPeriodoAnteriorDesde() {
        return periodoAnteriorDesde;
    }

    public LocalDate getPeriodoAnteriorHasta() {
        return periodoAnteriorHasta;
    }
}
