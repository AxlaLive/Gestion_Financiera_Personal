package com.app_financiera.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app_financiera.api.dto.GastoHormigaHistoricoMesDTO;
import com.app_financiera.api.dto.GastoHormigaResumenDTO;
import com.app_financiera.api.dto.LimiteGastoHormigaRequest;
import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.services.GastosHormigaService;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/gastos-hormiga")
public class GastosHormigaController {

    @Autowired
    private GastosHormigaService gastosHormigaService;

    @PutMapping("/limite")
    public ResponseEntity<GastoHormigaResumenDTO> actualizarLimite(
            @PathVariable Long usuarioId,
            @RequestBody LimiteGastoHormigaRequest request) {
        GastoHormigaResumenDTO resumen = gastosHormigaService.actualizarLimite(usuarioId, request.getLimite());
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/resumen")
    public ResponseEntity<GastoHormigaResumenDTO> obtenerResumen(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(gastosHormigaService.obtenerResumen(usuarioId));
    }

    @GetMapping
    public ResponseEntity<List<Transaccion>> listarGastosHormiga(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(gastosHormigaService.listarGastosHormiga(usuarioId));
    }

    @GetMapping("/historico")
    public ResponseEntity<List<GastoHormigaHistoricoMesDTO>> obtenerHistorico(
            @PathVariable Long usuarioId,
            @RequestParam(required = false, defaultValue = "6") int meses) {
        return ResponseEntity.ok(gastosHormigaService.obtenerHistorico(usuarioId, meses));
    }
}
