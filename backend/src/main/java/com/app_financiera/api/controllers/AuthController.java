package com.app_financiera.api.controllers;

import com.app_financiera.api.services.JwtBlacklistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controlador de autenticación responsable de operaciones de login/logout.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtBlacklistService jwtBlacklistService;

    public AuthController(JwtBlacklistService jwtBlacklistService) {
        this.jwtBlacklistService = jwtBlacklistService;
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Encabezado Authorization inválido o token ausente"));
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token JWT vacío"));
        }

        jwtBlacklistService.añadirAListaNegra(token);
        return ResponseEntity.ok(Map.of("message", "Sesión invalidada correctamente"));
    }
}
