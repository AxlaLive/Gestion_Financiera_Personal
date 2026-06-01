package com.app_financiera.api.util;

public final class PasswordPolicy {

    private PasswordPolicy() {
    }

    /**
     * Reglas para restablecer contraseña (más estrictas que el registro inicial).
     */
    public static String validateForReset(String password) {
        if (password == null || password.isBlank()) {
            return "La contraseña es requerida";
        }
        if (password.length() < 10) {
            return "La contraseña debe tener al menos 10 caracteres";
        }
        if (!password.chars().anyMatch(Character::isUpperCase)) {
            return "La contraseña debe contener al menos una letra mayúscula";
        }
        if (!password.chars().anyMatch(Character::isLowerCase)) {
            return "La contraseña debe contener al menos una letra minúscula";
        }
        if (!password.chars().anyMatch(Character::isDigit)) {
            return "La contraseña debe contener al menos un dígito";
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            return "La contraseña debe contener al menos un carácter especial";
        }
        return null;
    }
}
