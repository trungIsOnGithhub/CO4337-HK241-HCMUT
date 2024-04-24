import React, { memo } from "react";
const Banner = () => {
    return (
        <div className="w-full">
            <img src="https://t4.ftcdn.net/jpg/04/77/43/99/360_F_477439948_yYhtYEis5nChq1Owu5ct9UQSWVfUvPh4.jpg" 
            alt="banner"
            className="w-full h-[450px] object-cover"></img>
        </div>
    )
}

export default memo(Banner)