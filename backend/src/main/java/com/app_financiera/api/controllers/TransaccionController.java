package com.app_financiera.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
=======
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.services.TransaccionService;

@RestController
@RequestMapping("/api/transacciones")
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

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

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Transaccion>> verHistorial(@PathVariable Long usuarioId) {
        // Retorna la lista cronológica [cite: 73]
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        return ResponseEntity.ok(transaccionService.listarHistorial(usuario));
    }
<<<<<<< HEAD
    
    @PutMapping("/{id}/usuario/{usuarioId}")
    public ResponseEntity<?> actualizarTransaccion(@PathVariable Long id, @PathVariable Long usuarioId, @RequestBody Transaccion transaccion) {
        try {
            Transaccion actualizada = transaccionService.actualizarTransaccion(id, transaccion, usuarioId);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/usuario/{usuarioId}")
    public ResponseEntity<?> eliminarTransaccion(@PathVariable Long id, @PathVariable Long usuarioId) {
        try {
            transaccionService.eliminarTransaccion(id, usuarioId);
            return ResponseEntity.noContent().build(); // Retorna 204 si todo sale bien
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
=======
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
}