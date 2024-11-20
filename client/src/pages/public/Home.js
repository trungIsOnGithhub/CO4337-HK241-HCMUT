import React from "react";
import {BestSeller, Sidebar, Banner, DealDaily, FeaturedService, Service, CustomSliderService, HomeSearchBar} from '../../components' 
import { useSelector } from "react-redux";
import icons from '../../ultils/icon'
import withBaseComponent from "hocs/withBaseComponent";
import { createSearchParams } from "react-router-dom";

const {MdArrowForwardIos} = icons
const Home = ({navigate}) => {
    const newProducts = useSelector(state => {return state.product?.newProducts?.map(payload => payload?.sv) || []; })
    const {categories} = useSelector(state => state.app)
    const {isLogin, current} = useSelector(state => state.user)

    console.log(newProducts)

    return (
        <>
            <div className="w-main flex mt-6">
                <div className="flex flex-col gap-5 w-[25%] flex-auto">   
                    <Sidebar />
                    <DealDaily></DealDaily>
                </div>
                <div className="flex flex-col gap-5 pl-5 w-[75%] flex-auto ">
                    <Banner />
                    <BestSeller />
                </div>
            </div>
            <div className="my-8">
                <FeaturedService />
            </div>
        </>
    )
}

export default withBaseComponent(Home)