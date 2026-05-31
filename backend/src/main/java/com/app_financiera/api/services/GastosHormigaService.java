package com.app_financiera.api.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app_financiera.api.dto.GastoHormigaHistoricoMesDTO;
import com.app_financiera.api.dto.GastoHormigaResumenDTO;
import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.TransaccionRepository;
import com.app_financiera.api.repositories.UsuarioRepository;

@Service
public class GastosHormigaService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TransaccionRepository transaccionRepository;

    public GastoHormigaResumenDTO obtenerResumen(Long usuarioId) {
        Usuario usuario = obtenerUsuario(usuarioId);
        return calcularResumen(usuario);
    }

    @Transactional
    public GastoHormigaResumenDTO actualizarLimite(Long usuarioId, BigDecimal limite) {
        if (limite == null || limite.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El límite debe ser un número mayor a cero");
        }

        Usuario usuario = obtenerUsuario(usuarioId);
        usuario.setGastoHormigaLimite(limite);
        usuarioRepository.save(usuario);
        return calcularResumen(usuario);
    }

    public List<Transaccion> listarGastosHormiga(Long usuarioId) {
        Usuario usuario = obtenerUsuario(usuarioId);
        BigDecimal limite = usuario.getGastoHormigaLimite();
        if (limite == null) {
            return List.of();
        }

        LocalDate inicioMes = YearMonth.now().atDay(1);
        LocalDate inicioSiguienteMes = inicioMes.plusMonths(1);

        return transaccionRepository.findByUsuarioAndTipoAndMontoLessThanAndFechaBetween(
                usuario, "GASTO", limite.doubleValue(), inicioMes, inicioSiguienteMes);
    }

    public List<GastoHormigaHistoricoMesDTO> obtenerHistorico(Long usuarioId, int meses) {
        Usuario usuario = obtenerUsuario(usuarioId);
        BigDecimal limite = usuario.getGastoHormigaLimite();
        if (limite == null || meses <= 0) {
            return List.of();
        }

        List<GastoHormigaHistoricoMesDTO> historico = new ArrayList<>();
        for (int i = meses - 1; i >= 0; i--) {
            YearMonth targetMonth = YearMonth.now().minusMonths(i);
            LocalDate desde = targetMonth.atDay(1);
            LocalDate hasta = targetMonth.plusMonths(1).atDay(1);

            Double total = transaccionRepository.sumGastosHormigaPorPeriodo(usuario, limite.doubleValue(), desde, hasta);
            if (total == null) {
                total = 0.0;
            }
            List<Transaccion> transacciones = transaccionRepository.findByUsuarioAndTipoAndMontoLessThanAndFechaBetween(
                    usuario, "GASTO", limite.doubleValue(), desde, hasta);

            historico.add(new GastoHormigaHistoricoMesDTO(
                    targetMonth.toString(),
                    total,
                    transacciones.size()));
        }

        return historico;
    }

    private GastoHormigaResumenDTO calcularResumen(Usuario usuario) {
        BigDecimal limite = usuario.getGastoHormigaLimite();
        if (limite == null) {
            return new GastoHormigaResumenDTO(
                    null,
                    0.0,
                    0,
                    0.0,
                    0.0,
                    "Configura un límite de gasto hormiga para que el sistema clasifique automáticamente tus pequeñas compras.");
        }

        LocalDate inicioMes = YearMonth.now().atDay(1);
        LocalDate inicioSiguienteMes = inicioMes.plusMonths(1);

        Double acumulado = transaccionRepository.sumGastosHormigaPorPeriodo(
                usuario, limite.doubleValue(), inicioMes, inicioSiguienteMes);
        if (acumulado == null) {
            acumulado = 0.0;
        }

        Double totalGastosMes = transaccionRepository.sumGastosPorPeriodo(usuario, inicioMes, inicioSiguienteMes);
        if (totalGastosMes == null) {
            totalGastosMes = 0.0;
        }

        int cantidad = transaccionRepository
                .findByUsuarioAndTipoAndMontoLessThanAndFechaBetween(usuario, "GASTO", limite.doubleValue(), inicioMes, inicioSiguienteMes)
                .size();

        double porcentaje = totalGastosMes > 0 ? (acumulado / totalGastosMes) * 100 : 0;
        String recomendacion = generarRecomendacion(limite, BigDecimal.valueOf(acumulado), porcentaje);

        return new GastoHormigaResumenDTO(
                limite,
                acumulado,
                cantidad,
                totalGastosMes,
                porcentaje,
                recomendacion);
    }

    private String generarRecomendacion(BigDecimal limite, BigDecimal acumulado, double porcentaje) {
        if (acumulado.compareTo(BigDecimal.ZERO) == 0) {
            return "No se encontraron gastos hormiga este mes. Buen trabajo manteniendo el control.";
        }

        if (porcentaje >= 30) {
            return String.format(
                    "Tus gastos hormiga representan un %d%% del gasto total del mes. Revisa las pequeñas compras frecuentes y considera reducirlas.",
                    Math.round(porcentaje));
        }

        if (acumulado.compareTo(new BigDecimal("500000")) >= 0) {
            return "Tus gastos hormiga suman una cantidad considerable. Revisa tus compras diarias para evitar gastos innecesarios.";
        }

        if (acumulado.compareTo(new BigDecimal("150000")) >= 0) {
            return "Tus gastos hormiga están en un rango moderado. Puedes ahorrar más si evitas varias compras pequeñas a la semana.";
        }

        return "Tus gastos hormiga están bajo control. Sigue atento a los pequeños desembolsos para mantener ese ahorro.";
    }

    private Usuario obtenerUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
