import React,{useEffect, memo} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import path from '../../ultils/path'
import { getCurrent } from '../../store/user/asyncAction'
import { useDispatch, useSelector} from 'react-redux'
import icons from '../../ultils/icon'
import { logout, clearMessage } from '../../store/user/userSlice'
import Swal from 'sweetalert2'
import Button from 'components/Buttons/Button'
import logoWeb from '../../assets/logoWeb.png'

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
    <div className='w-full flex items-center justify-center h-[60px] py-2 px-6 sticky top-0 z-[1000] bg-white'>
        <div className='w-main flex items-center justify-between text-xs text-[#0a66c2] '>
            <Link to={`/${path.HOME}`} className='flex items-center py-2 gap-1 justify-center'>
                <img src={logoWeb} className='w-12 h-12'/>
                <span className='font-semibold text-4xl mb-1'>Biz<span className='text-blue-500'>Serv</span></span>
            </Link>
            {isLogin && current
            ?
            <div className='flex gap-4 text-sm items-center'>
              <span>
                {`Hello, ${current?.lastName} ${current?.firstName}`}
              </span>
            </div>
            : 
            <Button style={'px-6 py-2 rounded-l-full rounded-r-full bg-white border-2 border-[#0a66c2] text-[#0a66c2]  hover:bg-[#0a66c2] hover:text-white transition-colors text-sm'} handleOnclick={() => navigate(`/${path.LOGIN}`)}>Sign In</Button>
            }
        </div>
    </div>
  )
}

export default memo(Top_Header)