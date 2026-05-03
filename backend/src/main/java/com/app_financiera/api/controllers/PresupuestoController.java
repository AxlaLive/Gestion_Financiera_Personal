package com.app_financiera.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app_financiera.api.entities.PresupuestoCategoria;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.services.PresupuestoService;
import com.app_financiera.api.services.PresupuestoService.EstadoPresupuestoDTO;
import com.app_financiera.api.repositories.UsuarioRepository;
import com.app_financiera.api.repositories.CategoriaRepository;

@RestController
@RequestMapping("/api/presupuestos")
public class PresupuestoController {

    @Autowired
    private PresupuestoService presupuestoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * POST /api/presupuestos
     * Crear o actualizar presupuesto para una categoría
     * HU-12: Persistir un monto máximo por categoría
     */
    @PostMapping
    public ResponseEntity<?> crearOActualizarPresupuesto(
            @RequestParam Long usuarioId,
            @RequestParam Long categoriaId,
            @RequestParam String mes,
            @RequestParam Double presupuestoMaximo) {
        try {
            // Obtener usuario
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Obtener categoría
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            // Crear o actualizar presupuesto
            PresupuestoCategoria presupuesto = presupuestoService.crearOActualizarPresupuesto(
                    usuario, categoria, mes, presupuestoMaximo
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(presupuesto);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/presupuestos/estado/{usuarioId}/{categoriaId}
     * Consultar estado de gasto vs límite para una categoría en el mes actual
     * HU-12: Permitir consultar el estado de gasto vs límite por categoría
     * HU-12: Calcular porcentaje consumido
     * HU-12: Indicar si el presupuesto fue excedido
     */
    @GetMapping("/estado/{usuarioId}/{categoriaId}")
    public ResponseEntity<?> obtenerEstadoPresupuesto(
            @PathVariable Long usuarioId,
            @PathVariable Long categoriaId) {
        try {
            // Obtener usuario
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Obtener categoría
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            // Obtener estado del presupuesto
            EstadoPresupuestoDTO estado = presupuestoService.obtenerEstadoPresupuesto(usuario, categoria);

            if (estado == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No hay presupuesto definido para esta categoría en el mes actual");
            }

            return ResponseEntity.ok(estado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/presupuestos/estado-todos/{usuarioId}
     * Consultar estado de todos los presupuestos del usuario en el mes actual
     * HU-12: Indicar todos los presupuestos con alerta visual (rojo si excedido)
     */
    @GetMapping("/estado-todos/{usuarioId}")
    public ResponseEntity<?> obtenerEstadoTodosPresupuestos(@PathVariable Long usuarioId) {
        try {
            // Obtener usuario
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Obtener estado de todos los presupuestos
            List<EstadoPresupuestoDTO> estados = presupuestoService.obtenerEstadoTodosPresupuestos(usuario);

            if (estados.isEmpty()) {
                return ResponseEntity.ok("[]");
            }

            return ResponseEntity.ok(estados);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
