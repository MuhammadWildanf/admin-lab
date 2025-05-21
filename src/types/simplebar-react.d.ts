declare module 'simplebar-react' {
  import * as React from 'react'

  export interface SimpleBarProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    scrollableNodeProps?: React.HTMLAttributes<HTMLDivElement>
  }

  export default class SimpleBar extends React.Component<SimpleBarProps> {}
}
