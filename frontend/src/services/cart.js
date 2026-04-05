import api from './api';

// Helper function to grab the token and format the header
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        }
    };
};

export const getCart = async () => {
    try {
        // Pass the headers as the second argument
        const response = await api.get('/api/cart', getAuthHeaders());
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        throw error;
    }
};

export const addToCart = async (productId, quantity = 1) => {
    try {
        // Pass the headers as the third argument for POST requests
        const response = await api.post('/api/cart/items', { 
            productId: Number(productId), // Safely cast to integer 
            quantity: Number(quantity) 
        }, getAuthHeaders());
        
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
        }, getAuthHeaders());
        return response.data.data;
    } catch (error) {
        console.error("Failed to update cart item:", error);
        throw error;
    }
};

export const removeFromCart = async (itemId) => {
    try {
        const response = await api.delete(`/api/cart/items/${itemId}`, getAuthHeaders());
        return response.data.data;
    } catch (error) {
        console.error("Failed to remove from cart:", error);
        throw error;
    }
};