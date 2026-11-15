import { useEffect, useState } from "react";
import loyaltyService from "../../services/loyaltyService";
import useAuth from "../../hooks/useAuth";
import { useAutoScrollReveal } from "../../hooks/useScrollReveal";
import "../../styles/customer.css";

const resolveTierName = (tier, points = 0) => {
    const pts = Number(points) || 0;
    if (pts >= 3000) return "Platinum";
    if (pts >= 1500) return "Gold";
    if (pts >= 500) return "Silver";
    if (tier && tier.trim() && tier.toUpperCase() !== "BRONZE") {
        const clean = tier.trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return "Bronze";
};

function LoyaltyPage() {
    const { updateStoredUser } = useAuth();
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useAutoScrollReveal([loyalty]);

    useEffect(() => {
        loadLoyaltyDetails();
    }, []);

    const loadLoyaltyDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await loyaltyService.getMyLoyalty();
            setLoyalty(data);

            const activeTier = resolveTierName(data?.currentTier, data?.currentPoints);
            if (updateStoredUser && activeTier) {
                updateStoredUser({
                    loyaltyTier: activeTier,
                    loyaltyPoints: data?.currentPoints,
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Loyalty information load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="page-message">Loading loyalty details...</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const currentPoints = loyalty?.currentPoints ?? loyalty?.rewardPoints ?? 0;
    const currentTier = resolveTierName(loyalty?.currentTier ?? loyalty?.loyaltyTier, currentPoints);

    let nextTierName = loyalty?.nextTier;
    let nextTierMinPoints = loyalty?.nextTierMinimumPoints;
    let discount = loyalty?.discountPercentage;

    if (currentTier === "Platinum") {
        nextTierName = null;
        nextTierMinPoints = currentPoints;
        discount = discount ?? 15;
    } else if (currentTier === "Gold") {
        nextTierName = "Platinum";
        nextTierMinPoints = 3000;
        discount = discount ?? 10;
    } else if (currentTier === "Silver") {
        nextTierName = "Gold";
        nextTierMinPoints = 1500;
        discount = discount ?? 5;
    } else {
        nextTierName = "Silver";
        nextTierMinPoints = 500;
        discount = discount ?? 0;
    }

    const nextTierPoints = nextTierMinPoints ?? currentPoints;
    const pointsRequired = nextTierName ? Math.max(nextTierPoints - currentPoints, 0) : 0;
    const progressPercentage = nextTierName
        ? Math.min(Math.round((currentPoints / (nextTierPoints || 1)) * 100), 100)
        : 100;

    return (
        <div className="customer-page">
            <div className="page-heading">
                <div>
                    <h1>My Loyalty</h1>
                    <p>View your rewards, discount and tier progress.</p>
                </div>
            </div>

            <div className="stat-card-grid scroll-reveal scroll-stagger">
                <article className="stat-card">
                    <span>Current Tier</span>
                    <strong>{currentTier}</strong>
                </article>

                <article className="stat-card">
                    <span>Reward Points</span>
                    <strong>{currentPoints}</strong>
                </article>

                <article className="stat-card">
                    <span>Discount</span>
                    <strong>{discount ?? 0}%</strong>
                </article>

                <article className="stat-card">
                    <span>Next Tier</span>
                    <strong>{nextTierName ?? "Highest Tier"}</strong>
                </article>
            </div>

            <section className="content-card loyalty-progress-card scroll-reveal">
                <h2>Tier Progress</h2>

                {nextTierName ? (
                    <>
                        <div className="progress-label">
                            <span>{currentTier}</span>
                            <span>{nextTierName}</span>
                        </div>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        <div className="progress-hint">
                            Earn{" "}
                            <strong>
                                {pointsRequired} more points
                            </strong>{" "}
                            to reach {nextTierName}
                        </div>
                    </>
                ) : (
                    <div className="alert alert-success">
                        Congratulations! You are currently in the highest
                        loyalty tier.
                    </div>
                )}
            </section>

            <section className="content-card scroll-reveal">
                <h2>Your Benefits</h2>

                <ul className="benefit-list">
                    <li>
                        Current purchase discount:{" "}
                        <strong>{discount ?? 0}%</strong>
                    </li>

                    <li>
                        Available reward points:{" "}
                        <strong>{currentPoints}</strong>
                    </li>

                    <li>
                        Points are automatically earned from eligible
                        completed purchases.
                    </li>
                </ul>
            </section>
        </div>
    );
}

export default LoyaltyPage;