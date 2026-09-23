/**
 * StatusBadge renders a unified pill indicator for orders, stock levels,
 * user statuses, and categories with accessible color-coded semantics.
 * 
 * @param {Object} props
 * @param {string} props.status - Status string (e.g. "IN_STOCK", "DELIVERED", "PENDING", "LOW_STOCK", "CANCELLED")
 * @param {string} [props.label] - Optional custom display label
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.className='']
 */
export default function StatusBadge({
  status = "",
  label,
  size = "md",
  className = "",
}) {
  const normalized = String(status).trim().toUpperCase();

  let variant = "neutral";

  if (
    [
      "ACTIVE",
      "IN_STOCK",
      "COMPLETED",
      "DELIVERED",
      "PAID",
      "SUCCESS",
      "APPROVED",
      "ONLINE",
    ].includes(normalized)
  ) {
    variant = "success";
  } else if (
    [
      "PENDING",
      "PROCESSING",
      "LOW_STOCK",
      "WARNING",
      "AWAITING_PAYMENT",
      "ON_HOLD",
      "IN_TRANSIT",
    ].includes(normalized)
  ) {
    variant = "warning";
  } else if (
    [
      "OUT_OF_STOCK",
      "CANCELLED",
      "FAILED",
      "REJECTED",
      "INACTIVE",
      "DANGER",
      "EXPIRED",
    ].includes(normalized)
  ) {
    variant = "danger";
  } else if (
    [
      "INFO",
      "SHIPPED",
      "DISPATCHED",
      "NEW",
      "CONFIRMED",
    ].includes(normalized)
  ) {
    variant = "info";
  }

  // Format display text if no custom label provided
  const displayText =
    label ||
    normalized
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`status-badge status-${variant} badge-${size} ${className}`}
    >
      <span className="badge-dot" aria-hidden="true" />
      <span className="badge-text">{displayText}</span>
    </span>
  );
}
