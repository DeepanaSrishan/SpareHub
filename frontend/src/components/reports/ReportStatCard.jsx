const ReportStatCard = ({
                            title,
                            value,
                            description,
                            icon: Icon,
                            variant = "blue",
                        }) => {
    return (
        <article
            className={`report-stat-card report-stat-${variant}`}
        >
            <div className="report-stat-icon">
                <Icon size={23} />
            </div>

            <div>
                <span>{title}</span>
                <strong>{value}</strong>

                {description && (
                    <p>{description}</p>
                )}
            </div>
        </article>
    );
};

export default ReportStatCard;