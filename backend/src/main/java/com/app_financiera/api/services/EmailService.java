package com.app_financiera.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Usuario;

@Service
public class EmailService {

    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    /**
     * En entornos reales, implementar con `JavaMailSender` y plantillas.
     * Aquí se expone un punto de extensión que actualmente registra el "envío".
     */
    public void sendPasswordResetEmail(Usuario usuario, String token) {
        String resetLink = String.format("https://your-frontend.example/reset-password?token=%s", token);
        log.info("[PasswordReset] Enviando email a {} con link: {}", usuario.getCorreo(), resetLink);
    }
}
