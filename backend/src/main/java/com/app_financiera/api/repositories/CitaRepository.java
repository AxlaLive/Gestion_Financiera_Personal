package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.Cita; // Ajusta el import según tu entidad
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    // Método para buscar citas por el ID del profesional
    List<Cita> findByProfesionalId(Long profesionalId);
}