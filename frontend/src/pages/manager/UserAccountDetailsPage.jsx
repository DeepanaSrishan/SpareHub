import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Mail,
    MapPin,
    Phone,
    Shield,
    UserCheck,
    UserX,
} from "lucide-react";

import userAdministrationService from "../../services/userAdministrationService";
import useAuth from "../../hooks/useAuth";
import "../../styles/userAdministration.css";

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

export default function UserAccountDetailsPage() {
    const { userId } = useParams();
    const { user: loggedInUser } = useAuth();

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadAccount();
    }, [userId]);

    const loadAccount = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await userAdministrationService.getUserById(userId);

            setAccount(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "User account load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const getFullName = () => {
        if (!account) return "Unknown User";

        if (account.fullName && account.fullName.trim()) {
            return account.fullName.trim();
        }

        const fullName = `${account?.firstName ?? ""} ${
            account?.lastName ?? ""
        }`.trim();

        return fullName || account?.name || account?.email || "Unknown User";
    };

    const normalizeRole = (role) => {
        return role?.replace("ROLE_", "") || "UNKNOWN";
    };

    const isOwnAccount =
        account?.id === loggedInUser?.id ||
        account?.email === loggedInUser?.email;

    const handleStatusUpdate = async () => {
        const newStatus =
            account.accountStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const action =
            newStatus === "ACTIVE" ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this account?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdating(true);
            setError("");
            setSuccessMessage("");

            const updatedAccount =
                await userAdministrationService.updateAccountStatus(
                    account.id,
                    newStatus
                );

            setAccount((currentAccount) => ({
                ...currentAccount,
                ...updatedAccount,
                accountStatus:
                    updatedAccount?.accountStatus ?? newStatus,
            }));

            setSuccessMessage(
                `Account successfully ${action}d.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Account ${action} කිරීම අසාර්ථකයි.`
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-message">
                Loading account details...
            </div>
        );
    }

    if (!account) {
        return (
            <div className="admin-alert error">
                User account එක හමු වුණේ නැහැ.
            </div>
        );
    }

    const normalizedRole = normalizeRole(account.role);

    return (
        <div className="admin-page">
            <Link
                to="/manager/users"
                className="admin-back-link"
            >
                ← Back to User Accounts
            </Link>

            {error && (
                <div className="admin-alert error">{error}</div>
            )}

            {successMessage && (
                <div className="admin-alert success">
                    {successMessage}
                </div>
            )}

            <section className="admin-account-profile">
                <div className="admin-large-avatar">
                    {getFullName().charAt(0).toUpperCase()}
                </div>

                <div className="admin-profile-title">
                    <h1>{getFullName()}</h1>
                    <p>{account.email}</p>

                    <div className="admin-profile-badges">
            <span
                className={`admin-role-badge role-${normalizedRole.toLowerCase()}`}
            >
              {normalizedRole}
            </span>

                        <span
                            className={`admin-status-badge ${
                                account.accountStatus === "ACTIVE"
                                    ? "active"
                                    : "inactive"
                            }`}
                        >
              {account.accountStatus}
            </span>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={updating || isOwnAccount}
                    className={
                        account.accountStatus === "ACTIVE"
                            ? "admin-deactivate-button"
                            : "admin-activate-button"
                    }
                    onClick={handleStatusUpdate}
                >
                    {account.accountStatus === "ACTIVE" ? (
                        <>
                            <UserX size={17} />
                            {updating
                                ? "Updating..."
                                : "Deactivate Account"}
                        </>
                    ) : (
                        <>
                            <UserCheck size={17} />
                            {updating
                                ? "Updating..."
                                : "Activate Account"}
                        </>
                    )}
                </button>
            </section>

            {isOwnAccount && (
                <div className="admin-alert warning">
                    Security protection: ඔබට ඔබගේම manager account
                    එක deactivate කරන්න බැහැ.
                </div>
            )}

            <div className="admin-details-grid">
                <section className="admin-detail-card">
                    <h2>Personal Information</h2>

                    <div className="admin-information-row">
                        <Mail size={19} />
                        <div>
                            <span>Email Address</span>
                            <strong>{account.email}</strong>
                        </div>
                    </div>

                    <div className="admin-information-row">
                        <Phone size={19} />
                        <div>
                            <span>Phone Number</span>
                            <strong>
                                {account.phoneNumber || "Not provided"}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-information-row">
                        <MapPin size={19} />
                        <div>
                            <span>Address</span>
                            <strong>
                                {account.address || "Not provided"}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="admin-detail-card">
                    <h2>Account Information</h2>

                    <div className="admin-information-row">
                        <Shield size={19} />
                        <div>
                            <span>Assigned Role</span>
                            <strong>{normalizedRole}</strong>
                        </div>
                    </div>

                    <div className="admin-information-row">
                        <UserCheck size={19} />
                        <div>
                            <span>Account Status</span>
                            <strong>{account.accountStatus}</strong>
                        </div>
                    </div>

                    <div className="admin-information-row">
                        <Shield size={19} />
                        <div>
                            <span>Registered Date</span>
                            <strong>
                                {account.createdAt
                                    ? new Date(
                                        account.createdAt
                                    ).toLocaleString()
                                    : "—"}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-information-row">
                        <Shield size={19} />
                        <div>
                            <span>Last Updated</span>
                            <strong>
                                {account.updatedAt
                                    ? new Date(
                                        account.updatedAt
                                    ).toLocaleString()
                                    : "—"}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>

            {normalizedRole === "CUSTOMER" && (
                <section className="admin-detail-card">
                    <h2>Customer Loyalty Information</h2>

                    <div className="admin-customer-statistics">
                        <div>
                            <span>Loyalty Tier</span>
                            <strong>
                                {resolveTierName(
                                    account.loyaltyTier,
                                    account.rewardPoints ?? 0
                                ).toUpperCase()}
                            </strong>
                        </div>

                        <div>
                            <span>Reward Points</span>
                            <strong>
                                {account.rewardPoints ?? 0}
                            </strong>
                        </div>

                        <div>
                            <span>Total Orders</span>
                            <strong>{account.totalOrders ?? 0}</strong>
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <strong>
                                LKR{" "}
                                {Number(
                                    account.totalSpent ?? 0
                                ).toLocaleString()}
                            </strong>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}