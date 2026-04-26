package com.app_financiera.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.repositories.CategoriaRepository;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public Categoria crearCategoria(Categoria categoria) {
        // Regla: No permitir categorías con nombre vacío
        if (categoria.getNombre() == null || categoria.getNombre().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio");
        }
        return categoriaRepository.save(categoria);
    }

    public List<Categoria> listarPorUsuario(Long usuarioId) {
        return categoriaRepository.findByUsuarioId(usuarioId);
    }
}