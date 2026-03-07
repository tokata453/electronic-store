import api from './api';

export const getCategories = async () => {
    try {
        const response = await api.get('/api/categories');
        
        // Axios wraps the backend response inside its own 'data' object. 
        // Assuming your backend sends { data: { categories: [...] } }
        return response.data.data.categories.sort((a, b) => a.sortOrder - b.sortOrder); 
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
    }
};

export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/api/categories/${id}`);
        // Returns the category object which includes the products array
        return response.data.data.category;
    } catch (error) {
        console.error(`Failed to fetch category ${id}:`, error);
        throw error;
    }
};