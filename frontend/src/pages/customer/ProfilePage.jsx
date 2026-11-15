import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    KeyRound,
    Shield,
    Award,
    Calendar,
    Clock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import profileService from "../../services/profileService";
import useAuth from "../../hooks/useAuth";
import "../../styles/customer.css";

const resolveLoyaltyTier = (tier, points = 0) => {
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

const initialProfile = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    accountStatus: "",
    loyaltyTier: null,
    loyaltyPoints: 0,
    lastLoginAt: null,
    createdAt: null,
};

const initialPasswords = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

function ProfilePage() {
    const navigate = useNavigate();
    const { updateStoredUser, logout } = useAuth();

    const [profile, setProfile] = useState(initialProfile);
    const [passwords, setPasswords] = useState(initialPasswords);

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await profileService.getProfile();
            const resolvedTier = resolveLoyaltyTier(data.loyaltyTier, data.loyaltyPoints);

            // Clean & standardize phone to 10 digits if present
            let initialPhone = (data.phone ?? "").toString().trim();
            if (initialPhone) {
                if (initialPhone.startsWith("+94")) {
                    initialPhone = "0" + initialPhone.slice(3).replace(/\D/g, "");
                } else if (initialPhone.startsWith("94") && initialPhone.length > 10) {
                    initialPhone = "0" + initialPhone.slice(2).replace(/\D/g, "");
                } else {
                    initialPhone = initialPhone.replace(/\D/g, "");
                }
                initialPhone = initialPhone.slice(0, 10);
            }

            setProfile({
                fullName: data.fullName ?? "",
                email: data.email ?? "",
                phone: initialPhone,
                address: data.address ?? "",
                role: data.role ?? "",
                accountStatus: data.accountStatus ?? "ACTIVE",
                loyaltyTier: resolvedTier,
                loyaltyPoints: data.loyaltyPoints ?? 0,
                lastLoginAt: data.lastLoginAt ?? null,
                createdAt: data.createdAt ?? null,
            });

            if (updateStoredUser) {
                updateStoredUser({
                    loyaltyTier: resolvedTier,
                    loyaltyPoints: data.loyaltyPoints ?? 0,
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load profile details. Please refresh the page."
            );
        } finally {
            setLoading(false);
        }
    }, [updateStoredUser]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile();
    }, [loadProfile]);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        if (name === "phone") {
            // Strictly digits only (no text/symbols) and max 10 digits
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setProfile((previousProfile) => ({
                ...previousProfile,
                phone: digitsOnly,
            }));
            return;
        }
        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value,
        }));
    };

    const handlePhoneKeyDown = (event) => {
        // Allow navigation and shortcut keys
        if (
            [
                "Backspace",
                "Delete",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "Enter",
            ].includes(event.key) ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }
        // Disallow any key that is not a numeric digit (0-9)
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswords((previousPasswords) => ({
            ...previousPasswords,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = profile.fullName.trim();
        if (!trimmedName || trimmedName.length < 2) {
            setError("Full name must contain between 2 and 120 characters.");
            return;
        }

        const trimmedPhone = profile.phone ? profile.phone.trim() : "";
        if (trimmedPhone) {
            if (!trimmedPhone.startsWith("0")) {
                setError("Phone number must start with 0 according to Sri Lankan standard (e.g. 07XXXXXXXX).");
                return;
            }
            if (trimmedPhone.length !== 10) {
                setError(`Phone number must contain exactly 10 digits (currently ${trimmedPhone.length}/10).`);
                return;
            }
            if (!/^0[1-9]\d{8}$/.test(trimmedPhone)) {
                setError("Please enter a valid Sri Lankan phone number (e.g. 0771234567).");
                return;
            }
        }

        try {
            setProfileSaving(true);
            setProfileMessage("");
            setError("");

            const updatedProfile = await profileService.updateProfile({
                fullName: trimmedName,
                phone: profile.phone ? profile.phone.trim() : null,
                address: profile.address ? profile.address.trim() : null,
            });

            setProfile((previousProfile) => ({
                ...previousProfile,
                fullName: updatedProfile.fullName,
                phone: updatedProfile.phone ?? "",
                address: updatedProfile.address ?? "",
            }));

            updateStoredUser({
                fullName: updatedProfile.fullName,
                email: updatedProfile.email,
            });

            setProfileMessage("Profile information updated successfully!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update profile. Please check the inputs and try again."
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setError("");

        if (passwords.newPassword.length < 8) {
            setError("New password must contain at least 8 characters.");
            return;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).+$/;
        if (!passwordPattern.test(passwords.newPassword)) {
            setError(
                "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {
            setPasswordSaving(true);

            await profileService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmNewPassword: passwords.confirmPassword,
                confirmPassword: passwords.confirmPassword,
            });

            setPasswordMessage(
                "Password changed successfully! Redirecting to login page..."
            );
            setPasswords(initialPasswords);

            setTimeout(() => {
                logout();
                navigate("/login", {
                    replace: true,
                    state: {
                        message:
                            "Password changed successfully. Please log in again.",
                    },
                });
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to change password. Please verify your current password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        try {
            return new Date(isoString).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "N/A";
        try {
            return new Date(isoString).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "N/A";
        }
    };

    const formatRoleName = (role) => {
        if (!role) return "User";
        switch (role) {
            case "SALES_STAFF":
                return "Sales Staff";
            case "INVENTORY_STAFF":
                return "Inventory Staff";
            case "MANAGER":
                return "Store Manager";
            case "CUSTOMER":
                return "Customer";
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="customer-page">
                <div className="page-state">Loading profile details...</div>
            </div>
        );
    }

    const displayTier = resolveLoyaltyTier(profile.loyaltyTier, profile.loyaltyPoints);

    return (
        <div className="customer-page profile-page-container">
            {/* Hero Profile Banner Card */}
            <header className="profile-hero-card">
                <div className="profile-avatar-circle">
                    {getInitials(profile.fullName)}
                </div>

                <div className="profile-hero-content">
                    <div className="profile-hero-top">
                        <h1 className="profile-hero-name">
                            {profile.fullName || "User Profile"}
                        </h1>
                        <span className="profile-badge-role">
                            <Shield size={14} />
                            {formatRoleName(profile.role)}
                        </span>
                        <span className="profile-badge-status">
                            <span className="status-dot"></span>
                            {profile.accountStatus}
                        </span>
                        {(profile.role === "CUSTOMER" || profile.loyaltyTier || profile.loyaltyPoints > 0) && (
                            <span className={`profile-badge-loyalty tier-${displayTier.toLowerCase()}`}>
                                <Award size={14} />
                                {displayTier} Tier ({profile.loyaltyPoints ?? 0} pts)
                            </span>
                        )}
                    </div>

                    <p className="profile-hero-email">
                        <Mail size={15} />
                        {profile.email}
                    </p>

                    <div className="profile-meta-strip">
                        <div className="profile-meta-item">
                            <Calendar size={14} />
                            <span>Member Since: {formatDate(profile.createdAt)}</span>
                        </div>
                        <div className="profile-meta-item">
                            <Clock size={14} />
                            <span>Last Login: {formatDateTime(profile.lastLoginAt)}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Global Error Banner */}
            {error && (
                <div className="alert alert-error profile-alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Content Two-Column Grid */}
            <div className="customer-grid profile-cards-grid">
                {/* Personal Information Form */}
                <section className="content-card profile-card">
                    <div className="profile-card-header">
                        <User className="profile-section-icon" size={22} />
                        <div>
                            <h2>Personal Information</h2>
                            <p>Update your personal and contact details.</p>
                        </div>
                    </div>

                    {profileMessage && (
                        <div className="alert alert-success profile-alert">
                            <CheckCircle2 size={18} />
                            <span>{profileMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <div className="input-with-icon">
                                <User size={16} className="field-icon" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    maxLength="120"
                                    value={profile.fullName}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={16} className="field-icon" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                />
                            </div>
                            <small className="field-hint">
                                Email address is permanently bound to your account and cannot be changed.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-with-icon">
                                <Phone size={16} className="field-icon" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={10}
                                    value={profile.phone}
                                    onChange={handleProfileChange}
                                    onKeyDown={handlePhoneKeyDown}
                                    placeholder="07XXXXXXXX (10 digits)"
                                />
                            </div>
                            <small className="field-hint">
                                Sri Lankan standard: 10 digits starting with 0 (e.g. 0771234567) {profile.phone ? `(${profile.phone.length}/10 digits)` : ""}
                            </small>
                            {profile.phone && !profile.phone.startsWith("0") && (
                                <small className="field-warning" style={{ color: "#ef4444", display: "block", marginTop: "4px", fontSize: "12px", fontWeight: "600" }}>
                                    ⚠️ Must start with 0 according to Sri Lankan standard (e.g. 07XXXXXXXX).
                                </small>
                            )}
                            {profile.phone && profile.phone.length > 0 && profile.phone.length < 10 && (
                                <small className="field-warning" style={{ color: "#f59e0b", display: "block", marginTop: "4px", fontSize: "12px" }}>
                                    ℹ️ {10 - profile.phone.length} more digit{10 - profile.phone.length > 1 ? "s" : ""} required (10 digits total).
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Delivery / Contact Address</label>
                            <div className="input-with-icon textarea-icon-wrapper">
                                <MapPin size={16} className="field-icon textarea-icon" />
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    maxLength="500"
                                    value={profile.address}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your address"
                                />
                            </div>
                        </div>

                        <button
                            className="primary-button profile-submit-btn"
                            type="submit"
                            disabled={profileSaving}
                        >
                            {profileSaving ? "Saving changes..." : "Save Profile Details"}
                        </button>
                    </form>
                </section>

                {/* Password & Security Card */}
                <section className="content-card profile-card">
                    <div className="profile-card-header">
                        <KeyRound className="profile-section-icon" size={22} />
                        <div>
                            <h2>Change Password</h2>
                            <p>Protect your account with a secure password.</p>
                        </div>
                    </div>

                    {passwordMessage && (
                        <div className="alert alert-success profile-alert">
                            <CheckCircle2 size={18} />
                            <span>{passwordMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <div className="input-with-icon password-input-container">
                                <Lock size={16} className="field-icon" />
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                                    aria-label="Toggle current password visibility"
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="input-with-icon password-input-container">
                                <Lock size={16} className="field-icon" />
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    minLength="8"
                                    maxLength="72"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    aria-label="Toggle new password visibility"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <small className="field-hint">
                                Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="input-with-icon password-input-container">
                                <Lock size={16} className="field-icon" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    minLength="8"
                                    maxLength="72"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="danger-button profile-submit-btn"
                            type="submit"
                            disabled={passwordSaving}
                        >
                            {passwordSaving ? "Changing Password..." : "Update Password"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;