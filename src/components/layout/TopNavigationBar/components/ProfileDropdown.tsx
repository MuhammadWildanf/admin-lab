import { Link } from 'react-router-dom'
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'

import avatar1 from '@/assets/images/users/avatar-1.jpg'

const ProfileDropdown = () => {
  const { user, removeSession } = useAuthContext()
  
  return (
    <Dropdown className="topbar-item" align={'end'}>
      <DropdownToggle
        as="button"
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <img
            src={user?.profile || avatar1}
            alt={user?.username || 'User'}
            className="rounded-circle header-profile-user"
            width="32"
            height="32"
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">{user?.username || 'User'}</span>
          <IconifyIcon icon="bx:chevron-down" className="d-none d-xl-inline-block" />
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownHeader as="h6">Welcome {user?.username || 'User'}!</DropdownHeader>
        <DropdownDivider className="dropdown-divider my-1" />
        <DropdownItem as={Link} onClick={removeSession} className="text-danger" to="/auth/sign-in">
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
