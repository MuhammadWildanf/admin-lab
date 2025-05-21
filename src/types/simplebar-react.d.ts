declare module 'simplebar-react' {
  import { ComponentType, HTMLAttributes } from 'react'
  
  export interface SimpleBarProps extends HTMLAttributes<HTMLDivElement> {
    scrollableNodeProps?: HTMLAttributes<HTMLDivElement>
    options?: {
      autoHide?: boolean
      clickOnTrack?: boolean
      direction?: 'ltr' | 'rtl'
      scrollbarMinSize?: number
      scrollbarMaxSize?: number
      timeout?: number
    }
  }

  const SimpleBar: ComponentType<SimpleBarProps>
  export default SimpleBar
}
