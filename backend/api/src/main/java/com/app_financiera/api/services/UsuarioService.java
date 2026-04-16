package com.app_financiera.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Regla HU-01: Registro de Cuenta [cite: 2]
     */
    public Usuario registrarUsuario(Usuario usuario) {
        // 1. Validar formato de correo [cite: 4]
        if (!usuario.getCorreo().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("El formato del correo no es válido [cite: 4]");
        }

        // 2. Validar longitud de contraseña (mínimo 8 caracteres) 
        if (usuario.getPassword() == null || usuario.getPassword().length() < 8) {
            throw new RuntimeException("La contraseña debe tener al menos 8 caracteres ");
        }

        // 3. Impedir registro si el correo ya existe 
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado en el sistema ");
        }

        // 4. Configuración de moneda por defecto (HU-04) [cite: 11, 12]
        if (usuario.getMoneda() == null) {
            usuario.setMoneda("COP"); // Valor predeterminado según análisis 
        }

        return usuarioRepository.save(usuario);
    }

    /**
     * Regla HU-05: Gestión de perfil [cite: 13]
     */
    public Usuario actualizarPerfil(Long id, Usuario datosActualizados) {
        Usuario usuarioExistente = obtenerPorId(id);
        
        // Editar nombre [cite: 14]
        if (datosActualizados.getNombre() != null) {
            usuarioExistente.setNombre(datosActualizados.getNombre());
        }
        
        // El documento menciona foto de usuario[cite: 14], 
        // podrías añadir el campo String fotoUrl a la Entity si lo requieres.

        return usuarioRepository.save(usuarioExistente);
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}