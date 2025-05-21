import { Link } from 'react-router-dom'

import type { LogoBoxProps } from '@/types/component-props'


import logovslab from '@/assets/images/logo-vislab.png'

const LogoBox = ({ containerClassName, textLogo }: LogoBoxProps) => {
  return (
    <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">
        {/* <img src={logoSm} className={squareLogo?.className} height={squareLogo?.height ?? 30} width={squareLogo?.width ?? 19} alt="logo sm" /> */}
        <img src={logovslab} className={textLogo?.className} height={textLogo?.height ?? 20} width={textLogo?.width ?? 60} alt="logo dark" />
      </Link>
      <Link to="/" className="logo-light">
        {/* <img src={logoSm} className={squareLogo?.className} height={squareLogo?.height ?? 30} width={squareLogo?.width ?? 19} alt="logo sm" /> */}
        <img src={logovslab} className={textLogo?.className} height={textLogo?.height ?? 20} width={textLogo?.width ?? 60} alt="logo light" />
      </Link>
    </div>
  )
}

export default LogoBox
