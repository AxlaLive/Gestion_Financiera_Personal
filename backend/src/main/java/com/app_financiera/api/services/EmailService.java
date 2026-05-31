package com.app_financiera.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Usuario;

@Service
public class EmailService {

    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * En entornos reales, implementar con `JavaMailSender` y plantillas.
     * Aquí se expone un punto de extensión que actualmente registra el "envío".
     */
    public void sendPasswordResetEmail(Usuario usuario, String token) {
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String resetLink = String.format("%s/reset-password?token=%s", baseUrl, token);
        log.info("[PasswordReset] Enviando email a {} con link: {}", usuario.getCorreo(), resetLink);
    }
}
