package com.app_financiera.api.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.TransaccionRepository;

@Service
public class BalanceService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    public Map<String, Object> obtenerEstadoFinanciero(Usuario usuario) {
        List<Transaccion> ingresosList = transaccionRepository.findByUsuarioAndTipo(usuario, "INGRESO");
        List<Transaccion> gastosList = transaccionRepository.findByUsuarioAndTipo(usuario, "GASTO");

        // Escenario 3: Usuario nuevo (ambas listas vacías) [cite: 101, 106]
        if (ingresosList.isEmpty() && gastosList.isEmpty()) {
            return crearRespuestaBalance(0.0, "Gris", "Comienza registrando tu primer ingreso ");
        }

        double totalIngresos = ingresosList.stream().mapToDouble(Transaccion::getMonto).sum();
        double totalGastos = gastosList.stream().mapToDouble(Transaccion::getMonto).sum();
        double balance = totalIngresos - totalGastos; 

        // Escenario 1: Balance positivo [cite: 91]
        if (balance > 0) {
            return crearRespuestaBalance(balance, "Verde Esmeralda", "¡Vas por buen camino!");
        } 
        
        // Escenario 2: Balance negativo [cite: 96]
        if (balance < 0) {
            return crearRespuestaBalance(balance, "Rojo Alerta", "Tus gastos superan tus ingresos este mes.");
        }

        // Escenario 4: Balance neutro [cite: 108, 111]
        return crearRespuestaBalance(0.0, "Gris/Negro", "No hay excedente ni deuda.");
    }

    private Map<String, Object> crearRespuestaBalance(Double monto, String color, String mensaje) {
        Map<String, Object> res = new HashMap<>();
        res.put("monto", monto);
        res.put("color", color);
        res.put("mensaje", mensaje);
        return res;
    }
}