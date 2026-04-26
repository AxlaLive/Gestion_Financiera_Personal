package com.app_financiera.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app_financiera.api.entities.Categoria;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.CategoriaRepository;
import com.app_financiera.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * Regla HU-01: Registro de Cuenta [cite: 2]
     */
    @Transactional
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

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // 5. Crear categorías por defecto para el nuevo usuario
        crearCategoriasDefault(usuarioGuardado);

        return usuarioGuardado;
    }

    private void crearCategoriasDefault(Usuario usuario) {
        List<String> nombresIngreso = List.of(
            "Salario", "Freelance", "Regalo", "Inversiones", "Negocio", "Otros"
        );
        List<String> nombresGasto = List.of(
            "Comida", "Transporte", "Hogar", "Compras", "Salud", "Ocio",
            "Viajes", "Educación", "Ropa", "Tecnología", "Cafés", "Otros"
        );

        for (String nombre : nombresIngreso) {
            Categoria cat = new Categoria();
            cat.setNombre(nombre);
            cat.setTipo("INGRESO");
            cat.setUsuario(usuario);
            categoriaRepository.save(cat);
        }

        for (String nombre : nombresGasto) {
            Categoria cat = new Categoria();
            cat.setNombre(nombre);
            cat.setTipo("GASTO");
            cat.setUsuario(usuario);
            categoriaRepository.save(cat);
        }
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

    public Usuario login(String correo, String password) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return usuario;
    }
}