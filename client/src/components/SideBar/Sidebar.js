import React, {useState,useEffect, memo} from "react";
import { apiGetCategories } from "../../apis/app";
import { NavLink } from "react-router-dom";
import {createSlug} from "../../ultils/helper"
import {useSelector} from 'react-redux'
const Sidebar = () => {
    const {categories_service} = useSelector(state => state.category)
    return (
        <div className="flex flex-col border">
            <span className="p-2 text-center text-white bg-red-600 text-semibold">Service Category</span>
            {categories_service?.map(el =>(
                <NavLink
                    key={createSlug(el.title)}
                    to={createSlug(el.title)}
                    className={({isActive})=> isActive ? 'bg-main text-white px-5 pt-[15px] pb-[14px] text-sm hover:text-main' : 'px-5 pt-[15px] pb-[14px] text-sm hover:text-main'}>
                    {el.title}
                </NavLink>
            ) )}
        </div>
    )
}

export default memo(Sidebar)