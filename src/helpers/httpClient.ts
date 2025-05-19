import axios from 'axios'

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the access_token
instance.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('_AUTH_KEY_')
    if (authData) {
      const { token } = JSON.parse(authData)
      config.headers.access_token = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

function HttpClient() {
  return {
    get: instance.get,
    post: instance.post,
    patch: instance.patch,
    put: instance.put,
    delete: instance.delete,
  }
}

export default HttpClient()
