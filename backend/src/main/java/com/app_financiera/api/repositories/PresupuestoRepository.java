package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.PresupuestoCategoria;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresupuestoRepository extends JpaRepository<PresupuestoCategoria, Long> {
    
    // Obtener todos los presupuestos de un usuario para un mes específico (HU-12)
    List<PresupuestoCategoria> findByUsuarioAndMes(Usuario usuario, String mes);
    
    // Obtener presupuesto específico de una categoría en un mes (HU-12)
    Optional<PresupuestoCategoria> findByUsuarioAndCategoriaAndMes(Usuario usuario, Categoria categoria, String mes);
    
    // Verificar si existe presupuesto para una categoría y mes
    boolean existsByUsuarioAndCategoriaAndMes(Usuario usuario, Categoria categoria, String mes);
    
    // Obtener todos los presupuestos de un usuario (para consultas generales)
    List<PresupuestoCategoria> findByUsuario(Usuario usuario);
}
