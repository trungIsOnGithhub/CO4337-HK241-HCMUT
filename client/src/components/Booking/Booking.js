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
import { CiSearch } from 'react-icons/ci';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import moment from 'moment';

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
  const [discountValue, setDiscountValue] = useState(-1);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [showVoucher, setShowVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  useEffect(() => {
    const coupon = usableDiscountCodes?.find(el => el?.code === selectedVoucher?.code)
    if(coupon?.discount_type === 'percentage'){
      const percent = coupon?.percentageDiscount?.find(e => e.id === service?._id)?.value
      const discountPrice = Math.round(service?.price * (100-percent)/100)
      discountPrice === service?.price ? setDiscountValue(-1) : setDiscountValue(discountPrice)
    }
    if(coupon?.discount_type === 'fixed'){
      const fixed = coupon?.fixedAmount?.find(e => e.id === service?._id)?.value
      const discountPrice = Math.round(service?.price - fixed)
      discountPrice === service?.price ? setDiscountValue(-1) : setDiscountValue(discountPrice)
    }
  }, [selectedVoucher]);

  const currentUser = useSelector(state => state.user.current);

  const daysOfWeek = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];

  const handleSelectedVoucher = (voucher) => {
    setSelectedVoucher(voucher)
  }

  const getNextAvailableDayInShift = (shifts) => {
    if (!shifts)
      return [];
    const nowDate = new Date();
    const nowhhMM = nowDate.getHours() + ":" + nowDate.getMinutes();
    const currentWeekDayIndex = nowDate.getDay();
    
    for (let i=0;i<7;++i) {
      const realIndex = (currentWeekDayIndex + i) % 7;

      if (shifts[daysOfWeek[realIndex]]?.length) {
        const filterSuitableTimeSlot = shifts[daysOfWeek[realIndex]].filter(ts => {
          return ts?.start && (nowhhMM.localeCompare(ts?.start) < 0 || realIndex != currentWeekDayIndex);
        });

        if (filterSuitableTimeSlot?.length) {
          return [daysOfWeek[realIndex], filterSuitableTimeSlot];
        }
      }
    }

    return [];
  };

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
    const tempStaffs = service?.assigned_staff?.map(staff => {
      staff.nextAvailableDay = getNextAvailableDayInShift(staff?.shifts);
      return staff;
    })

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
          if (openingTime>=0 && closingTime>=0 && duration>=0) {
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

    const date = moment(new Date()).format("DD/MM/YYYY");
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    // // Kết hợp formattedDate và time để tạo datetime
    const dateTime = new Date(`${formattedDate}T${time}:00Z`);

    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: el?._id, 
      time: time,
      duration: service?.duration,
      date: new Date().toLocaleDateString(),
      originalPrice: originalPrice,
      discountPrice: +discountValue > 0 ? +discountValue : 0,
      dateTime,
      coupon: selectedVoucher?._id
    })
  }

  const handleCheckout = async() => {
    const finalPrice = +discountValue > 0 ? +discountValue : +originalPrice;
    const date = moment(new Date()).format("DD/MM/YYYY");
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
      // // Kết hợp formattedDate và time để tạo datetime
    const dateTime = new Date(`${formattedDate}T${selectedStaff?.time}:00Z`);

    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: selectedStaff?.staff?._id, 
      time: selectedStaff?.time,
      duration: service?.duration,
      date: new Date().toLocaleDateString(),
      originalPrice: originalPrice,
      discountPrice: +discountValue > 0 ? +discountValue : 0,
      dateTime: dateTime,
      coupon: selectedVoucher?._id
    })
    if(selectedVoucher){
      window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedVoucher?.code}`, '_blank');
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

  const canUseDiscount = (coupon) => {
    if (!currentUser) return false;
    
    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === currentUser._id);
    
    return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
  };

  const usableDiscountCodes = discountCodes.filter(canUseDiscount);
  return (
    <div className='w-main'>
      <div className='w-main flex gap-2 h-fit my-5'>
        <div className='border border-gray-400 flex-7 flex-col p-[24px] rounded-md'>
        <div className='flex w-full justify-between items-center'>
          <span className='text-[18px] leading-6 font-semibold'>Choose Employee</span>
          <div className='w-[187px] h-[40px] flex gap-1 items-center border border-[#0a66c2] rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px]'>
            <span className='text-xl'><CiSearch size={20}/></span>
            <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[#00143c] placeholder:text-[#00143c]' placeholder='Search employee'/>
          </div>
        </div>

        <div>
        {service?.assigned_staff?.map((el, index) => (
          <div key={index} className='border border-gray-300 px-2 py-2 rounded-md my-2'>
            <div className='flex justify-between'>
              <div className='flex items-center gap-1'>
                <img src={el?.avatar} className='w-16 h-16 rounded-full' alt={el?.firstName} />
                <span>{`${el.lastName} ${el.firstName}`}</span>
              </div>
              <Button style='px-6 rounded-md text-white bg-[#0a66c2] font-semibold h-fit py-2 w-fit' handleOnclick={()=>handleBookDateTime(el)}>Choose</Button>
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-xs leading-4'>Available</span>
              <div className=' text-xs leading-4 font-medium w-fit h-fit bg-[#0a66c2] px-[2px] py-[1px] rounded-md text-white'>Today</div>
            </div>
            <div className='flex flex-wrap gap-2 my-3 justify-center'>
              {timeOptions.length <= 0 ?
                  <h5 className='text-[#0a66c2] italic font-semibold'>Service is not available today</h5>
                  :
                timeOptions.map((time, idx) => (
                (!el.work || !isWorkingTime(time, el.work)) && (
                  <div className={clsx('w-[15%] h-[46px] border border-[#0a66c2] rounded-md cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-400 hover:border-none', (selectedStaff.time===time && selectedStaff.staff===el) && 'bg-blue-400 border-none')} key={idx} onClick={() =>{handleOnClick(time,el)}}>
                    <span className='text-[14px] leading-5 font-medium'>{time}</span>
                    <span className='text-[12px] leading-4 text-[#00143c]'>{parseInt(time.split(':')[0]) >= 12 ? 'pm' : 'am'}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        </div>
        </div>
        <div className='flex-3 flex-col'>
          <div className='border border-gray-400 h-fit pb-5 rounded-md'>
            <div className='mb-4 border-b-2 border-gray-200 px-3 pb-4 flex justify-center'><span className='font-semibold text-3xl pt-2'>Booking Details</span></div>
            <div className='px-3 flex flex-col gap-2'>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Service Name:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{service?.name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Duration:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{`${service?.duration} minutes`}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Provider Name:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{provider?.bussinessName}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Address:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{provider?.address}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Staff:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{(selectedStaff?.staff && parseTimee(selectedStaff?.time) >= currentTime) ? `${selectedStaff?.staff?.lastName} ${selectedStaff?.staff?.firstName}` : ''}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Date & Time:</span>
                <span className='text-[#00143c] flex-1 line-clamp-1'>{(selectedStaff?.time && parseTimee(selectedStaff?.time) >= currentTime) ? `${selectedStaff?.time} ${selectedStaff?.date}` : ''}</span>
              </div>
              <div className='flex gap-2'>
                <span className='text-gray-700 font-bold'>Total Price:</span>
                <div className='flex gap-2 items-center'>
                  <span className={clsx('text-[#0a66c2] font-semibold', discountValue > 0 && 'font-medium line-through')}>{`${formatPrice(service?.price)} VNĐ`}</span>
                  {discountValue > 0 && <span className='leading-7 text-[#0a66c2] font-semibold'>{`${formatPrice(discountValue)} VNĐ`}</span>}
                </div>
              </div>
            </div>
            <div className='w-full flex justify-between items-center border-t-2 p-[12px] rounded-md'>
              <span className='text-gray-700 font-bold'>Choose a voucher</span>
              <span onClick={()=>{setShowVoucher(prev=>!prev)}} className='cursor-pointer p-2 border border-[#868e96] rounded-full'>{!showVoucher ? <FaAngleDown /> : <FaAngleUp />}</span>
            </div>
            {showVoucher && 
              (
                usableDiscountCodes?.length > 0 
                ? 
                <div className='flex flex-col gap-1 w-full p-[6px] h-fit max-h-[180px] overflow-y-scroll scrollbar-thin'>
                  {usableDiscountCodes?.map((el, index) => (
                    <div onClick={()=>handleSelectedVoucher(el)} key={index} className={clsx('w-full flex items-center cursor-pointer', el?._id === selectedVoucher?._id ? 'bg-blue-400' : 'hover:bg-blue-100')}>
                      <div className='w-[20%]'>
                        <img src={el?.image} className='w-[80px] h-[60px] object-cover rounded-sm'/>
                      </div>
                      <div className='w-[80%] pl-[12px] flex flex-col justify-between text-black'>
                        <span className='text-lg line-clamp-1'>{el?.name}</span>
                        <div className='flex gap-4 items-center justify-between'>
                          <span className='text-[#0a66c2] text-sm font-medium line-clamp-1'>{el?.code}</span>
                          <div className='px-[6px] py-[1px] bg-[#0a66c2] rounded-md'>
                            {
                            el?.discount_type === 'fixed' 
                            ? `-${el?.fixedAmount?.find(e => e.id === service?._id)?.value}VNĐ` 
                            : `-${el?.percentageDiscount?.find(e => e.id === service?._id)?.value}%`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                :
                <div className='w-full p-[12px]'>
                  <span>No voucher available</span>
                </div>
              )
            }
          </div>
          <div className='text-right'>
            {(selectedStaff?.staff && parseTimee(selectedStaff?.time) >= currentTime) && <Button style='px-6 py-1 rounded-md text-white bg-[#0a66c2] font-semibold w-fit h-fit mt-2' handleOnclick={handleCheckout}>Checkout</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;