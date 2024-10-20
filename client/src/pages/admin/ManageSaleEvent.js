import { apiGetAllFlashSaleByAdmin } from 'apis'
import { Button } from 'components'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaPlus } from "react-icons/fa6";
import bgImage from '../../assets/clouds.svg'
import { RxMixerVertical } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";

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
  
  console.log(flashsales)


  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Sale Event</span>
        </div>
        <div className='w-[95%] h-[702px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-4 py-2 flex flex-col gap-4'>
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
              <span className='w-[20%]'>Flash Sale</span>
              <span className='w-[20%]'>Discount Type</span>
              <span className='w-[20%]'>Usage Limit</span>
              <span className='w-[20%]'>Services</span>
              <span className='w-[20%]'>Valid</span>
            </div>
            <div>body</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageSaleEvent;