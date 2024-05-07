import React,{Fragment, memo, useState} from "react";
import logo from "assets/logo_black.png"
import icons from 'ultils/icon'
import {Link} from 'react-router-dom'
import path from 'ultils/path'
import {useSelector } from 'react-redux'
import { logout } from "store/user/userSlice";
import { useEffect } from "react";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";

const {FaPhoneAlt, MdEmail, FaUser, FaShoppingBag} = icons
const Header = ({dispatch}) => {
    const {current} = useSelector(state => state.user)
    const [isShowOptions, setIsShowOptions] = useState(false)
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
        <div className="flex justify-between w-main h-[110px] py-[35px]">
            <Link to={`/${path.HOME}`}>
                <img src={logo} alt="logo" className="w-[234px] object-contain" ></img>
            </Link>
            <div className="flex text-[13px]">
                <div className="flex flex-col items-center px-6 border-r">
                    <span className="flex gap-4 items-center">
                        <FaPhoneAlt color='red' />
                        <span className="font-semibold">(+1800) 000 8808</span>
                    </span>
                    <span>Mon-Sat 9:00AM - 8:00PM</span>
                </div>
                <div className="flex flex-col items-center px-6 border-r">
                    <span className="flex gap-4 items-center">
                        <MdEmail color='red' />
                        <span className="font-semibold">SUPPORT@TADATHEMES.COM</span>
                    </span>
                    <span>Online Support 24/7</span>
                </div>
                {current &&
                <Fragment>
                <div onClick={()=> dispatch(showCart())} className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r">
                    <FaShoppingBag color='red' />
                    <span>{`${current?.cart?.length || 0} item(s)`}</span>
                </div>

                <div
                    onClick={()=> {
                        setIsShowOptions(!isShowOptions)}}
                        id="profile"
//to = {+current?.role === 1411 ? `/${path.ADMIN}/${path.DASHBOARD}` : `/${path.USER}/${path.PERSONAL}`}
                    className="cursor-pointer flex items-center justify-center px-6 gap-2 relative">

                    <FaUser color='red' />
                    <span>Profile</span>
                    {isShowOptions &&
                        <div onClick={(e)=>{e.stopPropagation()}} className="flex flex-col absolute top-full left-0 bg-gray-100 border min-w-[150px] py-2">
                        <Link className="p-2 w-full hover:bg-sky-100" to={`/${path.USER}/${path.PERSONAL}`}>
                            Personal
                        </Link>

                        {+current.role === 1411 && 
                            <Link className="p-2 w-full hover:bg-sky-100" to={`/${path.ADMIN}/${path.DASHBOARD}`}>
                            Admin Workspace
                            </Link>
                        }

                        <span onClick={() => dispatch(logout())} className="p-2 w-full hover:bg-sky-100">
                            Logout
                        </span>
                    </div>
                    }
                </div>
                </Fragment>
                }
            </div>
        </div>
    )
}

export default withBaseComponent(memo(Header))