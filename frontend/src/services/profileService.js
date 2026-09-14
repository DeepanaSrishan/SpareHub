import apiClient from "../api/apiClient";

const profileService = {
  getProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/profile", profileData);
    return response.data.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put(
      "/profile/password",
      passwordData
    );

    return response.data;
  },
};

export default profileService;