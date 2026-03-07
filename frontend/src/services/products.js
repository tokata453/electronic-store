import api from './api';

export const getProducts = async (params = {}) => {
    try {
        // Axios automatically converts the params object into a query string!
        const response = await api.get('/api/products', { params });
        
        return response.data.data; 
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
    }
};