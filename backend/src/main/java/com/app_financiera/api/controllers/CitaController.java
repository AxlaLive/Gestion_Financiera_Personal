package com.app_financiera.api.controllers;

import com.app_financiera.api.entities.Cita;
import com.app_financiera.api.services.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @GetMapping("/profesional/{profesionalId}")
    public ResponseEntity<List<Cita>> listarCitasPorProfesional(@PathVariable Long profesionalId) {
        List<Cita> citas = citaService.obtenerCitasPorProfesional(profesionalId);
        if (citas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(citas);
    }
}