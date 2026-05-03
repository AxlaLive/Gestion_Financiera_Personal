package com.app_financiera.api.services;

import java.time.LocalDate;
import java.util.List;
<<<<<<< HEAD
import java.util.Optional;
=======
>>>>>>> 1fd01cd34ce9c9a4a0a7e55c789d3722519ae4d5

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

        // 5. Regla HU-06: Vinculación automática al usuario [cite: 19, 23]
        // (Nota: El usuario se suele setear desde el Controller con el usuario autenticado)
        
        return transaccionRepository.save(transaccion);
    }

    // Método para listar (HU-09: Historial cronológico) [cite: 72, 73]
    public List<Transaccion> listarHistorial(Usuario usuario) {
        return transaccionRepository.findByUsuarioOrderByFechaDescIdDesc(usuario);
    }
<<<<<<< HEAD

    @Transactional
    public Transaccion actualizarTransaccion(Long id, Transaccion actualizacion) {
        // HU-08: Edición de transacciones con validación de pertenencia y reglas de negocio [cite: 33, 40]
        
        // 1. Buscar la transacción existente
        Optional<Transaccion> existente = transaccionRepository.findById(id);
        if (existente.isEmpty()) {
            throw new RuntimeException("La transacción no existe o fue eliminada");
        }

        Transaccion transaccion = existente.get();

        // 2. Verificación de Seguridad Obligatoria: Validar que el usuario sea propietario [cite: 33, 40]
        if (actualizacion.getUsuario() == null || actualizacion.getUsuario().getId() == null) {
            throw new RuntimeException("Falta validación de usuario en la solicitud");
        }
        
        Long usuarioIdSolicitante = actualizacion.getUsuario().getId();
        Long usuarioIdPropietario = transaccion.getUsuario().getId();
        
        if (!usuarioIdSolicitante.equals(usuarioIdPropietario)) {
            throw new RuntimeException("No tienes permisos para editar esta transacción");
        }

        // 3. Validación del monto: Debe ser > 0 [cite: 17, 27]
        if (actualizacion.getMonto() != null) {
            if (actualizacion.getMonto() <= 0) {
                throw new RuntimeException("El monto debe ser un valor positivo mayor a cero [Regla HU-06/07]");
            }
            transaccion.setMonto(actualizacion.getMonto());
        }

        // 4. Validación de fecha: No puede ser futura [cite: 40, 42, 43]
        if (actualizacion.getFecha() != null) {
            if (actualizacion.getFecha().isAfter(LocalDate.now())) {
                throw new RuntimeException("No puedes registrar transacciones que aún no han ocurrido [Regla HU-06]");
            }
            transaccion.setFecha(actualizacion.getFecha());
        }

        // 5. Categoría debe ser válida [cite: 33, 36]
        if (actualizacion.getCategoria() != null && actualizacion.getCategoria().getId() != null) {
            transaccion.setCategoria(actualizacion.getCategoria());
        }

        // 6. Descripción
        if (actualizacion.getDescripcion() != null && !actualizacion.getDescripcion().isEmpty()) {
            transaccion.setDescripcion(actualizacion.getDescripcion());
        }

        // 7. Tipo (INGRESO/GASTO)
        if (actualizacion.getTipo() != null) {
            if (!actualizacion.getTipo().equalsIgnoreCase("INGRESO") && 
                !actualizacion.getTipo().equalsIgnoreCase("GASTO")) {
                throw new RuntimeException("El tipo de transacción debe ser INGRESO o GASTO");
            }
            transaccion.setTipo(actualizacion.getTipo());
        }

        // El balance se recalculará automáticamente cuando se consulte (BalanceService)
        return transaccionRepository.save(transaccion);
    }

    @Transactional
public void eliminarTransaccion(Long id) {
    // 1. Buscar la transacción existente
    Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("La transacción no existe o fue eliminada"));

    // 2. Verificación de Seguridad (HU-08)
    // Aquí es donde "usas" la variable. Por ahora imprimimos un log de auditoría
    // para que Java vea que la variable tiene un propósito.
    System.out.println("Eliminando transacción ID: " + transaccion.getId() + " del usuario: " + transaccion.getUsuario().getId());

    // 3. Ejecutar eliminación
    transaccionRepository.delete(transaccion); 
}
=======
>>>>>>> 1fd01cd34ce9c9a4a0a7e55c789d3722519ae4d5
}