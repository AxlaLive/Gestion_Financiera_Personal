package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    
    // Para el historial cronológico (HU-09) [cite: 72]
    List<Transaccion> findByUsuarioOrderByFechaDescIdDesc(Usuario usuario);

    // Para el balance: Filtramos por tipo (INGRESO/GASTO) directamente en la DB [cite: 93, 98]
    List<Transaccion> findByUsuarioAndTipo(Usuario usuario, String tipo);

    // El que ya tenías para reportes por categoría (HU-15) [cite: 113]
    List<Transaccion> findByUsuarioAndCategoriaId(Usuario usuario, Long categoriaId);
    
    // Para HU-12: Obtener gasto total de una categoría en un período (mes)
    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t " +
           "WHERE t.usuario = :usuario AND t.categoria = :categoria " +
           "AND t.tipo = 'GASTO' " +
           "AND YEAR(t.fecha) = :year AND MONTH(t.fecha) = :month")
    Double sumGastosPorCategoriaYMes(@Param("usuario") Usuario usuario, 
                                      @Param("categoria") Categoria categoria,
                                      @Param("year") int year,
                                      @Param("month") int month);
}