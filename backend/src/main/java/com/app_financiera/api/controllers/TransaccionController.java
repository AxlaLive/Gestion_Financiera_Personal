package com.app_financiera.api.controllers;

import java.util.List;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.dto.GastoCategoriaDTO;
import com.app_financiera.api.dto.TendenciasDTO;
import com.app_financiera.api.services.TransaccionService;
import com.app_financiera.api.services.TransaccionService.TransaccionDTO;
import com.app_financiera.api.repositories.UsuarioRepository;

@RestController
@RequestMapping("/api/transacciones")
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<?> crearTransaccion(@RequestBody Transaccion transaccion) {
        try {
            // Valida monto > 0, fecha no futura y categoría obligatoria [cite: 17, 40, 33]
            Transaccion nueva = transaccionService.registrarTransaccion(transaccion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (RuntimeException e) {
            // Si falla una regla de negocio, enviamos el error específico [cite: 28, 36, 43]
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/transacciones/usuario/{usuarioId}
     * Obtener historial de transacciones para HU-09
     * Retorna lista ordenada de más reciente a más antiguo con estado vacío soportado
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> verHistorial(@PathVariable Long usuarioId) {
        try {
            // Validar que el usuario existe
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Retorna la lista cronológica con DTOs (sin lazy loading) [cite: 73, HU-09]
            List<TransaccionDTO> historial = transaccionService.listarHistorialDTO(usuario);
            
            // Si no hay transacciones, retorna lista vacía (estado vacío soportado - HU-09)
            return ResponseEntity.ok(historial);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{usuarioId}/resumen-gastos")
    public ResponseEntity<?> obtenerResumenGastosMesActual(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            List<GastoCategoriaDTO> resumen =
                    transaccionService.obtenerResumenGastosMesActual(usuario);

            return ResponseEntity.ok(resumen);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTransaccion(@PathVariable Long id, @RequestBody Transaccion actualizacion) {
        try {
            // HU-08: Edición con validación de pertenencia del usuario [cite: 33, 40]
            Transaccion actualizada = transaccionService.actualizarTransaccion(id, actualizacion);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTransaccion(@PathVariable Long id) {
        try {
            // HU-08: Eliminación con validación de pertenencia del usuario [cite: 33, 40]
            transaccionService.eliminarTransaccion(id);
            return ResponseEntity.ok().body("Transacción eliminada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/transacciones/tendencias?usuarioId={usuarioId}&fechaDesde={YYYY-MM-DD}&fechaHasta={YYYY-MM-DD}
     * 
     * Implementación de Tarea 86 - HU-16 "Gráfico de tendencias"
     * 
     * Calcula tendencias de gastos comparando mes actual vs mes anterior.
     * Parámetros opcionales de fecha para especificar período de análisis.
     * 
     * Respuestas posibles:
     * - 200 OK: TendenciasDTO con comparativa completa (hasData=true) o sin datos anteriores (hasData=false)
     * - 400 BAD REQUEST: Usuario no encontrado o parámetros inválidos
     * 
     * Ejemplo de uso:
     * GET /api/transacciones/tendencias?usuarioId=1
     * GET /api/transacciones/tendencias?usuarioId=1&fechaDesde=2024-01-01&fechaHasta=2024-01-31
     */
    @GetMapping("/tendencias")
    public ResponseEntity<?> obtenerTendenciasGastos(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta) {
        try {
            // 1. Validar que el usuario existe [cite: 40, Tarea 86]
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 2. Calcular tendencias con los parámetros proporcionados [cite: Tarea 86]
            TendenciasDTO tendencias = transaccionService.calcularTendenciasGastos(
                    usuario, 
                    fechaDesde, 
                    fechaHasta
            );

            // 3. Retornar respuesta con estructura clara (Requerimiento 1, 2, 3, 4) [cite: Tarea 86]
            return ResponseEntity.ok(tendencias);

        } catch (RuntimeException e) {
            // Manejo de errores: usuario no encontrado o parámetros inválidos
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}