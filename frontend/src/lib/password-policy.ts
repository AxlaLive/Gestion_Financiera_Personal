/** Debe coincidir con PasswordPolicy.validateForReset del backend */
export function validateResetPassword(password: string): string | null {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 10) return 'La contraseña debe tener al menos 10 caracteres';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una letra mayúscula';
  if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una letra minúscula';
  if (!/\d/.test(password)) return 'La contraseña debe contener al menos un dígito';
  if (!/[^A-Za-z0-9]/.test(password)) return 'La contraseña debe contener al menos un carácter especial';
  return null;
}

export const resetPasswordChecks = (password: string) => ({
  minLength: password.length >= 10,
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
});
