// import type { ChildrenType } from '@/types/component-props'
// import type SimpleBarCore from 'simplebar-core'
// import SimpleBar, { type Props } from 'simplebar-react'

// type SimplebarReactClientProps = React.ForwardRefExoticComponent<Props & React.RefAttributes<SimpleBarCore | null>>['defaultProps'] & ChildrenType

// const SimplebarReactClient = ({ children, ...options }: SimplebarReactClientProps) => {
//   return <SimpleBar {...options}>{children}</SimpleBar>
// }

// export default SimplebarReactClient

import SimpleBar from 'simplebar-react'
import type { ChildrenType } from '@/types/component-props'
import type { HTMLAttributes } from 'react'

type SimplebarReactClientProps = HTMLAttributes<HTMLDivElement> & ChildrenType

const SimplebarReactClient = ({ children, ...options }: SimplebarReactClientProps) => {
  return <SimpleBar {...options}>{children}</SimpleBar>
}

export default SimplebarReactClient

