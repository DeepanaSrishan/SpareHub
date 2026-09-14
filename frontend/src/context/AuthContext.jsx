import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] =
        useState(true);

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem(
                    "sparehub_user"
                );

            const token =
                localStorage.getItem(
                    "sparehub_access_token"
                );

            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            localStorage.removeItem(
                "sparehub_user"
            );

            localStorage.removeItem(
                "sparehub_access_token"
            );
        } finally {
            setInitializing(false);
        }
    }, []);

    const login = useCallback(
        async (credentials) => {
            const authData =
                await authService.login(
                    credentials
                );

            const authenticatedUser = {
                id: authData.userId,
                fullName: authData.fullName,
                email: authData.email,
                role: authData.role,
                accountStatus:
                authData.accountStatus,
                loyaltyTier:
                authData.loyaltyTier,
                loyaltyPoints:
                authData.loyaltyPoints,
            };

            localStorage.setItem(
                "sparehub_access_token",
                authData.accessToken
            );

            localStorage.setItem(
                "sparehub_user",
                JSON.stringify(
                    authenticatedUser
                )
            );

            setUser(authenticatedUser);

            return authenticatedUser;
        },
        []
    );

    const logout = useCallback(() => {
        localStorage.removeItem(
            "sparehub_access_token"
        );

        localStorage.removeItem(
            "sparehub_user"
        );

        setUser(null);
    }, []);

    const updateStoredUser = useCallback(
        (updatedUser) => {
            setUser((currentUser) => {
                const mergedUser = {
                    ...currentUser,
                    ...updatedUser,
                };

                localStorage.setItem(
                    "sparehub_user",
                    JSON.stringify(mergedUser)
                );

                return mergedUser;
            });
        },
        []
    );

    const value = useMemo(
        () => ({
            user,
            initializing,
            isAuthenticated: Boolean(user),
            login,
            logout,
            updateStoredUser,
        }),
        [
            user,
            initializing,
            login,
            logout,
            updateStoredUser,
        ]
    );


    return (
        <AuthContext.Provider
            value={value}>
            {children}
        </AuthContext.Provider>
    );
}