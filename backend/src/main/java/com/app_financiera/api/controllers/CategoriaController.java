package com.app_financiera.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.web.bind.annotation.DeleteMapping;
=======
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.services.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        return ResponseEntity.ok(categoriaService.crearCategoria(categoria));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Categoria>> listar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(categoriaService.listarPorUsuario(usuarioId));
    }
<<<<<<< HEAD
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id); // Debes crear este método en CategoriaService
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("No se puede eliminar la categoría");
        }
    }
=======
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
}