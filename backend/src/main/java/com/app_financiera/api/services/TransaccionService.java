package com.app_financiera.api.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.TransaccionRepository;

import jakarta.transaction.Transactional;

@Service
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Transactional
    public Transaccion registrarTransaccion(Transaccion transaccion) {
        
        // 1. Regla HU-06 y HU-07: El monto debe ser numérico positivo > 0 [cite: 17, 27]
        if (transaccion.getMonto() == null || transaccion.getMonto() <= 0) {
            throw new RuntimeException("El monto debe ser un valor positivo mayor a cero [Regla HU-06/07]");
        }

        // 2. Regla HU-06: No se pueden registrar gastos "predichos" (fechas futuras) [cite: 40, 42, 43]
        if (transaccion.getFecha() != null && transaccion.getFecha().isAfter(LocalDate.now())) {
            throw new RuntimeException("No puedes registrar transacciones que aún no han ocurrido [Regla HU-06]");
        }

        // 3. Regla HU-06 (Escenario 3): La categoría es obligatoria para clasificar el gasto [cite: 33, 36]
        if (transaccion.getCategoria() == null || transaccion.getCategoria().getId() == null) {
            throw new RuntimeException("Por favor, clasifica tu transacción para generar reportes precisos [Regla HU-06]");
        }

        // 4. Validación de Integridad: Asegurar que el tipo sea válido (INGRESO o GASTO) [cite: 44, 45, 93, 98]
        // Esto es vital para que el balance de la HU-14 no falle.
        if (transaccion.getTipo() == null || 
           (!transaccion.getTipo().equalsIgnoreCase("INGRESO") && !transaccion.getTipo().equalsIgnoreCase("GASTO"))) {
            throw new RuntimeException("El tipo de transacción debe ser INGRESO o GASTO para calcular el balance");
        }
        return transaccionRepository.save(transaccion);
    }

    // Método para listar (HU-09: Historial cronológico) [cite: 72, 73]
    public List<Transaccion> listarHistorial(Usuario usuario) {
        return transaccionRepository.findByUsuarioOrderByFechaDescIdDesc(usuario);
    }

    @Transactional
    public Transaccion actualizarTransaccion(Long id, Transaccion datosNuevos, Long usuarioId) {
        // 1. Validar que exista y que pertenezca al usuario (RNF Seguridad)
        Transaccion existente = transaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));

        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para editar esta transacción");
        }

        // 2. Aplicar validaciones de la HU (reutilizando tu lógica existente)
        if (datosNuevos.getMonto() == null || datosNuevos.getMonto() <= 0) {
            throw new RuntimeException("El monto debe ser un valor positivo mayor a cero");
        }
        if (datosNuevos.getFecha() != null && datosNuevos.getFecha().isAfter(LocalDate.now())) {
            throw new RuntimeException("No puedes registrar transacciones con fechas futuras");
        }

        // 3. Actualizar datos
        existente.setMonto(datosNuevos.getMonto());
        existente.setDescripcion(datosNuevos.getDescripcion());
        existente.setFecha(datosNuevos.getFecha());
        existente.setCategoria(datosNuevos.getCategoria());
        existente.setTipo(datosNuevos.getTipo());

        return transaccionRepository.save(existente);
    }

    @Transactional
    public void eliminarTransaccion(Long id, Long usuarioId) {
        // Validar propiedad antes de borrar
        Transaccion existente = transaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));

        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para eliminar esta transacción");
        }

        transaccionRepository.delete(existente);
    }
}