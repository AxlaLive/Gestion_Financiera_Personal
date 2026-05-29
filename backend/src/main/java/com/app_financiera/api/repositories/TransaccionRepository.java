package com.app_financiera.api.repositories;

import com.app_financiera.api.dto.GastoCategoriaDTO;
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

    @Query("SELECT t FROM Transaccion t " +
           "WHERE t.usuario = :usuario " +
           "AND t.fecha >= :desde " +
           "AND t.fecha < :hasta " +
           "ORDER BY t.fecha DESC, t.id DESC")
    List<Transaccion> findByUsuarioAndFechaBetween(
            @Param("usuario") Usuario usuario,
            @Param("desde") java.time.LocalDate desde,
            @Param("hasta") java.time.LocalDate hasta);

    // Para el balance: Filtramos por tipo (INGRESO/GASTO) directamente en la DB [cite: 93, 98]
    List<Transaccion> findByUsuarioAndTipo(Usuario usuario, String tipo);

    // El que ya tenías para reportes por categoría (HU-15) [cite: 113]
    List<Transaccion> findByUsuarioAndCategoriaId(Usuario usuario, Long categoriaId);
    
    // Para HU-12: Obtener gasto total de una categoría en un período (mes)
    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t " +
           "WHERE t.usuario = :usuario AND t.categoria = :categoria " +
           "AND t.tipo = 'GASTO' " +
           "AND t.fecha >= :desde AND t.fecha < :hasta")
    Double sumGastosPorCategoriaYMes(@Param("usuario") Usuario usuario,
                                      @Param("categoria") Categoria categoria,
                                      @Param("desde") LocalDate desde,
                                      @Param("hasta") LocalDate hasta);

    @Query("SELECT new com.app_financiera.api.dto.GastoCategoriaDTO(" +
           "t.categoria.nombre, SUM(t.monto)) " +
           "FROM Transaccion t " +
           "WHERE t.usuario = :usuario " +
           "AND t.tipo = 'GASTO' " +
           "AND t.fecha >= :desde " +
           "AND t.fecha < :hasta " +
           "GROUP BY t.categoria.nombre " +
           "ORDER BY SUM(t.monto) DESC")
    List<GastoCategoriaDTO> obtenerResumenGastosPorCategoriaMes(
            @Param("usuario") Usuario usuario,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);
    
    // Para HU-16: Obtener total de gastos (egresos) para un período específico [cite: Tarea 86]
    // Utilizado para calcular tendencias mensuales comparativas
    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t " +
           "WHERE t.usuario = :usuario " +
           "AND t.tipo = 'GASTO' " +
           "AND t.fecha >= :desde " +
           "AND t.fecha < :hasta")
    Double sumGastosPorPeriodo(@Param("usuario") Usuario usuario,
                               @Param("desde") LocalDate desde,
                               @Param("hasta") LocalDate hasta);
}
