import apiClient from "../api/apiClient";

const userAdministrationService = {
    getUsers: async ({
                         search = "",
                         role = "",
                         status = "",
                         page = 0,
                         size = 10,
                     } = {}) => {
        const params = {
            page,
            size,
        };

        if (search) {
            params.search = search;
        }

        if (role) {
            params.role = role;
        }

        if (status) {
            params.status = status;
        }

        const response = await apiClient.get("/manager/users", {
            params,
        });

        return response.data.data;
    },

    getUserById: async (userId) => {
        const response = await apiClient.get(
            `/manager/users/${userId}`
        );

        return response.data.data;
    },

    updateAccountStatus: async (userId, accountStatus) => {
        const response = await apiClient.patch(
            `/manager/users/${userId}/status`,
            {
                accountStatus,
            }
        );

        return response.data.data;
    },
};

export default userAdministrationService;