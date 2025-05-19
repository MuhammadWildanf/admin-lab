import { Helmet } from 'react-helmet-async'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'

const PageMetaData = ({ title }: { title: string }) => {
  const defaultTitle = DEFAULT_PAGE_TITLE
  return (
    <Helmet>
      <title>{title ? `${title} | Imajiwa Lab- Admin Dashboard` : defaultTitle}</title>
    </Helmet>
  )
}

export default PageMetaData
