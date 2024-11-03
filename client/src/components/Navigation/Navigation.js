import React, { memo } from "react";
import {navigation} from '../../ultils/constant'
import {NavLink} from 'react-router-dom'

const Navigation = () => {
    return (
        <div className="w-main h-[48px] py-2 text-sm flex gap-8 items-center font-medium leading-6 text-[#0a66c2] mt-1">
           {navigation.map(el => (
            <NavLink 
                to={el.path} 
                key={el.id} 
                className={({isActive}) => isActive ? 'px-2 py-[2px] text-white bg-blue-500 rounded-lg' : 'px-2 py-[2px] hover:text-white hover:bg-blue-500 hover:rounded-lg'}>
                {el.value}
            </NavLink>
           ))} 
        </div> //1 - 4px
    )
}

export default memo(Navigation)