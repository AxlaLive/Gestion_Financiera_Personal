package com.app_financiera.api.controllers;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.dto.ComparativaMensualResponseDTO;
import com.app_financiera.api.dto.GastosPorCategoriaDTO;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.UsuarioRepository;
import com.app_financiera.api.services.TransaccionService;

@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    @Autowired
    private TransaccionService transaccionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/comparativa-mensual")
    public ResponseEntity<?> obtenerComparativaMensual(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            ComparativaMensualResponseDTO respuesta = transaccionService.obtenerComparativaMensual(usuario, fechaDesde, fechaHasta);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/gastos-por-categoria")
    public ResponseEntity<?> obtenerGastosPorCategoriaMesActual(@RequestParam Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return ResponseEntity.ok(transaccionService.obtenerGastosPorCategoriaMesActual(usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
