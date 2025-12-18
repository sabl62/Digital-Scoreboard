import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getHello = async () => {
    const response = await api.get('/api/hello/');
    return response.data;
};

export const testPost = async (data) => {
    const response = await api.post('/api/test/', data);
    return response.data;
};

export default api;