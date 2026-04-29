import api from './api';

export const getCart = async () => {
    try {
        const response = await api.get('/api/cart');
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        throw error;
    }
};

export const addToCart = async (productId, quantity = 1) => {
    try {
        const response = await api.post('/api/cart/items', { 
            productId: Number(productId), 
            quantity: Number(quantity) 
        });
        window.dispatchEvent(new Event('cartUpdated'));
        return response.data.data;
    } catch (error) {
        console.error("Failed to add to cart:", error);
        throw error;
    }
};

export const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await api.put(`/api/cart/items/${itemId}`, { 
            quantity: Number(quantity) 
        });
        return response.data.data;
    } catch (error) {
        console.error("Failed to update cart item:", error);
        throw error;
    }
};

export const removeFromCart = async (itemId) => {
    try {
        const response = await api.delete(`/api/cart/items/${itemId}`);
        return response.data.data;
    } catch (error) {
        console.error("Failed to remove from cart:", error);
        throw error;
    }
};

export const mergeCarts = async (sessionId) => {
    try {
        const response = await api.post('/api/cart/merge', { sessionId });
        return response.data;
    } catch (error) {
        console.error("Failed to merge carts:", error);
        throw error;
    }
};