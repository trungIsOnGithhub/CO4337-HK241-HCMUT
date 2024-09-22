import { apiGetCouponsByServiceId, apiGetOneService, apiGetServiceProviderById } from 'apis';
import clsx from 'clsx';
import Button from 'components/Buttons/Button';
import React, { useEffect, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice, formatPricee } from 'ultils/helper';
import path from 'ultils/path';
import { apiUpdateCartService } from 'apis';
import withBaseComponent from 'hocs/withBaseComponent';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrent } from 'store/user/asyncAction';

const Booking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [staffs, setStaffs] = useState(null);
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [duration, setDuration] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({
    time: null,
    date: null,
    staff: null
  });
  const [timeOptions, setTimeOptions] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountValue, setDiscountValue] = useState(-1);
  const [originalPrice, setOriginalPrice] = useState(0);

  const currentUser = useSelector(state => state.user.current);

  useEffect(() => {
    dispatch(getCurrent());
  }, [dispatch]);

  const fetchServiceData = async () => {
    const response = await apiGetOneService(params?.get('sid'));
    if (response?.success) {
      setService(response?.service);
      setDuration(response?.service?.duration);
      const coupons = await apiGetCouponsByServiceId(response?.service?._id);
      if(coupons?.success){
        setDiscountCodes(coupons?.coupons);
      }
    }
  };

  useEffect(() => {
    setOriginalPrice(service?.price)
  }, [service])
  
  const fetchProviderData = async () => {
    if (service?.provider_id) {
      const response = await apiGetServiceProviderById(service?.provider_id?._id);
      if (response?.success) {
        setProvider(response?.payload);
      }
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [params]);

  useEffect(() => {
    setStaffs(service?.assigned_staff);
    fetchProviderData();
  }, [service]);

  useEffect(() => {
    const fetchData = () => {
      if (provider) {
        const getCurrentTime = () => {
          const now = new Date();
          const hour = now.getHours();
          const minute = now.getMinutes();
          return hour * 100 + minute;
        };
  
        const getOpeningHoursForToday = () => {
          const dayOfWeek = new Date().getDay();
          const openingTimeKey = `start${dayOfWeek === 0 ? 'sunday' : dayOfWeek === 1 ? 'monday' : dayOfWeek === 2 ? 'tuesday' : dayOfWeek === 3 ? 'wednesday' : dayOfWeek === 4 ? 'thursday' : dayOfWeek === 5 ? 'friday' : 'saturday'}`;
          const closingTimeKey = `end${dayOfWeek === 0 ? 'sunday' : dayOfWeek === 1 ? 'monday' : dayOfWeek === 2 ? 'tuesday' : dayOfWeek === 3 ? 'wednesday' : dayOfWeek === 4 ? 'thursday' : dayOfWeek === 5 ? 'friday' : 'saturday'}`;
          
          const parseTime = (timeString) => {
            const [hour, minute] = timeString.split(':').map(Number);
            return hour * 60 + minute;
          };
        
          const openingTime = parseTime(provider?.time[openingTimeKey]);
          const closingTime = parseTime(provider?.time[closingTimeKey]);
          return { openingTime, closingTime };
        };
  
        const currentTime = getCurrentTime();
        const { openingTime, closingTime } = getOpeningHoursForToday();
  
        const generateTimeOptions = (openingTime, closingTime, currentTime, duration) => {
          const timeOptions = [];
          if (openingTime && closingTime && duration) {
            let currentHour = Math.floor(currentTime / 100);
            let currentMinute = currentTime % 100;
            let currentTimeInMinutes = currentHour * 60 + currentMinute;
            let serviceDurationInMinutes = duration;
            let saveOpeningTime = openingTime;

            setCurrentTime(currentTimeInMinutes);
            setTimeOptions([]);

            while (saveOpeningTime <= (closingTime - serviceDurationInMinutes)) {
              if (saveOpeningTime >= currentTimeInMinutes) {
                const hour = Math.floor(saveOpeningTime / 60);
                const minute = saveOpeningTime % 60;
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                const formattedTime = `${formattedHour}:${formattedMinute}`;
                timeOptions.push(formattedTime);
                saveOpeningTime += serviceDurationInMinutes;
              } else {
                saveOpeningTime += serviceDurationInMinutes;
              }
            }
          }

          return timeOptions;
        };
  
        setTimeOptions(generateTimeOptions(openingTime, closingTime, currentTime, duration));
      }
    }

    fetchData(); 

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [provider, duration]);

  const handleBookDateTime = (el) => { 
    navigate({
      pathname:  `/${path.BOOKING_DATE_TIME}`,
      search: createSearchParams({sid: service?._id, st: el?._id}).toString()
    })
  }

  const parseTimee = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  
  const handleOnClick = async(time, el) => {
    setSelectedStaff({time, staff:el, date:new Date().toLocaleDateString()});
    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: el?._id, 
      time: time,
      duration: service?.duration,
      date: new Date().toLocaleDateString(),
      price: +discountValue > 0 ? +discountValue : +originalPrice
    })
  }

  const handleCheckout = async() => {
    const finalPrice = +discountValue > 0 ? +discountValue : +originalPrice;
    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: selectedStaff?.staff?._id, 
      time: selectedStaff?.time,
      duration: service?.duration,
      date: new Date().toLocaleDateString(),
      price: finalPrice
    })
    if(selectedDiscount){
      window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedDiscount}`, '_blank');
    }
    else {
      window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}`, '_blank');
    }
  }

  const isWorkingTime = (time, workSchedule) => {
    const currentDate = new Date(); 
    for (const schedule of workSchedule) {
      const scheduleDateParts = schedule.date.split('/');
      const scheduleDate = new Date(parseInt(scheduleDateParts[2]), parseInt(scheduleDateParts[1]) - 1, parseInt(scheduleDateParts[0]));
  
      if (scheduleDate.getDate() === currentDate.getDate() &&
          scheduleDate.getMonth() === currentDate.getMonth() &&
          scheduleDate.getFullYear() === currentDate.getFullYear()) {
        const startTime = parseTimee(schedule.time);
        const endTime = startTime + schedule.duration;
        const selectedTime = parseTimee(time);
        if (selectedTime >= startTime && selectedTime < endTime) {
          return true;
        }
      }
    }
    return false;
  };

  const handleDiscountChange = (event) => {
    setSelectedDiscount(event.target.value);
  };

  useEffect(() => {
    const coupon = discountCodes?.find(el => el?.code === selectedDiscount)
    if(coupon?.discount_type === 'percentage'){
      const percent = coupon?.percentageDiscount?.find(e => e.id===service?._id)?.value
      const discountPrice = Math.round(service?.price * (100-percent)/100)
      discountPrice === originalPrice ? setDiscountValue(-1) : setDiscountValue(discountPrice)
    }
    if(coupon?.discount_type === 'fixed'){
      const fixed = coupon?.fixedAmount?.find(e => e.id===service?._id)?.value
      const discountPrice = Math.round(service?.price - fixed)
      discountPrice === originalPrice ? setDiscountValue(-1) : setDiscountValue(discountPrice)
    }
  }, [selectedDiscount]);

  const canUseDiscount = (coupon) => {
    if (!currentUser) return false;
    
    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === currentUser._id);
    
    return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
  };

  const usableDiscountCodes = discountCodes.filter(canUseDiscount);

  return (
    <div className='w-main'>
      <div className='w-main flex gap-2 h-fit my-5'>
        <div className='border border-gray-400 flex-7 flex-col pl-3 pr-3 rounded-md'>
          <div className='mb-4 pt-2'><span className='font-semibold text-3xl'>Choose Staff</span></div>
          {staffs?.map((el, index) => (
            <div key={index} className='border border-gray-300 px-2 py-2 rounded-md my-2'>
              <div className='flex justify-between'>
                <div className='flex items-center gap-1'>
                  <img src={el?.avatar} className='w-16 h-16 rounded-full' alt={el?.firstName} />
                  <span>{`${el.lastName} ${el.firstName}`}</span>
                </div>
                <Button style='px-6 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit' handleOnclick={()=>handleBookDateTime(el)}>Choose</Button>
              </div>
              <div className='flex gap-1 items-center'>
                <span>Available</span>
                <div className='w-fit h-fit bg-green-500 px-1 rounded-md text-white'>Today</div>
              </div>
              <div className='flex flex-wrap gap-2 my-3'>
              {timeOptions.length <= 0 ?
                  <h5 className='text-red-500'>Service is not available today</h5>
                  :
                timeOptions.map((time, idx) => (
                (!el.work || !isWorkingTime(time, el.work)) && (
                  <div className={clsx('px-3 py-1 border border-gray-400 rounded-md hover:bg-blue-400 cursor-pointer', (selectedStaff.time===time && selectedStaff.staff===el) && 'bg-blue-400')} key={idx} onClick={() =>{handleOnClick(time,el)}}>
                    {parseInt(time.split(':')[0]) >= 12 ? `${time} pm` : `${time} am`}
                  </div>
                )
              ))}
              </div>
            </div>
          ))}
        </div>
        <div className='flex-3 flex-col'>
          <div className='border border-gray-400 h-fit pb-5 rounded-md'>
            <div className='mb-4 border-b-2 border-gray-200 px-3 pb-4 flex justify-center'><span className='font-semibold text-3xl pt-2'>Booking Details</span></div>
            <div className='px-3 flex flex-col gap-2'>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Service Name:</span>
                <span className='font-semibold text-gray-600'>{service?.name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Duration:</span>
                <span className='font-semibold text-gray-600'>{`${service?.duration} minutes`}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Provider Name:</span>
                <span className='font-semibold text-gray-600'>{provider?.bussinessName}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Address:</span>
                <span className='font-semibold text-gray-600'>{provider?.address}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Staff:</span>
                <span className='font-semibold text-yellow-600'>{(selectedStaff?.staff && parseTimee(selectedStaff?.time) >= currentTime) ? `${selectedStaff?.staff?.lastName} ${selectedStaff?.staff?.firstName}` : ''}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Date & Time:</span>
                <span className='font-semibold text-green-600'>{(selectedStaff?.time && parseTimee(selectedStaff?.time) >= currentTime) ? `${selectedStaff?.time} ${selectedStaff?.date}` : ''}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Total Price:</span>
                <span className={clsx('font-semibold text-main', discountValue > 0 && 'line-through')}>
                  {`${formatPrice(formatPricee(originalPrice))} VNĐ`}
                </span>
                {discountValue > 0 && <span className='font-semibold text-green-500'>{` ${formatPrice(formatPricee(discountValue))} VNĐ`}</span>}
              </div>
              <div className='flex flex-col gap-2 cursor-pointer mt-4 border-t-2 mx-[-12px] px-3'>
                <span className='text-gray-700 font-bold'>Discount Code:</span>
                <select 
                  value={selectedDiscount || ''} 
                  onChange={handleDiscountChange} 
                  className='border border-gray-400 rounded-md px-2 py-1 cursor-pointer outline-none'
                >
                  <option value=''>Select Discount</option>
                  {usableDiscountCodes.map((code, idx) => (
                    <option key={idx} value={code?.code}>
                      {code?.name} 
                      {code?.discount_type === 'fixed' 
                        ? `( ↓ ${code?.fixedAmount?.find(e => e.id===service?._id)?.value} VNĐ )` 
                        : `( ↓ ${code?.percentageDiscount?.find(e => e.id===service?._id)?.value} % )`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
               {/* Mã giảm giá */}
            </div>
          </div>
          <div className='text-right'>
            {(selectedStaff?.staff && parseTimee(selectedStaff?.time) >= currentTime) && <Button style='px-6 py-1 rounded-md text-white bg-green-600 font-semibold w-fit h-fit mt-2' handleOnclick={handleCheckout}>Checkout</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;