import { test, expect } from "@playwright/test";

test("Escenario 1: registro exitoso redirige al dashboard", async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}@example.com`;

  await page.goto("/signup");

  await page.getByLabel("Nombre Completo").fill("Usuario de Prueba");
  await page.getByLabel("Correo Electrónico").fill(uniqueEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill("MiClave2026!");
  await page.getByLabel("Confirmar Contraseña").fill("MiClave2026!");

  await page.getByRole("button", { name: "Registrarme" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});
