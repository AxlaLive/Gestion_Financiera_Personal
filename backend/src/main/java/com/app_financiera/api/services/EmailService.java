package com.app_financiera.api.services;

import com.app_financiera.api.entities.Usuario;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(Usuario usuario, String token) {
        String resetLink = buildResetLink(token);
        String correo = usuario.getCorreo();

        if (!isMailConfigured()) {
            log.warn(
                    "[PasswordReset] SMTP no configurado (SPRING_MAIL_HOST vacío). "
                            + "Enlace de recuperación para {} → {}",
                    correo,
                    resetLink);
            return;
        }

        String from = resolveFromAddress();
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(correo);
            helper.setSubject("Recupera tu contraseña - Gestión Financiera");
            helper.setText(buildPlainText(resetLink), buildHtmlText(resetLink));
            mailSender.send(message);
            log.info("[PasswordReset] Correo enviado a {}", correo);
        } catch (MessagingException e) {
            log.error("[PasswordReset] No se pudo enviar el correo a {}", correo, e);
            throw new RuntimeException("No se pudo enviar el correo de recuperación");
        }
    }

    private boolean isMailConfigured() {
        return mailSender != null && mailHost != null && !mailHost.isBlank();
    }

    private String resolveFromAddress() {
        if (mailFrom != null && !mailFrom.isBlank()) {
            return mailFrom.trim();
        }
        throw new IllegalStateException("Configura APP_MAIL_FROM o SPRING_MAIL_USERNAME como remitente del correo");
    }

    private String buildResetLink(String token) {
        String baseUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;
        return baseUrl + "/reset-password?token=" + token;
    }

    private String buildPlainText(String resetLink) {
        return """
                Hola,

                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Gestión Financiera.

                Abre este enlace (válido 30 minutos):
                %s

                Si no solicitaste este cambio, ignora este mensaje.

                — Gestión Financiera
                """.formatted(resetLink);
    }

    private String buildHtmlText(String resetLink) {
        return """
                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Gestión Financiera</strong>.</p>
                <p><a href="%s" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Restablecer contraseña</a></p>
                <p>O copia este enlace en el navegador:<br><a href="%s">%s</a></p>
                <p style="color:#64748b;font-size:14px;">El enlace expira en 30 minutos. Si no solicitaste este cambio, ignora este correo.</p>
                """.formatted(resetLink, resetLink, resetLink);
    }
}
