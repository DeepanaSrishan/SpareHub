/**
 * LoadingSkeleton provides pulsating placeholder blocks while data is loading.
 * 
 * @param {Object} props
 * @param {'card' | 'row' | 'table' | 'text'} [props.type='card']
 * @param {number} [props.count=3] - How many skeleton items to render
 * @param {string} [props.className='']
 */
export default function LoadingSkeleton({
  type = "card",
  count = 3,
  className = "",
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "row") {
    return (
      <div className={`skeleton-list ${className}`}>
        {items.map((i) => (
          <div key={i} className="skeleton-row skeleton-pulse" />
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`skeleton-table ${className}`}>
        <div className="skeleton-table-header skeleton-pulse" />
        {items.map((i) => (
          <div key={i} className="skeleton-table-row skeleton-pulse" />
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={`skeleton-text-group ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="skeleton-line skeleton-pulse"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  // Default: card grid
  return (
    <div className={`skeleton-grid ${className}`}>
      {items.map((i) => (
        <div key={i} className="skeleton-card skeleton-pulse">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-line title" />
            <div className="skeleton-line subtitle" />
            <div className="skeleton-line price" />
          </div>
        </div>
      ))}
    </div>
  );
}
