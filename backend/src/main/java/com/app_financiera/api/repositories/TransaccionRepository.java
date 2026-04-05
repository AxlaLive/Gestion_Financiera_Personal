package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    
    // Para el historial cronológico (HU-09) [cite: 72]
    List<Transaccion> findByUsuarioOrderByFechaDescIdDesc(Usuario usuario);

    // Para el balance: Filtramos por tipo (INGRESO/GASTO) directamente en la DB [cite: 93, 98]
    List<Transaccion> findByUsuarioAndTipo(Usuario usuario, String tipo);

    // El que ya tenías para reportes por categoría (HU-15) [cite: 113]
    List<Transaccion> findByUsuarioAndCategoriaId(Usuario usuario, Long categoriaId);
}