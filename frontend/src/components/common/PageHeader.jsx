import { motion } from "framer-motion";

/**
 * PageHeader provides a unified, responsive header banner for dashboard pages,
 * catalogs, and detail views.
 * 
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} [props.subtitle] - Brief description or context
 * @param {React.ReactNode} [props.icon] - Icon component
 * @param {React.ReactNode} [props.badge] - Optional badge or pill
 * @param {React.ReactNode} [props.actions] - Action buttons or filters (right side)
 * @param {React.ReactNode} [props.breadcrumbs] - Optional breadcrumbs or back link
 * @param {string} [props.className=""]
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  actions,
  breadcrumbs,
  className = "",
}) {
  return (
    <motion.header
      className={`page-header ${className}`}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {breadcrumbs && <div className="page-header-breadcrumbs">{breadcrumbs}</div>}
      
      <div className="page-header-main">
        <div className="page-header-titles">
          <div className="page-header-title-row">
            {icon && <span className="page-header-icon">{icon}</span>}
            <h1 className="page-title">{title}</h1>
            {badge && <div className="page-header-badge">{badge}</div>}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </motion.header>
  );
}
