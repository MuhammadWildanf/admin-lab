import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

// Dashboard Routes
const Analytics = lazy(() => import('@/app/(admin)/dashboard/analytics/page'))

// Add Category Route
const Category = lazy(() => import('@/app/(admin)/category/page'))
const SubCategory = lazy(() => import('@/app/(admin)/sub-category/page'))
// Add Product Route
const Product = lazy(() => import('@/app/(admin)/product/page'))

// Pages Routes
const ComingSoon = lazy(() => import('@/app/(other)/coming-soon/page'))
const Maintenance = lazy(() => import('@/app/(other)/maintenance/page'))

// Not Found Routes
const NotFound = lazy(() => import('@/app/(other)/(error-pages)/error-404/page'))

// Auth Routes
const AuthSignIn2 = lazy(() => import('@/app/(other)/auth/sign-in-2/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboard/analytics" />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    element: <Analytics />,
  },
  {
    path: '/sub-category',
    name: 'Sub Category',
    element: <SubCategory />,
  },
  {
    path: '/category',
    name: 'Category',
    element: <Category />,
  },
  {
    path: '/product',
    name: 'Product',
    element: <Product />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn2 />,
  },
  {
    name: '404 Error',
    path: '/error-404',
    element: <NotFound />,
  },
  {
    path: '*',
    name: 'not-found',
    element: <NotFound />,
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    element: <Maintenance />,
  },
  {
    name: 'Coming Soon',
    path: '/coming-soon',
    element: <ComingSoon />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...authRoutes,
]
