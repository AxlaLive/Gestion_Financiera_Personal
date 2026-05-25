package com.app_financiera.api.services;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio que mantiene una lista negra de JWT en memoria.
 * El objetivo es invalidar inmediatamente los tokens cuando el usuario cierra sesión.
 */
@Service
public class JwtBlacklistService {

    private final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    /**
     * Agrega un token JWT a la lista negra.
     *
     * @param token token a invalidar
     */
    public void añadirAListaNegra(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token.trim());
        }
    }

    /**
     * Comprueba si un token JWT ya ha sido invalidado.
     *
     * @param token token a verificar
     * @return true si el token está en la lista negra
     */
    public boolean estaEnListaNegra(String token) {
        return token != null && blacklistedTokens.contains(token.trim());
    }
}
