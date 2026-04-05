package com.app_financiera.api.repositories;

import com.app_financiera.api.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método clave para autenticación y validaciones
    Optional<Usuario> findByCorreo(String correo);
    
    // Para verificar si un correo ya existe antes de registrar
    Boolean existsByCorreo(String correo);
}