import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileService from "../../services/profileService";
import useAuth from "../../hooks/useAuth";
import "../../styles/customer.css";

const initialProfile = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
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

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await profileService.getProfile();

            setProfile({
                firstName: data.firstName ?? "",
                lastName: data.lastName ?? "",
                email: data.email ?? "",
                phoneNumber: data.phoneNumber ?? "",
                address: data.address ?? "",
                role: data.role,
                accountStatus: data.accountStatus,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Profile information load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value,
        }));
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

        try {
            setProfileSaving(true);
            setProfileMessage("");
            setError("");

            const updatedProfile = await profileService.updateProfile({
                firstName: profile.firstName.trim(),
                lastName: profile.lastName.trim(),
                phoneNumber: profile.phoneNumber.trim(),
                address: profile.address.trim(),
            });

            setProfile((previousProfile) => ({
                ...previousProfile,
                ...updatedProfile,
            }));

            updateStoredUser({
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                email: updatedProfile.email,
            });

            setProfileMessage("Profile එක සාර්ථකව update කළා.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Profile update කිරීම අසාර්ථකයි."
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
            setError("New password එක අවම වශයෙන් characters 8ක් විය යුතුයි.");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New password සහ confirm password සමාන නැහැ.");
            return;
        }

        try {
            setPasswordSaving(true);

            await profileService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword,
            });

            setPasswordMessage(
                "Password එක සාර්ථකව වෙනස් කළා. නැවත login වෙන්න."
            );

            setPasswords(initialPasswords);

            setTimeout(() => {
                logout();
                navigate("/login", {
                    replace: true,
                    state: {
                        message: "Password changed successfully. Please login again.",
                    },
                });
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Password එක වෙනස් කිරීම අසාර්ථකයි."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return <div className="page-message">Loading profile...</div>;
    }

    return (
        <div className="customer-page">
            <div className="page-heading">
                <div>
                    <h1>My Profile</h1>
                    <p>View and update your personal information.</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="customer-grid">
                <section className="content-card">
                    <h2>Personal Information</h2>

                    {profileMessage && (
                        <div className="alert alert-success">
                            {profileMessage}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                />
                                <small>Email address එක මෙතැනින් වෙනස් කළ නොහැක.</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <input value={profile.role ?? ""} disabled />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="address">Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="4"
                                    value={profile.address}
                                    onChange={handleProfileChange}
                                />
                            </div>
                        </div>

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={profileSaving}
                        >
                            {profileSaving ? "Saving..." : "Update Profile"}
                        </button>
                    </form>
                </section>

                <section className="content-card">
                    <h2>Change Password</h2>

                    {passwordMessage && (
                        <div className="alert alert-success">
                            {passwordMessage}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                minLength="8"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                minLength="8"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <button
                            className="danger-button"
                            type="submit"
                            disabled={passwordSaving}
                        >
                            {passwordSaving
                                ? "Changing..."
                                : "Change Password"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;