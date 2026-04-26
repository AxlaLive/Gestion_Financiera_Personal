import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Transaction } from "@/features/transactions/types";
import { CategoryIcon } from "./CategoryIcon";
import { formatSignedAmount } from "@/features/transactions/format";
import { getCategory } from "@/features/transactions/categories";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
  className?: string;
}

export function TransactionRow({
  transaction,
  onClick,
  className,
}: TransactionRowProps) {
  const category = getCategory(transaction.category);
  const isIncome = transaction.type === "income";

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.01]",
        className
      )}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyPress={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(transaction);
        }
      }}
    >
      <CategoryIcon categoryId={transaction.category} size="md" className="shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-foreground">
            {category?.label || transaction.category}
          </span>
          {isIncome ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-green-600 shrink-0" aria-label="Ingreso" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-red-600 shrink-0" aria-label="Gasto" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">{transaction.date}</p>
      </div>

      <span
        className={cn(
          "font-semibold text-sm whitespace-nowrap",
          isIncome ? "text-green-600" : "text-red-600"
        )}
      >
        {formatSignedAmount(transaction.amount, transaction.type)}
      </span>
    </div>
  );
}
