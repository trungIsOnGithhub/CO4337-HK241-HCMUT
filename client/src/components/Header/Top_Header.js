import React,{useEffect, memo} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import path from '../../ultils/path'
import { getCurrent } from '../../store/user/asyncAction'
import { useDispatch, useSelector} from 'react-redux'
import icons from '../../ultils/icon'
import { logout, clearMessage } from '../../store/user/userSlice'
import Swal from 'sweetalert2'

const {MdLogout} = icons
const Top_Header = () => {
  const dispatch =  useDispatch()
  const navigate = useNavigate()
  const {isLogin, current, mes} = useSelector(state => state.user)
  useEffect(() => {
    const setTimeoutId = setTimeout(()=>{
      if(isLogin){
        dispatch(getCurrent())
      }
    },300)
    return () =>{
      clearTimeout(setTimeoutId)
    }
  }, [dispatch, isLogin])

  useEffect(() => {
    if(mes) Swal.fire('Oops!', mes, 'info').then(()=>{
      dispatch(clearMessage())
      navigate(`/${path.LOGIN}`)
    })
  }, [mes])
  
  
  return (
    <div className='h-[38px] w-full bg-main flex items-center justify-center'>
        <div className='w-main flex items-center justify-between text-xs text-white'>
            <span className=''>ORDER ONLINE OR CALL US (+1800) 000 8808</span>
            {isLogin && current
            ?
            <div className='flex gap-4 text-sm items-center'>
              <span>
                {`Hello, ${current?.lastName} ${current?.firstName}`}
              </span>
              {/* <span 
                onClick={() => dispatch(logout())}
                className='hover:rounded-full hover:bg-gray-200 hover:text-main cursor-pointer p-2'>
                <MdLogout size={18}/>
              </span> */}
            </div>: 
            <Link className='hover:text-gray-700' to={`/${path.LOGIN}`}>Sign In or Create Account</Link>}
        </div>
    </div>
  )
}

export default memo(Top_Header)