import React,{Fragment, memo, useState} from "react";
import logo from "assets/logo_black.png"
import icons from 'ultils/icon'
import {Link, useNavigate} from 'react-router-dom'
import path from 'ultils/path'
import {useDispatch, useSelector } from 'react-redux'
import { logout } from "store/user/userSlice";
import { useEffect } from "react";
// import withBaseComponent from "hocs/withBaseComponent";
import { showCart, showMessage } from "store/app/appSlice";
import { IoChatbubblesSharp } from "react-icons/io5";
import Message from "components/Message/Message";
import { FaCalendarAlt } from "react-icons/fa";
import logoWeb from '../../assets/logoWeb.png'

const {FaPhoneAlt, MdEmail, FaUser, FaShoppingBag} = icons
const Header = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {current} = useSelector(state => state.user)
    const [isShowOptions, setIsShowOptions] = useState(false)
    const {isShowMessage} = useSelector(state => state.app)

    useEffect(() => {
        const handleClickOut = (el) => {
            const profile = document.getElementById('profile')
            if(!profile?.contains(el.target)){  
                setIsShowOptions(false)
            }
        }
        document.addEventListener('click', handleClickOut) 
        return () => {
            document.removeEventListener('click', handleClickOut)
        }
    }, [])
    

    return (
        <div className="flex justify-end w-main items-center py-[24px] text-white mx-auto">
            <div className="flex text-[13px]">
                <div className="flex flex-col items-center px-6 border-r">
                    <span className="flex gap-4 items-center">
                        <FaPhoneAlt color='white' />
                        <span className="font-semibold">1900 8888</span>
                    </span>
                    <span>Call Support 24/7</span>
                </div>
                <div className="flex flex-col items-center px-6 border-r">
                    <span className="flex gap-4 items-center">
                        <MdEmail color='white' />
                        <span className="font-semibold">SUPPORT@BIZSERV.COM</span>
                    </span>
                    <span>Online Support 24/7</span>
                </div>
                {current &&
                <Fragment>
                { +current.role === 202 &&
                <div onClick={()=> dispatch(showCart())} className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r">
                    <FaShoppingBag color='white' />
                    <span>{`${current?.cart_product?.length || 0} item(s)`}</span>
                </div> }
                
                <div onClick={()=> dispatch(showMessage())} className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r relative">
                    <IoChatbubblesSharp color='white' />
                    {isShowMessage &&
                       <div className="absolute top-[120%] left-[-100px] z-[100]">
                            <Message />
                       </div>
                    }
                </div>

                { +current.role === 202 &&
                <div onClick={()=> navigate(`/${path.USER}/${path.MY_CALENDAR}`)} className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r relative">
                    <FaCalendarAlt color='white' />
                </div>
                }

                <div
                    onClick={()=> {
                        setIsShowOptions(!isShowOptions)}}
                        id="profile"
//to = {+current?.role === 1411 ? `/${path.ADMIN}/${path.DASHBOARD}` : `/${path.USER}/${path.PERSONAL}`}
                    className="cursor-pointer flex items-center justify-center px-6 gap-2 relative">

                    <FaUser color='white' />
                    <span>Profile</span>
                    {isShowOptions &&
                        <span className="z-68">
                        <div onClick={(e)=>{e.stopPropagation()}} className="flex flex-col absolute top-full left-0 bg-gray-100 text-[#0a66c2] font-medium border min-w-[150px] py-2">
                            {+current.role === 202 &&
                                <Link className="p-2 w-full hover:bg-sky-100" to={`/${path.USER}/${path.PERSONAL}`} >
                                    Personal
                                </Link>
                            }

                            {+current.role === 1411 &&
                                <Link className="p-2 w-full hover:bg-sky-100 " to={`/${path.ADMIN}/${path.DASHBOARD}`} >
                                Admin Workspace
                                </Link>
                            }

                            <span onClick={() => dispatch(logout())} className="p-2 w-full hover:bg-sky-100">
                                Logout
                            </span>
                        </div>
                        </span>
                    }
                </div>
                </Fragment>
                }
            </div>
        </div>
    )
}

export default memo(Header)