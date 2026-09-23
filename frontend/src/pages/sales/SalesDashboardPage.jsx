import { Link } from "react-router-dom";
import {
  ChevronRight,
  ClipboardList,
  PackageSearch,
  UserCheck,
  UserRound,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import AnimatedSection from "../../components/common/AnimatedSection";

export default function SalesDashboardPage() {
  const { user } = useAuth();
  const userName = user?.fullName || user?.name || user?.email || "Sales Team Member";

  const salesActions = [
    {
      title: "Customer Orders",
      description: "Review, confirm, process status changes and complete customer orders and dispatches.",
      to: "/sales/orders",
      icon: ClipboardList,
    },
    {
      title: "Customer Directory",
      description: "Search customer profiles, purchase history, loyalty tier status and contact information.",
      to: "/sales/customers",
      icon: UserRound,
    },
    {
      title: "Product Catalog & Inventory",
      description: "Lookup real-time part numbers, specifications, available stock counts and pricing.",
      to: "/products",
      icon: PackageSearch,
    },
  ];

  return (
    <main className="dashboard-page">
      <PageHeader
        title="Sales Dashboard"
        subtitle={`Signed in as ${userName} — manage customer orders, verification and client relations.`}
        icon={<UserCheck size={24} />}
        badge={<span className="brand-label">SALES STAFF</span>}
      />

      <AnimatedSection direction="up" delay={0.1}>
        <div className="dashboard-actions">
          {salesActions.map((action) => {
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