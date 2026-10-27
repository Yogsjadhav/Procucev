import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transcription API calls
export const transcriptionAPI = {
  // Get all transcriptions with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/transcriptions', { params });
    return response.data;
  },

  // Get single transcription by ID
  getById: async (id) => {
    const response = await api.get(`/transcriptions/${id}`);
    return response.data;
  },

  // Create new transcription
  create: async (data) => {
    const response = await api.post('/transcriptions', data);
    return response.data;
  },

  // Update transcription
  update: async (id, data) => {
    const response = await api.put(`/transcriptions/${id}`, data);
    return response.data;
  },

  // Delete transcription
  delete: async (id) => {
    const response = await api.delete(`/transcriptions/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async (userId) => {
    const response = await api.get('/transcriptions/stats/summary', {
      params: { userId },
    });
    return response.data;
  },
};

export default api;
