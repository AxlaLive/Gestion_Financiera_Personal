package com.app_financiera.api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.security.JwtTokenService;
import com.app_financiera.api.services.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtTokenService jwtTokenService;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.registrarUsuario(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPerfil(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            Usuario encontrado = usuarioService.login(usuario.getCorreo(), usuario.getPassword());
            String token = jwtTokenService.generateToken(encontrado);

            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "usuario", Map.of(
                                    "id", encontrado.getId(),
                                    "correo", encontrado.getCorreo(),
                                    "nombre", encontrado.getNombre(),
                                    "moneda", encontrado.getMoneda()
                            )
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
