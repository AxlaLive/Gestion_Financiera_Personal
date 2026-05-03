package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    // Obtener todas las categorías de un usuario específico
    List<Categoria> findByUsuario(Usuario usuario);
    
    // Buscar categorías por tipo (INGRESO/GASTO) para un usuario
    List<Categoria> findByUsuarioAndTipo(Usuario usuario, String tipo);

    List<Categoria> findByUsuarioId(Long usuarioId);
}