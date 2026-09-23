import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

/**
 * EmptyState renders a friendly, animated placeholder when tables,
 * lists, or search results have no items.
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className=""]
 */
export default function EmptyState({
  icon,
  title = "No items found",
  description = "There are no records to display at this moment.",
  action,
  className = "",
}) {
  return (
    <motion.div
      className={`empty-state-card ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-state-icon-bubble">
        {icon || <PackageOpen size={36} />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </motion.div>
  );
}
