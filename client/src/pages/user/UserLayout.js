import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import path from 'ultils/path'
import { useSelector } from 'react-redux'
import { UserSideBar } from 'components'


const UserLayout = () => {
  const {isLogin,current} = useSelector(state => state.user)
  if(!isLogin || !current){
    return <Navigate to={`/${path.LOGIN}`} replace={true}/>
  }

  return (
    <div className='flex w-screen'>
      <UserSideBar />
      <div className='flex-auto bg-gray-100 min-h-screen'>
        <Outlet />
      </div>
    </div>
  )
}

export default UserLayout