import React, { memo } from 'react'
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Link , NavLink} from 'react-router-dom';
import icons from '../../ultils/icon';
const {MdArrowForwardIos} = icons
const Breadcrumb = ({title, category}) => {
    const routes = [
      { path: "/:category", breadcrumb: category },
      { path: "/", breadcrumb: "Home" },
      { path: "/:category/:pid/:title", breadcrumb: title },
    ];
    const breadcrumbs = useBreadcrumbs(routes); 
    return (
      <div className='text-sm flex items-center gap-1'>
        {breadcrumbs?.filter(el => !el.match.route === false).map(({ match, breadcrumb },index, self) => (
          <Link className='flex gap-1 items-center hover:text-main' key={match.pathname} to={match.pathname}>
            <span className='capitalize'>
              {breadcrumb} 
            </span>
            {index !== (self.length-1) && <MdArrowForwardIos />}
          </Link>
        ))}
      </div>
    )
}

export default memo(Breadcrumb)