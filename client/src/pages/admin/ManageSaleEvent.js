import { apiGetAllFlashSaleByAdmin } from 'apis'
import { Button } from 'components'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaPlus } from "react-icons/fa6";
import bgImage from '../../assets/clouds.svg'
import { RxMixerVertical } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isBefore, isAfter, addMinutes } from 'date-fns';

const ManageSaleEvent = () => {
  const [flashsales, setFlashsales] = useState([])
  useEffect(() => {
    const fetchAllFlashSaleByAdmin = async () => {
      const response = await apiGetAllFlashSaleByAdmin()
      if(response?.success){
        setFlashsales(response?.flashsales)
      }
    }
    fetchAllFlashSaleByAdmin()
  }, []);
  

  const checkFlashSaleStatus = (startDate, startTime, duration) => {
    const [day, month, year] = startDate.split('/'); // Tách ngày tháng năm
    const [hours, minutes] = startTime.split(':'); // Tách giờ phút
    const startDateTime = new Date(year, month - 1, day, hours, minutes); // Tạo đối tượng Date bắt đầu sự kiện
    const currentDateTime = new Date(); // Thời điểm hiện tại

    const endDateTime = addMinutes(startDateTime, duration); // Thời điểm kết thúc sự kiện

    if (isBefore(currentDateTime, startDateTime)) {
      const daysToGo = differenceInDays(startDateTime, currentDateTime);
      const hoursToGo = differenceInHours(startDateTime, currentDateTime);
      const minutesToGo = differenceInMinutes(startDateTime, currentDateTime);

      if (daysToGo > 1) {
        return `${daysToGo} days to go`;
      } else if (hoursToGo >= 1) {
        return `${hoursToGo} hours to go`;
      } else {
        return `${minutesToGo} minutes to go`;
      }
    } else if (isAfter(currentDateTime, startDateTime) && isBefore(currentDateTime, endDateTime)) {
      return 'Ongoing';
    } else {
      return 'Expired';
    }
  };

  const [showServices, setShowServices] = useState(false)

  // removed log
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Sale Event</span>
        </div>
        <div className='w-[95%] h-[702px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>Flash Sale Events</h1>
            <Button style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}><FaPlus /> Add Event</Button>
          </div>
          <div className='text-[#00143c] flex gap-4'>
            <div className='w-[90%] h-10 bg-[#f4f6fa] rounded-md text-[#99a1b1] flex gap-2 items-center pl-2'>
              <span className='text-xl'><CiSearch /></span>
              <input className='bg-transparent outline-none text-[#00143c]' placeholder='Search for flash sale ...'/>
            </div>
            <Button style={'w-[10%] bg-[#dee1e6] rounded-md text-[#00143c] flex gap-1 items-center justify-center font-semibold'}>
              <span className='font-bold text-xl'><RxMixerVertical /></span>
              <span>Filters</span>
            </Button>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] py-1'>
              <span className='w-[20%]'>Flash Sale Events</span>
              <span className='w-[20%]'>Discount Type</span>
              <span className='w-[20%]'>Usage Limit</span>
              <span className='w-[20%]'>Services</span>
              <span className='w-[20%]'>Valid</span>
            </div>
            <div>
              {flashsales?.map((el, index) => (
                <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1 h-[40px]'>
                  <span className='w-[20%] px-2 py-2 text-[#00143c]'>{el?.name}</span>
                  <span className='w-[20%] px-2 py-2 text-[#00143c] capitalize'>{el?.discount_type}</span>
                  <span className='w-[20%] px-2 py-2 text-[#00143c]'>{el?.usageLimit}</span>
                  <span className='w-[20%] px-2 text-[#00143c]'>
                    <div className='flex relative cursor-pointer h-full items-center'
                        onMouseEnter = {e => {
                          e.stopPropagation();
                          setShowServices(el._id)
                        }}
                        onMouseLeave = {e => {
                          e.stopPropagation();
                          setShowServices(null)
                        }}>
                      {el.services.map((service, index) => {
                        if(+index <= 1){
                          return <img className={`w-[34px] h-[34px] border-[3px] border-white rounded-full ml-[-10px] mr-[0px] z-[${el?.services?.length - index}]`} src={service?.thumb}/>
                        }
                        else if(index === 2){
                          return <span className='w-[34px] h-[34px] bg-[rgba(230,239,254,1)] rounded-full ml-[-10px] mr-[0px] text-[#005aee] font-medium border-[3px] border-white text-sm flex items-center justify-center'>{`+ ${el?.services?.length - 2}`}</span>
                        }
                      })}

                      { showServices === el._id &&
                        <div className='flex flex-col gap-1 bg-[#00143c] text-white rounded-md w-[200px] p-[12px] absolute top-10 left-[-50px] z-50'>
                        {el.services.map((service, index) => (
                        <div key={index} className='flex justify-start items-center w-full'>
                          <img key={index} src={service?.thumb}  className={'w-[24px] h-[24px] mr-[10px] rounded-full'}></img>
                          <span className='px-0 text-sm font-medium'>{`${service?.name}`}</span>
                        </div>))}
                        </div>
                      }
                    </div>
                  </span>
                  <span  className={`w-[20%] px-2 py-2 ${
                      checkFlashSaleStatus(el?.promotionApplicationDate, el?.startTime, el?.duration) === 'Expired'
                      ? 'text-red-500'
                      : checkFlashSaleStatus(el?.promotionApplicationDate, el?.startTime, el?.duration) === 'Ongoing'
                      ? 'text-green-500'
                      : 'text-[#00143c]'
                  }`}>
                    {checkFlashSaleStatus(el?.promotionApplicationDate, el?.startTime, el?.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageSaleEvent;