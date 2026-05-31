import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteGuard } from "@/components/RouteGuard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import GastosHormiga from "./pages/GastosHormiga";
import ReportesGastos from "./pages/ReportesGastos";
import Estadisticas from "./Estadisticas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<RouteGuard pathname="/login"><Login /></RouteGuard>} />
          <Route path="/signup" element={<RouteGuard pathname="/signup"><Signup /></RouteGuard>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<RouteGuard pathname="/dashboard"><Dashboard /></RouteGuard>} />
          <Route path="/add-expense" element={<RouteGuard pathname="/add-expense"><AddExpense /></RouteGuard>} />
          <Route path="/add-income" element={<RouteGuard pathname="/add-income"><AddIncome /></RouteGuard>} />
          <Route path="/budgets" element={<RouteGuard pathname="/budgets"><Budgets /></RouteGuard>} />
          <Route path="/transacciones" element={<RouteGuard pathname="/transacciones"><Transactions /></RouteGuard>} />
          <Route path="/transactions" element={<RouteGuard pathname="/transactions"><Transactions /></RouteGuard>} />
          <Route path="/statistics" element={<RouteGuard pathname="/statistics"><Estadisticas /></RouteGuard>} />
          <Route path="/reportes" element={<RouteGuard pathname="/reportes"><ReportesGastos /></RouteGuard>} />
          <Route path="/gastos-hormiga" element={<RouteGuard pathname="/gastos-hormiga"><GastosHormiga /></RouteGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
