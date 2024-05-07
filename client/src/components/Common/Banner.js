import React, { memo } from "react";
import banner from 'assets/data-stats-around-person-doing-physical-activity.jpg';
const Banner = () => {
    return (
        <div className="w-full">
            <img src={banner}
            alt="banner"
            className="w-full h-[400px] object-cover"></img>
        </div>
    )
}
// https://t4.ftcdn.net/jpg/04/77/43/99/360_F_477439948_yYhtYEis5nChq1Owu5ct9UQSWVfUvPh4.jpg

export default memo(Banner)