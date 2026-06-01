package com.app_financiera.api.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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

    @Transactional(readOnly = true)
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
                    "Configura el monto máximo por compra para que clasifiquemos automáticamente tus gastos hormiga.");
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
        String recomendacion = generarRecomendacion(
                usuario,
                limite,
                BigDecimal.valueOf(acumulado),
                cantidad,
                porcentaje,
                inicioMes,
                inicioSiguienteMes);

        return new GastoHormigaResumenDTO(
                limite,
                acumulado,
                cantidad,
                totalGastosMes,
                porcentaje,
                recomendacion);
    }

    private String generarRecomendacion(
            Usuario usuario,
            BigDecimal limite,
            BigDecimal acumulado,
            int cantidadHormigas,
            double porcentaje,
            LocalDate desde,
            LocalDate hasta) {
        if (acumulado.compareTo(BigDecimal.ZERO) == 0) {
            return "No se encontraron gastos hormiga este mes. Buen trabajo manteniendo el control.";
        }

        List<Transaccion> gastosGrandes = transaccionRepository
                .findByUsuarioAndTipoAndMontoGreaterThanEqualAndFechaBetweenOrderByMontoDesc(
                        usuario, "GASTO", limite.doubleValue(), desde, hasta);

        if (!gastosGrandes.isEmpty()) {
            String comparacion = compararConGastoGrande(acumulado, cantidadHormigas, gastosGrandes);
            if (comparacion != null) {
                return comparacion;
            }
        }

        if (porcentaje >= 30) {
            return String.format(
                    "Tus gastos hormiga representan un %d%% del gasto total del mes. Revisa las pequeñas compras frecuentes y considera reducirlas.",
                    Math.round(porcentaje));
        }

        if (acumulado.compareTo(new BigDecimal("500000")) >= 0) {
            return String.format(
                    "Tus %d gastos hormiga suman %s este mes. Revisa las compras pequeñas frecuentes.",
                    cantidadHormigas,
                    formatearPesos(acumulado));
        }

        if (acumulado.compareTo(new BigDecimal("150000")) >= 0) {
            return "Tus gastos hormiga están en un rango moderado. Puedes ahorrar más si evitas varias compras pequeñas a la semana.";
        }

        return "Tus gastos hormiga están bajo control. Sigue atento a los pequeños desembolsos para mantener ese ahorro.";
    }

    private String compararConGastoGrande(
            BigDecimal acumuladoHormiga,
            int cantidadHormigas,
            List<Transaccion> gastosGrandes) {
        for (Transaccion gasto : gastosGrandes) {
            BigDecimal montoGasto = BigDecimal.valueOf(gasto.getMonto());
            if (acumuladoHormiga.compareTo(montoGasto) < 0) {
                continue;
            }

            String etiqueta = etiquetaTransaccion(gasto);
            String acumuladoTexto = formatearPesos(acumuladoHormiga);
            String montoTexto = formatearPesos(montoGasto);

            int veces = acumuladoHormiga.divide(montoGasto, 0, RoundingMode.FLOOR).intValue();
            if (veces >= 2) {
                return String.format(
                        "Este mes acumulaste %s en %d gastos hormiga. Con ese dinero podrías haber cubierto %d veces «%s» (%s).",
                        acumuladoTexto,
                        cantidadHormigas,
                        veces,
                        etiqueta,
                        montoTexto);
            }

            return String.format(
                    "Este mes acumulaste %s en %d gastos hormiga. Eso equivale a lo que gastaste en «%s» (%s).",
                    acumuladoTexto,
                    cantidadHormigas,
                    etiqueta,
                    montoTexto);
        }

        Transaccion mayorGasto = gastosGrandes.get(0);
        BigDecimal montoMayor = BigDecimal.valueOf(mayorGasto.getMonto());
        BigDecimal faltante = montoMayor.subtract(acumuladoHormiga);

        return String.format(
                "Llevas %s en %d gastos hormiga. Te faltan %s para igualar tu mayor gasto del mes: «%s» (%s).",
                formatearPesos(acumuladoHormiga),
                cantidadHormigas,
                formatearPesos(faltante),
                etiquetaTransaccion(mayorGasto),
                formatearPesos(montoMayor));
    }

    private String etiquetaTransaccion(Transaccion transaccion) {
        if (transaccion.getDescripcion() != null && !transaccion.getDescripcion().isBlank()) {
            return transaccion.getDescripcion().trim();
        }
        if (transaccion.getCategoria() != null && transaccion.getCategoria().getNombre() != null) {
            return transaccion.getCategoria().getNombre();
        }
        return "un gasto grande";
    }

    private String formatearPesos(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
        formato.setMaximumFractionDigits(0);
        formato.setMinimumFractionDigits(0);
        return formato.format(valor);
    }

    private Usuario obtenerUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
