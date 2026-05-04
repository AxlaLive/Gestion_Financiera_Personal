package com.app_financiera.api.services;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.PresupuestoCategoria;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.repositories.PresupuestoRepository;
import com.app_financiera.api.repositories.TransaccionRepository;

import jakarta.transaction.Transactional;

@Service
public class PresupuestoService {

    @Autowired
    private PresupuestoRepository presupuestoRepository;

    @Autowired
    private TransaccionRepository transaccionRepository;

    /**
     * Crear o actualizar presupuesto para una categoría en un mes específico
     * HU-12: Persistir un monto máximo por categoría
     */
    @Transactional
    public PresupuestoCategoria crearOActualizarPresupuesto(Usuario usuario, Categoria categoria, 
                                                             String mes, Double presupuestoMaximo) {
        
        // Validaciones
        if (usuario == null || usuario.getId() == null) {
            throw new RuntimeException("Usuario inválido");
        }
        if (categoria == null || categoria.getId() == null) {
            throw new RuntimeException("Categoría inválida");
        }
        if (mes == null || !mes.matches("\\d{4}-\\d{2}")) {
            throw new RuntimeException("Mes debe estar en formato YYYY-MM");
        }
        if (presupuestoMaximo == null || presupuestoMaximo <= 0) {
            throw new RuntimeException("Presupuesto máximo debe ser mayor a cero");
        }
        
        // Validar que la categoría pertenece al usuario
        if (!categoria.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("La categoría no pertenece a este usuario");
        }

        // Buscar si ya existe presupuesto para esa categoría y mes
        var presupuestoExistente = presupuestoRepository.findByUsuarioAndCategoriaAndMes(usuario, categoria, mes);
        
        PresupuestoCategoria presupuesto;
        if (presupuestoExistente.isPresent()) {
            // Actualizar presupuesto existente
            presupuesto = presupuestoExistente.get();
            presupuesto.setPresupuestoMaximo(presupuestoMaximo);
        } else {
            // Crear nuevo presupuesto
            presupuesto = new PresupuestoCategoria();
            presupuesto.setUsuario(usuario);
            presupuesto.setCategoria(categoria);
            presupuesto.setMes(mes);
            presupuesto.setPresupuestoMaximo(presupuestoMaximo);
        }

        return presupuestoRepository.save(presupuesto);
    }

    /**
     * Obtener estado de gasto vs límite por categoría en el mes actual
     * HU-12: Permitir consultar el estado de gasto vs límite por categoría en el mes actual
     */
    public EstadoPresupuestoDTO obtenerEstadoPresupuesto(Usuario usuario, Categoria categoria) {
        
        if (usuario == null || usuario.getId() == null) {
            throw new RuntimeException("Usuario inválido");
        }
        if (categoria == null || categoria.getId() == null) {
            throw new RuntimeException("Categoría inválida");
        }

        // Obtener mes actual en formato YYYY-MM
        String mesActual = YearMonth.now().toString();
        
        // Buscar presupuesto para este mes
        var presupuestoOpt = presupuestoRepository.findByUsuarioAndCategoriaAndMes(usuario, categoria, mesActual);
        
        if (presupuestoOpt.isEmpty()) {
            // No hay presupuesto definido para esta categoría este mes
            return null;
        }

        PresupuestoCategoria presupuesto = presupuestoOpt.get();

        // Calcular gasto actual del mes en esta categoría
        LocalDate hoy = LocalDate.now();
        java.time.YearMonth periodo = java.time.YearMonth.of(hoy.getYear(), hoy.getMonthValue());
        LocalDate desde = periodo.atDay(1);
        LocalDate hasta = periodo.plusMonths(1).atDay(1);
        Double gastoActual = transaccionRepository.sumGastosPorCategoriaYMes(usuario, categoria, desde, hasta);
        
        gastoActual = gastoActual != null ? gastoActual : 0.0;

        // Calcular porcentaje consumido
        double porcentajeConsumido = (gastoActual / presupuesto.getPresupuestoMaximo()) * 100;
        
        // Indicar si fue excedido
        boolean excedido = gastoActual > presupuesto.getPresupuestoMaximo();

        return new EstadoPresupuestoDTO(
            categoria.getId(),
            categoria.getNombre(),
            presupuesto.getPresupuestoMaximo(),
            gastoActual,
            porcentajeConsumido,
            excedido,
            mesActual
        );
    }

    /**
     * Obtener estado de todos los presupuestos del usuario para el mes actual
     */
    public List<EstadoPresupuestoDTO> obtenerEstadoTodosPresupuestos(Usuario usuario) {
        
        if (usuario == null || usuario.getId() == null) {
            throw new RuntimeException("Usuario inválido");
        }

        String mesActual = YearMonth.now().toString();
        
        // Obtener todos los presupuestos del usuario para este mes
        List<PresupuestoCategoria> presupuestos = presupuestoRepository.findByUsuarioAndMes(usuario, mesActual);

        return presupuestos.stream()
                .map(presupuesto -> {
                    LocalDate hoy = LocalDate.now();
                    java.time.YearMonth periodo = java.time.YearMonth.of(hoy.getYear(), hoy.getMonthValue());
                    LocalDate desde = periodo.atDay(1);
                    LocalDate hasta = periodo.plusMonths(1).atDay(1);
                    Double gastoActual = transaccionRepository.sumGastosPorCategoriaYMes(
                        usuario, presupuesto.getCategoria(), desde, hasta
                    );
                    gastoActual = gastoActual != null ? gastoActual : 0.0;

                    double porcentajeConsumido = (gastoActual / presupuesto.getPresupuestoMaximo()) * 100;
                    boolean excedido = gastoActual > presupuesto.getPresupuestoMaximo();

                    return new EstadoPresupuestoDTO(
                        presupuesto.getCategoria().getId(),
                        presupuesto.getCategoria().getNombre(),
                        presupuesto.getPresupuestoMaximo(),
                        gastoActual,
                        porcentajeConsumido,
                        excedido,
                        mesActual
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * DTO para respuestas de estado de presupuesto
     * HU-12: Indicar si el presupuesto fue excedido
     */
    public static class EstadoPresupuestoDTO {
        public Long categoriaId;
        public String categoriaNombre;
        public Double presupuestoMaximo;
        public Double gastoActual;
        public Double porcentajeConsumido;
        public Boolean excedido;
        public String mes;

        public EstadoPresupuestoDTO(Long categoriaId, String categoriaNombre, Double presupuestoMaximo,
                                   Double gastoActual, Double porcentajeConsumido, Boolean excedido, String mes) {
            this.categoriaId = categoriaId;
            this.categoriaNombre = categoriaNombre;
            this.presupuestoMaximo = presupuestoMaximo;
            this.gastoActual = gastoActual;
            this.porcentajeConsumido = porcentajeConsumido;
            this.excedido = excedido;
            this.mes = mes;
        }

        // Getters (Lombok no aplica aquí pues es clase estática)
        public Long getCategoriaId() { return categoriaId; }
        public String getCategoriaNombre() { return categoriaNombre; }
        public Double getPresupuestoMaximo() { return presupuestoMaximo; }
        public Double getGastoActual() { return gastoActual; }
        public Double getPorcentajeConsumido() { return porcentajeConsumido; }
        public Boolean getExcedido() { return excedido; }
        public String getMes() { return mes; }
    }
}
