import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireRole from "./components/RequireRole";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Delivery from "./pages/orders/Delivery";
import TablesPage from "./pages/tables/TablesPage";
import Cashier from "./pages/cashier/Cashier";
import CashClosing from "./pages/cashier/CashClosing";
import ClosingHistory from "./pages/cashier/ClosingHistory";
import Customers from "./pages/customers/Customers";
import Debts from "./pages/Debts";
import Menu from "./pages/admin/Menu";
import Staff from "./pages/admin/Staff";
import Reports from "./pages/admin/Reports";
import Expenses from "./pages/admin/Expenses";
import Inventory from "./pages/admin/Inventory";
import DailyReport from "./pages/admin/DailyReport";
import PickupPage from "./pages/pickup/PickupPage";

function AdminOnly({ children }) {
  return <RequireRole roles={["admin"]}>{children}</RequireRole>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        {/* Compartido admin + mesero */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/menu" element={<Menu />} />

        {/* Solo admin / cajero */}
        <Route path="/delivery" element={<AdminOnly><Delivery /></AdminOnly>} />
        <Route path="/pickup" element={<AdminOnly><PickupPage /></AdminOnly>} />
        <Route path="/cashier" element={<AdminOnly><Cashier /></AdminOnly>} />
        <Route path="/cashier/closing" element={<AdminOnly><CashClosing /></AdminOnly>} />
        <Route path="/cashier/closing/history" element={<AdminOnly><ClosingHistory /></AdminOnly>} />
        <Route path="/debts" element={<AdminOnly><Debts /></AdminOnly>} />
        <Route path="/customers" element={<AdminOnly><Customers /></AdminOnly>} />
        <Route path="/admin/expenses" element={<AdminOnly><Expenses /></AdminOnly>} />
        <Route path="/staff" element={<AdminOnly><Staff /></AdminOnly>} />
        <Route path="/admin/inventory" element={<AdminOnly><Inventory /></AdminOnly>} />
        <Route path="/reports" element={<AdminOnly><Reports /></AdminOnly>} />
        <Route path="/reports/daily" element={<AdminOnly><DailyReport /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
