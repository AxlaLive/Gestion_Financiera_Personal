package com.app_financiera.api.services;

import com.app_financiera.api.entities.Cita;
import com.app_financiera.api.repositories.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    public List<Cita> obtenerCitasPorProfesional(Long profesionalId) {
        return citaRepository.findByProfesionalId(profesionalId);
    }
}