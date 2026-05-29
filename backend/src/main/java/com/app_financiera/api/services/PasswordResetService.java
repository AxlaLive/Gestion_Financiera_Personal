package com.app_financiera.api.services;

import com.app_financiera.api.entities.PasswordResetToken;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.PasswordResetTokenRepository;
import com.app_financiera.api.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final int EXPIRATION_MINUTES = 30;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public void createPasswordResetTokenForEmail(String correo) {
        Optional<Usuario> optional = usuarioRepository.findByCorreo(correo);
        if (optional.isEmpty()) return; // Security: do not reveal existence

        Usuario usuario = optional.get();
        String token = generateSecureToken();

        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUsuario(usuario);
        prt.setExpiresAt(Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES));
        prt.setUsed(false);
        tokenRepository.save(prt);

        emailService.sendPasswordResetEmail(usuario, token);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public PasswordResetToken validateToken(String token) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (prt.isUsed()) {
            throw new RuntimeException("Token ya ha sido usado");
        }

        if (Instant.now().isAfter(prt.getExpiresAt())) {
            throw new RuntimeException("Token expirado");
        }

        return prt;
    }

    @Transactional
    public void resetPassword(String token, String rawPassword) {
        PasswordResetToken prt = validateToken(token);

        Usuario usuario = prt.getUsuario();

        // Hash password and save
        String hashed = passwordEncoder.encode(rawPassword);
        usuario.setPassword(hashed);
        usuarioRepository.save(usuario);

        // Invalidate token (single-use)
        prt.setUsed(true);
        tokenRepository.save(prt);
    }
}
