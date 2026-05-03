package com.app_financiera.api.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.services.BalanceService;

@RestController
@RequestMapping("/api/balance")
public class BalanceController {

    @Autowired
    private BalanceService balanceService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Map<String, Object>> consultarBalance(@PathVariable Long usuarioId) {
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        
        // Calcula ingresos - gastos y define color/mensaje [cite: 93, 98, 104]
        return ResponseEntity.ok(balanceService.obtenerEstadoFinanciero(usuario));
    }
}