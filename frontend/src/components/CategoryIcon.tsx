import {
  DollarSign,
  Briefcase,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Coffee,
  Heart,
  Gamepad2,
  Plane,
  GraduationCap,
  Shirt,
  Smartphone,
  MoreVertical,
} from "lucide-react";
import { getCategory, CATEGORY_COLORS } from "@/features/transactions/categories";
import type { CategoryId } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  categoryId: CategoryId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconMap: Record<CategoryId, React.ElementType> = {
  salario: DollarSign,
  freelance: Briefcase,
  compras: ShoppingCart,
  comida: UtensilsCrossed,
  transporte: Car,
  cafes: Coffee,
  salud: Heart,
  ocio: Gamepad2,
  viajes: Plane,
  educacion: GraduationCap,
  ropa: Shirt,
  tecnologia: Smartphone,
  otros: MoreVertical,
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function CategoryIcon({
  categoryId,
  size = "md",
  className,
}: CategoryIconProps) {
  const category = getCategory(categoryId);
  const colors = CATEGORY_COLORS[categoryId] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  const Icon = iconMap[categoryId];

  if (!Icon) {
    return null;
  }

  return (
    <div
      className={cn(
        `flex items-center justify-center rounded-lg ${colors.bg}`,
        sizeMap[size],
        className
      )}
      title={category?.label}
    >
      <Icon className={cn(colors.text, iconSizeMap[size])} />
    </div>
  );
}
