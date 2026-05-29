package com.app_financiera.api.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app_financiera.api.entities.Transaccion;
import com.app_financiera.api.entities.Usuario;
import com.app_financiera.api.repositories.TransaccionRepository;

import jakarta.transaction.Transactional;

@Service
public class ReporteService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Transactional
    public byte[] generarReporteMes(Usuario usuario, int month, int year, String formato) {
        validarPeriodo(month, year);
        YearMonth periodo = YearMonth.of(year, month);
        LocalDate desde = periodo.atDay(1);
        LocalDate hasta = periodo.plusMonths(1).atDay(1);

        List<Transaccion> movimientos = transaccionRepository.findByUsuarioAndFechaBetween(usuario, desde, hasta);
        if (movimientos.isEmpty()) {
            throw new RuntimeException("No hay movimientos registrados para el período seleccionado.");
        }

        double totalIngresos = movimientos.stream()
                .filter(t -> t.getTipo() != null && t.getTipo().equalsIgnoreCase("INGRESO"))
                .mapToDouble(t -> t.getMonto() != null ? t.getMonto() : 0.0)
                .sum();

        double totalGastos = movimientos.stream()
                .filter(t -> t.getTipo() != null && (t.getTipo().equalsIgnoreCase("GASTO") || t.getTipo().equalsIgnoreCase("EGRESO")))
                .mapToDouble(t -> t.getMonto() != null ? t.getMonto() : 0.0)
                .sum();

        double balanceNeto = totalIngresos - totalGastos;
        double porcentajeAhorro = 0.0;
        if (balanceNeto > 0 && totalIngresos > 0) {
            porcentajeAhorro = (balanceNeto / totalIngresos) * 100.0;
        }

        Map<String, Double> gastosPorCategoria = movimientos.stream()
                .filter(t -> t.getTipo() != null && (t.getTipo().equalsIgnoreCase("GASTO") || t.getTipo().equalsIgnoreCase("EGRESO")))
                .filter(t -> t.getCategoria() != null && t.getCategoria().getNombre() != null)
                .collect(Collectors.groupingBy(t -> t.getCategoria().getNombre(), LinkedHashMap::new,
                        Collectors.summingDouble(t -> t.getMonto() != null ? t.getMonto() : 0.0)));

        Map<String, Double> porcentajePorCategoria = new LinkedHashMap<>();
        if (totalGastos > 0) {
            gastosPorCategoria.forEach((categoria, monto) ->
                    porcentajePorCategoria.put(categoria, (monto / totalGastos) * 100.0));
        }

        try {
            if (formato.equalsIgnoreCase("pdf")) {
                return generarPdf(periodo, totalIngresos, totalGastos, balanceNeto, porcentajeAhorro, porcentajePorCategoria);
            }
            if (formato.equalsIgnoreCase("excel")) {
                return generarExcel(periodo, totalIngresos, totalGastos, balanceNeto, porcentajeAhorro, porcentajePorCategoria);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error generando el reporte de exportación");
        }

        throw new RuntimeException("Formato no soportado para exportar reportes");
    }

    private void validarPeriodo(int month, int year) {
        if (month < 1 || month > 12 || year < 1) {
            throw new RuntimeException("Mes o año inválido para generar el reporte");
        }
    }

    private byte[] generarPdf(YearMonth periodo, double ingresos, double gastos,
                              double balance, double porcentajeAhorro,
                              Map<String, Double> porcentajesPorCategoria) throws IOException {
        try (PDDocument documento = new PDDocument();
             ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            PDPage pagina = new PDPage(PDRectangle.LETTER);
            documento.addPage(pagina);

            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                float y = 720;
                float margen = 50;
                float leading = 20;

                contenido.beginText();
                contenido.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contenido.newLineAtOffset(margen, y);
                contenido.showText("Reporte financiero - " + periodo.getMonth() + " " + periodo.getYear());
                contenido.endText();

                y -= leading * 2;
                contenido.beginText();
                contenido.setFont(PDType1Font.HELVETICA, 12);
                contenido.newLineAtOffset(margen, y);
                contenido.showText(String.format("Total de ingresos: %.2f", ingresos));
                contenido.endText();

                y -= leading;
                contenido.beginText();
                contenido.newLineAtOffset(margen, y);
                contenido.showText(String.format("Total de gastos: %.2f", gastos));
                contenido.endText();

                y -= leading;
                contenido.beginText();
                contenido.newLineAtOffset(margen, y);
                contenido.showText(String.format("Balance neto: %.2f", balance));
                contenido.endText();

                y -= leading;
                contenido.beginText();
                contenido.newLineAtOffset(margen, y);
                contenido.showText(String.format("Porcentaje de ahorro: %.2f%%", porcentajeAhorro));
                contenido.endText();

                y -= leading * 2;
                contenido.beginText();
                contenido.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contenido.newLineAtOffset(margen, y);
                contenido.showText("Porcentaje de gastos por categoría:");
                contenido.endText();

                y -= leading;
                contenido.setFont(PDType1Font.HELVETICA, 12);
                for (Map.Entry<String, Double> entrada : porcentajesPorCategoria.entrySet()) {
                    if (y < 80) {
                        break;
                    }
                    contenido.beginText();
                    contenido.newLineAtOffset(margen, y);
                    contenido.showText(String.format("%s: %.2f%%", entrada.getKey(), entrada.getValue()));
                    contenido.endText();
                    y -= leading;
                }
            }

            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private byte[] generarExcel(YearMonth periodo, double ingresos, double gastos,
                                 double balance, double porcentajeAhorro,
                                 Map<String, Double> porcentajesPorCategoria) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            Sheet hoja = workbook.createSheet("Reporte");
            CellStyle encabezado = workbook.createCellStyle();
            Font fontEncabezado = workbook.createFont();
            fontEncabezado.setBold(true);
            encabezado.setFont(fontEncabezado);

            int filaIndice = 0;
            Row filaTitulo = hoja.createRow(filaIndice++);
            Cell cellTitulo = filaTitulo.createCell(0);
            cellTitulo.setCellValue("Reporte financiero - " + periodo.getMonth() + " " + periodo.getYear());
            cellTitulo.setCellStyle(encabezado);

            Row filaIngresos = hoja.createRow(filaIndice++);
            filaIngresos.createCell(0).setCellValue("Total de ingresos");
            filaIngresos.createCell(1).setCellValue(ingresos);

            Row filaGastos = hoja.createRow(filaIndice++);
            filaGastos.createCell(0).setCellValue("Total de gastos");
            filaGastos.createCell(1).setCellValue(gastos);

            Row filaBalance = hoja.createRow(filaIndice++);
            filaBalance.createCell(0).setCellValue("Balance neto");
            filaBalance.createCell(1).setCellValue(balance);

            Row filaAhorro = hoja.createRow(filaIndice++);
            filaAhorro.createCell(0).setCellValue("Porcentaje de ahorro");
            filaAhorro.createCell(1).setCellValue(porcentajeAhorro);

            filaIndice++;
            Row filaCategoriaTitulo = hoja.createRow(filaIndice++);
            Cell catTitulo = filaCategoriaTitulo.createCell(0);
            catTitulo.setCellValue("Categoría");
            catTitulo.setCellStyle(encabezado);
            Cell porcentajeTitulo = filaCategoriaTitulo.createCell(1);
            porcentajeTitulo.setCellValue("Porcentaje");
            porcentajeTitulo.setCellStyle(encabezado);

            for (Map.Entry<String, Double> entrada : porcentajesPorCategoria.entrySet()) {
                Row filaCategoria = hoja.createRow(filaIndice++);
                filaCategoria.createCell(0).setCellValue(entrada.getKey());
                filaCategoria.createCell(1).setCellValue(entrada.getValue());
            }

            hoja.autoSizeColumn(0);
            hoja.autoSizeColumn(1);
            workbook.write(salida);
            return salida.toByteArray();
        }
    }
}
