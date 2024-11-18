import React, { memo, Fragment, useState} from 'react'
import logo from 'assets/logo_digital_new_250x.png'
import { userSidebar } from 'ultils/constant'
import { NavLink, Link} from 'react-router-dom'
import clsx from 'clsx'
import icons from 'ultils/icon'
import { useSelector } from 'react-redux'
import avatarDefault from '../../assets/avatarDefault.png'
import { FaHome } from "react-icons/fa";

const activeStyle = 'px-4 py-2 flex items-center gap-2 text-gray-100 bg-[#0a66c2]'
const notActiveStyle = 'px-4 py-2 flex items-center gap-2 hover:bg-gray-600'

const {FaCaretDown, FaCaretRight} = icons
const UserSideBar = () => {
  const [active, setActive] = useState([])
  const {current} = useSelector(state => state.user)
  const handleShowTab = (tabId) =>{
    if(active.some(el=>el === tabId)){
      setActive(prev => prev.filter(el=>el !== tabId))
    }
    else{
      setActive(prev => [...prev, tabId])
    }
  }
  return (
    <div className='bg-[#00143c] text-white h-full py-4 w-[250px] flex-none'>
        <div className='w-full flex flex-col items-center justify-center py-4'>
            <img src={current?.avatar || avatarDefault} alt='logo' className='w-16 h-16 object-cover'></img>
            <span>{`${current?.lastName} ${current?.firstName}`}</span>
        </div>

        <div>
          {current?.role && userSidebar.map(el => (
            <Fragment key={el?.id}>
              {el?.type === 'single' &&
              el?.visibleForRole?.indexOf(parseInt(current.role)) >= 0 &&
              <NavLink
                to={el?.path}
                className={({isActive})=> clsx(isActive && activeStyle, !isActive&& notActiveStyle)}>
                <span>{el?.icon}</span>
                <span>{el?.text}</span>
              </NavLink>}
              {el?.type === 'parent' &&
              <div onClick={() => handleShowTab(+el.id)} className='flex flex-col'>
                <div className='px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-600'> 
                  <div className='flex items-center gap-2'>
                  <span>{el?.icon}</span>
                  <span>{el?.text}</span>
                  </div>

                  {active.some(id => +id === +el.id) ? <FaCaretRight />: <FaCaretDown />}
                </div>

                {active.some(id => +id === +el.id) &&
                  <div className='flex flex-col'>
                  {el?.submenu?.map(item => (
                    <NavLink 
                      key={item?.text} 
                      to={item?.path} 
                      onClick={e=>e.stopPropagation()}
                      className={({isActive})=> clsx(isActive && activeStyle, !isActive&& notActiveStyle, 'pl-10')}>
                      {item?.text}
                    </NavLink>
                  ))}
                </div>
                }
              </div>
              }
            </Fragment>
          ))}
          <NavLink 
            to={'/'}
            className={({isActive})=> clsx(isActive && activeStyle, !isActive&& notActiveStyle)}>
            <span><FaHome size={20}/></span>
            <span>Back</span>
          </NavLink>
        </div>
    </div>
  )
}

export default memo(UserSideBar)