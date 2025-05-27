export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1987',
  API_PATH: '/api',
}

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}${endpoint}`
}

export const getMediaUrl = (path: string) => {
  return `${API_CONFIG.BASE_URL}${path}`
}

export const getAuthUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
