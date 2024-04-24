import React from "react";
import {Header, Navigation, Top_Header, Footer} from '../../components' 
import {Outlet} from "react-router-dom";
const Public = () => {
    return (
        <div className = 'w-full max-h-screen overflow-y-auto flex flex-col items-center'>
                <Top_Header />
                <Header />
                <Navigation />
                <div className="w-full flex items-center flex-col">
                    <Outlet />
                </div>
                <Footer />
        </div>
    )
}

export default Public