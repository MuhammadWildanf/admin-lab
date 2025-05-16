import { yupResolver } from '@hookform/resolvers/yup'
import type { AxiosResponse } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import httpClient from '@/helpers/httpClient'
import type { UserType } from '@/types/auth'

interface LoginResponse {
  id: number
  username: string
  email: string
  role: string
  access_token: string
}

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
  const [searchParams] = useSearchParams()

  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      setLoading(true)
      const res: AxiosResponse<LoginResponse> = await httpClient.post('http://localhost:1987/login', values)
      if (res.data.access_token) {
        const userData: UserType = {
          id: String(res.data.id),
          username: res.data.username,
          email: res.data.email,
          role: res.data.role,
          token: res.data.access_token,
          password: '', // Required by UserType but not used after login
          firstName: res.data.username, // Using username as firstName since it's not in the response
          lastName: '', // Not provided in the response
        }
        
        localStorage.setItem('_Rasket_AUTH_KEY_', JSON.stringify(userData))
        saveSession(userData)
        
        redirectUser()
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        showNotification({ message: e.response.data.message, variant: 'danger' })
      } else {
        showNotification({ message: 'An error occurred during login', variant: 'danger' })
      }
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
