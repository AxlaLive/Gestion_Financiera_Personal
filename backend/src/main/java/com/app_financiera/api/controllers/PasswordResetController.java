package com.app_financiera.api.controllers;

import com.app_financiera.api.services.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    // CA-03: Always return generic message to avoid user enumeration
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        if (correo != null && !correo.isBlank()) {
            try {
                passwordResetService.createPasswordResetTokenForEmail(correo.trim());
            } catch (Exception e) {
                // Log and swallow to avoid revealing info
            }
        }
        return ResponseEntity.ok(Map.of("message", "Si el correo existe, se ha enviado un enlace para recuperar la contraseña"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");

        if (token == null || token.isBlank() || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token y contraseña son requeridos"));
        }

        // Server-side password validation (CA-76)
        String validationError = validatePassword(password);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        try {
            passwordResetService.resetPassword(token, password);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String validatePassword(String password) {
        if (password.length() < 10) return "La contraseña debe tener al menos 10 caracteres";
        if (!password.chars().anyMatch(Character::isUpperCase)) return "La contraseña debe contener al menos una letra mayúscula";
        if (!password.chars().anyMatch(Character::isLowerCase)) return "La contraseña debe contener al menos una letra minúscula";
        if (!password.chars().anyMatch(Character::isDigit)) return "La contraseña debe contener al menos un dígito";
        if (!password.matches(".*[^A-Za-z0-9].*")) return "La contraseña debe contener al menos un carácter especial";
        return null;
    }
}
