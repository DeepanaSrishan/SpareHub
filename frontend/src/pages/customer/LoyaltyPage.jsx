import { useEffect, useState } from "react";
import loyaltyService from "../../services/loyaltyService";
import { useAutoScrollReveal } from "../../hooks/useScrollReveal";
import "../../styles/customer.css";

function LoyaltyPage() {
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
    const currentTier = loyalty?.currentTier ?? loyalty?.loyaltyTier ?? "Bronze";
    const minimumPoints = loyalty?.currentTierMinimumPoints ?? 0;
    const nextTierPoints = loyalty?.nextTierMinimumPoints ?? currentPoints;

    const tierRange = Math.max(nextTierPoints - minimumPoints, 1);
    const earnedInTier = Math.max(currentPoints - minimumPoints, 0);

    const calculatedProgress = Math.min(
        Math.round((earnedInTier / tierRange) * 100),
        100
    );

    const progressPercentage =
        loyalty?.progressPercentage ?? calculatedProgress;

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
                    <strong>{loyalty?.discountPercentage ?? 0}%</strong>
                </article>

                <article className="stat-card">
                    <span>Next Tier</span>
                    <strong>{loyalty?.nextTier ?? "Highest Tier"}</strong>
                </article>
            </div>

            <section className="content-card loyalty-progress-card scroll-reveal">
                <h2>Tier Progress</h2>

                {loyalty?.nextTier ? (
                    <>
                        <div className="progress-label">
                            <span>{currentTier}</span>
                            <span>{loyalty.nextTier}</span>
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
                                {nextTierPoints - currentPoints} more points
                            </strong>{" "}
                            to reach {loyalty.nextTier}
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
                        <strong>{loyalty?.discountPercentage ?? 0}%</strong>
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