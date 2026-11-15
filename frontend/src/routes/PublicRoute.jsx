import {
    Navigate,
    Outlet,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";
import LoadingSpinner from
        "../components/common/LoadingSpinner";

function getHomeRoute(role) {
    const normalized = role?.replace("ROLE_", "")?.toUpperCase();
    switch (normalized) {
        case "MANAGER":
            return "/manager/dashboard";

        case "SALES_STAFF":
            return "/sales/dashboard";

        case "INVENTORY_STAFF":
            return "/inventory/dashboard";

        default:
            return "/";
    }
}

export default function PublicRoute() {
    const {
        user,
        isAuthenticated,
        initializing,
    } = useAuth();

    if (initializing) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={getHomeRoute(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
}