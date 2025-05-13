import type { BootstrapVariantType } from '@/types/component-props'

export type StatType = {
  title: string
  icon: string
  stat: string
  change: string
  variant: string
}

export type OnlineUserType = {
  name: string
  percentage: string
  amount: number
}

export type CountryType = {
  icon: string
  name: string
  value: number
  amount: number
  variant: BootstrapVariantType
}

export type BrowserType = {
  name: string
  percentage: number
  amount: number
}

export type PageType = {
  path: string
  views: number
  avgTime: string
  exitRate: number
  variant: BootstrapVariantType
}
