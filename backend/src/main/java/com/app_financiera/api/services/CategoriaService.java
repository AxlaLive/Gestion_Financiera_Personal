package com.app_financiera.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.repositories.CategoriaRepository;

<<<<<<< HEAD
import jakarta.transaction.Transactional;

=======
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
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
<<<<<<< HEAD

    // --- NUEVOS MÉTODOS PARA LA GESTIÓN DE CATEGORÍAS ---

    @Transactional
    public Categoria actualizarCategoria(Long id, Categoria datosNuevos) {
        // Buscamos la categoría existente
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La categoría con ID " + id + " no existe"));

        // Validamos el nombre igual que en el método crear
        if (datosNuevos.getNombre() == null || datosNuevos.getNombre().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio para actualizar");
        }

        // Actualizamos los campos permitidos
        existente.setNombre(datosNuevos.getNombre());
        existente.setTipo(datosNuevos.getTipo());

        return categoriaRepository.save(existente);
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        // Validamos existencia antes de borrar
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar: La categoría no existe");
        }

        try {
            categoriaRepository.deleteById(id);
        } catch (Exception e) {
            // Regla de integridad: No borrar categorías que ya tengan transacciones
            throw new RuntimeException("No se puede eliminar la categoría porque está siendo utilizada en movimientos registrados");
        }
    }
=======
>>>>>>> eb5c694bef0655328603a70f5f20d7f923eb8236
}