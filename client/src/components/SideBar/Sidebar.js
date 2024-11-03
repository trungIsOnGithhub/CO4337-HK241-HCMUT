import React, {useState,useEffect, memo} from "react";
import { apiGetCategories } from "../../apis/app";
import { NavLink } from "react-router-dom";
import {createSlug} from "../../ultils/helper"
import {useSelector} from 'react-redux'
const Sidebar = () => {
    const {categories_service} = useSelector(state => state.category)
    return (
        <div className="flex flex-col border">
            <span className="px-5 pt-[15px] pb-[14px] text-white bg-[#0a66c2] font-semibold text-lg">Service Category</span>
            {categories_service?.map(el =>(
                <NavLink
                    key={createSlug(el.title)}
                    to={`service/${createSlug(el.title)}`}
                    className={({isActive})=> isActive ? 'bg-[#0a66c2] text-white px-5 pt-[15px] pb-[14px] text-sm transition-colors' : 'px-5 pt-[15px] pb-[14px] text-sm hover:bg-[#0a66c2] hover:text-white'}>
                    {el.title}
                </NavLink>
            ) )}
        </div>
    )
}

export default memo(Sidebar)