import React from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import path from 'ultils/path'
import { useSelector } from 'react-redux'
import { UserSideBar } from 'components'
import Swal from 'sweetalert2'


const UserLayout = () => {
  const navigate = useNavigate()
  const {isLogin} = useSelector(state => state.user)
  if(!isLogin ){
    Swal.fire({
        text: 'Login to review',
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Go login',
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        title: 'Oops!',
        showCancelButton: true,
    }).then((rs)=>{
        if(rs.isConfirmed){
            navigate(`/${path.LOGIN}`)
        }
    })
  }

  return (
    <div className='flex w-screen h-screen'>
      <div className='w-fit h-screen'>
      <UserSideBar />
      </div>
      <div className='flex-auto bg-gray-100 h-screen overflow-y-auto'>
        <Outlet />
      </div>
    </div>
  )
}

export default UserLayout