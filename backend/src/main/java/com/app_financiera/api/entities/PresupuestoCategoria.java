package com.app_financiera.api.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "presupuestos_categorias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "categoria_id", "mes"})
})
@Data
public class PresupuestoCategoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    // Formato: "YYYY-MM" (ej: "2026-04")
    @Column(nullable = false, length = 7)
    private String mes;

    // Monto máximo permitido para egresos en esta categoría durante el mes
    @Column(nullable = false)
    private Double presupuestoMaximo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
