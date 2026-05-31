package com.app_financiera.api.security;

import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.services.JwtBlacklistService;
import com.app_financiera.api.services.UsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final JwtBlacklistService jwtBlacklistService;
    private final UsuarioService usuarioService;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService,
                                   JwtBlacklistService jwtBlacklistService,
                                   UsuarioService usuarioService) {
        this.jwtTokenService = jwtTokenService;
        this.jwtBlacklistService = jwtBlacklistService;
        this.usuarioService = usuarioService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/api/usuarios/login")
                || path.equals("/api/usuarios/registro")
                || path.equals("/api/auth/forgot-password")
                || path.startsWith("/api/auth/reset-password");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        String token = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring("Bearer ".length()).trim();
        }

        if (token != null) {
            if (jwtBlacklistService.estaEnListaNegra(token)) {
                sendUnauthorized(response, "Token invalidado");
                return;
            }

            if (!jwtTokenService.validateToken(token)) {
                sendUnauthorized(response, "Token JWT inválido o expirado");
                return;
            }

            String correo = jwtTokenService.getUsernameFromToken(token);
            Usuario usuario = usuarioService.obtenerPorCorreo(correo);
            if (usuario != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(correo, null, Collections.emptyList());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format("{\"error\":\"%s\"}", message));
    }
}
