import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "salario", label: "Salario", icon: "DollarSign" },
  { id: "freelance", label: "Freelance", icon: "Briefcase" },
  { id: "compras", label: "Compras", icon: "ShoppingCart" },
  { id: "comida", label: "Comida", icon: "UtensilsCrossed" },
  { id: "transporte", label: "Transporte", icon: "Car" },
  { id: "cafes", label: "Cafés", icon: "Coffee" },
  { id: "salud", label: "Salud", icon: "Heart" },
  { id: "ocio", label: "Ocio", icon: "Gamepad2" },
  { id: "viajes", label: "Viajes", icon: "Plane" },
  { id: "educacion", label: "Educación", icon: "GraduationCap" },
  { id: "ropa", label: "Ropa", icon: "Shirt" },
  { id: "tecnologia", label: "Tecnología", icon: "Smartphone" },
  { id: "otros", label: "Otros", icon: "MoreVertical" },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  salario: { bg: "bg-emerald-100", text: "text-emerald-700" },
  freelance: { bg: "bg-blue-100", text: "text-blue-700" },
  compras: { bg: "bg-purple-100", text: "text-purple-700" },
  comida: { bg: "bg-red-100", text: "text-red-700" },
  transporte: { bg: "bg-sky-100", text: "text-sky-700" },
  cafes: { bg: "bg-yellow-100", text: "text-yellow-700" },
  salud: { bg: "bg-pink-100", text: "text-pink-700" },
  ocio: { bg: "bg-indigo-100", text: "text-indigo-700" },
  viajes: { bg: "bg-cyan-100", text: "text-cyan-700" },
  educacion: { bg: "bg-amber-100", text: "text-amber-700" },
  ropa: { bg: "bg-violet-100", text: "text-violet-700" },
  tecnologia: { bg: "bg-teal-100", text: "text-teal-700" },
  otros: { bg: "bg-gray-100", text: "text-gray-700" },
};

export function getCategory(categoryId: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId);
}
