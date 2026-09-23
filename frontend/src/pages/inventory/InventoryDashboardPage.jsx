import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  PackagePlus,
  ShoppingBag,
  Truck,
  Warehouse,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import AnimatedSection from "../../components/common/AnimatedSection";

export default function InventoryDashboardPage() {
  const { user } = useAuth();
  const userName =
    user?.fullName || user?.name || user?.email || "Inventory Specialist";

  const inventoryActions = [
    {
      title: "Manage Spare Parts",
      description:
        "Register new parts, edit specifications, update unit pricing and manage inventory counts.",
      to: "/inventory/products",
      icon: PackagePlus,
    },
    {
      title: "Part Categories",
      description:
        "Organize catalog taxonomy, mechanical categories and vehicle system groupings.",
      to: "/inventory/categories",
      icon: Boxes,
    },
    {
      title: "Critical Stock Alerts",
      description:
        "Inspect parts reaching or below safety thresholds requiring prompt replenishment.",
      to: "/inventory/low-stock-alerts",
      icon: AlertTriangle,
    },
    {
      title: "Suppliers & Vendors",
      description:
        "Manage contracted automotive part suppliers, contacts and delivery lead-time profiles.",
      to: "/suppliers",
      icon: Truck,
    },
    {
      title: "Supplier Purchases",
      description:
        "Record and monitor wholesale purchase orders, inbound goods and warehouse receipts.",
      to: "/supplier-purchases",
      icon: ShoppingBag,
    },
  ];

  return (
    <main className="dashboard-page">
      <PageHeader
        title="Inventory Operations Dashboard"
        subtitle={`Signed in as ${userName} — oversee stock levels, procurement and warehouse catalog.`}
        icon={<Warehouse size={24} />}
        badge={<span className="brand-label">INVENTORY STAFF</span>}
      />

      <AnimatedSection direction="up" delay={0.1}>
        <div className="dashboard-actions">
          {inventoryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="dashboard-action-card"
              >
                <div className="dashboard-action-card-icon">
                  <Icon size={24} />
                </div>
                <div className="dashboard-action-card-info">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="dashboard-action-card-arrow">
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>
    </main>
  );
}