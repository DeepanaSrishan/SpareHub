import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  ChartColumn,
  ChevronRight,
  FileBarChart,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import AnimatedSection from "../../components/common/AnimatedSection";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const userName =
    user?.fullName || user?.name || user?.email || "Executive Manager";

  const managerActions = [
    {
      title: "User Accounts & Access",
      description:
        "Manage system user roles (Staff, Customer, Manager), account activations and security permissions.",
      to: "/manager/users",
      icon: UserRound,
    },
    {
      title: "Sales & Financial Reports",
      description:
        "Analyze revenue trends, cash flow, payment method splits, discount loyalty costs and order volume.",
      to: "/manager/order-reports",
      icon: BarChart3,
    },
    {
      title: "Inventory Asset Reports",
      description:
        "Evaluate warehouse stock valuation, item turnover speeds, shortage risks and catalog expansion.",
      to: "/manager/reports/inventory",
      icon: ChartColumn,
    },
    {
      title: "Supplier Performance Analytics",
      description:
        "Review supplier spend, fulfillment reliability, delivery lead-times and procurement volume.",
      to: "/supplier-analytics",
      icon: TrendingUp,
    },
    {
      title: "Executive Management Reports",
      description:
        "Generate and download structured audit reports, executive summaries and operational logs.",
      to: "/manager/reports",
      icon: FileBarChart,
    },
    {
      title: "Critical Stock Alerts",
      description:
        "Direct real-time monitoring of urgent inventory shortfalls across automotive parts.",
      to: "/inventory/low-stock-alerts",
      icon: AlertTriangle,
    },
  ];

  return (
    <main className="dashboard-page">
      <PageHeader
        title="Executive Management Portal"
        subtitle={`Signed in as ${userName} — strategic oversight of enterprise users, revenue, inventory and analytics.`}
        icon={<ShieldCheck size={24} />}
        badge={<span className="brand-label">MANAGER</span>}
      />

      <AnimatedSection direction="up" delay={0.1}>
        <div className="dashboard-actions">
          {managerActions.map((action) => {
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