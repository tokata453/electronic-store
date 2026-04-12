import api from './api';

export const placeOrder = async (orderPayload) => {
  try {
    const response = await api.post('/api/orders', orderPayload);
    return response.data;
  } catch (error) {
    console.error("Failed to place order:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/api/orders');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};