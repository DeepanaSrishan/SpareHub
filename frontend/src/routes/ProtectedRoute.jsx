import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({
                                           allowedRoles = [],
                                       }) {
    const {
        user,
        isAuthenticated,
        initializing,
    } = useAuth();

    const location = useLocation();

    if (initializing) {
        return (
            <div className="page-loading">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    const normalizedUserRole = user?.role
        ?.replace(/^ROLE_/, "")
        ?.toUpperCase();

    const normalizedAllowedRoles =
        allowedRoles.map((role) =>
            role
                .replace(/^ROLE_/, "")
                .toUpperCase()
        );

    const hasRequiredRole =
        normalizedAllowedRoles.length === 0 ||
        normalizedAllowedRoles.includes(
            normalizedUserRole
        );

    if (!hasRequiredRole) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return <Outlet />;
}