package com.app_financiera.api.controllers;

import com.app_financiera.api.entities.PasswordResetToken;
import com.app_financiera.api.services.PasswordResetService;
import com.app_financiera.api.util.PasswordPolicy;
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

    @GetMapping("/reset-password/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "reason", "missing", "message", "Token inválido"));
        }

        try {
            PasswordResetToken prt = passwordResetService.validateToken(token);
            return ResponseEntity.ok(Map.of("ok", true, "email", prt.getUsuario().getCorreo()));
        } catch (RuntimeException e) {
            String message = e.getMessage();
            String reason = "missing";
            if (message.toLowerCase().contains("expir")) {
                reason = "expired";
            } else if (message.toLowerCase().contains("usado")) {
                reason = "used";
            }
            return ResponseEntity.badRequest().body(Map.of("ok", false, "reason", reason, "message", message));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");

        if (token == null || token.isBlank() || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token y contraseña son requeridos"));
        }

        // Server-side password validation
        String validationError = PasswordPolicy.validateForReset(password);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        try {
            passwordResetService.resetPassword(token, password);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
