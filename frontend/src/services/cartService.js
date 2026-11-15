import api from "./api";

const cartService = {
    async getCart() {
        const response = await api.get("/cart");
        return response.data.data;
    },

    async addItem(sparePartId, quantity = 1) {
        const response = await api.post("/cart/items", {
            sparePartId,
            quantity,
        });

        return response.data.data;
    },

    async updateItem(cartItemId, quantity) {
        const response = await api.put(
            `/cart/items/${cartItemId}`,
            { quantity }
        );

        return response.data.data;
    },

    async removeItem(cartItemId) {
        const response = await api.delete(
            `/cart/items/${cartItemId}`
        );

        return response.data.data;
    },

    async clearCart() {
        const response = await api.delete("/cart/clear");
        return response.data.data;
    },
};

export default cartService;