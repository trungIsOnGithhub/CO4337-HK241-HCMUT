import { apiGetAllCouponsByAdmin } from 'apis'
import { Button } from 'components'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaPlus } from "react-icons/fa6";
import bgImage from '../../assets/clouds.svg'
import { RxMixerVertical } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isBefore, isAfter, addMinutes } from 'date-fns';

const ManageVoucher = () => {
  const [coupons, setCoupons] = useState([])
  useEffect(() => {
    const fetchAllCouponsByAdmin = async () => {
      const response = await apiGetAllCouponsByAdmin()
      console.log(response)
      if(response?.success){
        setCoupons(response?.coupons)
      }
    }
    fetchAllCouponsByAdmin()
  }, []);
  


  const [showServices, setShowServices] = useState(false)

  const checkCouponStatus = (expirationDate) => {
    const { date, time } = expirationDate;
    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');
    const expirationDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
  
    if (isBefore(now, expirationDateTime)) {
      return { status: 'Valid', expiration: `${date} ${time}` };
    } else {
      return { status: 'Expired', expiration: `${date} ${time}` };
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Voucher</span>
        </div>
        <div className='w-[95%] h-[702px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>Vouchers</h1>
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
              <span className='w-[20%]'>Vouchers</span>
              <span className='w-[20%]'>Discount Type</span>
              <span className='w-[10%]'>Usage</span>
              <span className='w-[10%]'>Per User</span>
              <span className='w-[20%]'>Services</span>
              <span className='w-[20%]'>Valid</span>
            </div>
            <div>
              {coupons?.map(el => {
                const {status, expiration} = checkCouponStatus(el?.expirationDate)
              return (
                <div className='w-full flex border-b border-[#f4f6fa] gap-1 h-[40px]'>
                  <span className='w-[20%] px-2 py-2 text-[#00143c] line-clamp-1'>{el?.name}</span>
                  <span className='w-[20%] px-2 py-2 text-[#00143c] capitalize'>{el?.discount_type}</span>
                  <span className='w-[10%] px-2 py-2 text-[#00143c]'>{el?.noUsageLimit ? 'No Limit' : el?.usageLimit}</span>
                  <span className='w-[10%] px-2 py-2 text-[#00143c]'>{el?.noLimitPerUser ? 'No Limit' : el?.limitPerUser}</span>
                  <span className='w-[20%] px-2 text-[#00143c]'>
                    <div className='flex h-full relative cursor-pointer items-center'
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
                  <span className='w-[20%] px-2 py-2 flex items-center gap-1'>
                    {status === 'Expired' ? (
                      <span className="text-red-500">Expired</span>
                    ) : (
                      <span className="text-green-500">Valid</span>
                    )}
                    {status === 'Valid' && <small className=''>{expiration}</small>}
                  </span>
                </div>
              )
              }
              
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageVoucher;