import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, endOfMonth, startOfMonth, addMonths, subMonths  } from 'date-fns'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import { apiGetCouponsByServiceId, apiGetOneService, apiGetOneStaff, apiGetServiceProviderById, apiUpdateCartService } from 'apis'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { formatPrice, formatPricee } from 'ultils/helper'
import Button from 'components/Buttons/Button'
import path from 'ultils/path'
import moment from 'moment'
import { GrPrevious } from 'react-icons/gr'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import { useSelector } from 'react-redux'

const BookingDateTIme = () => {
  const [type, setType] = useState('Week')

  const [selectedTime, setSelectedTime] = useState(null)
  const [params] = useSearchParams();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [staff, setStaff] = useState(null)
  const [duration, setDuration] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [discountValue, setDiscountValue] = useState(-1);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [showVoucher, setShowVoucher] = useState(false);
  const currentUser = useSelector(state => state.user.current);
  const [discountCodes, setDiscountCodes] = useState([]);

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

  const handleSelectedVoucher = (voucher) => {
    setSelectedVoucher(voucher)
  }

  const canUseDiscount = (coupon) => {
    if (!currentUser) return false;
    
    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === currentUser._id);
    
    return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
  };

  const usableDiscountCodes = discountCodes.filter(canUseDiscount);

  const [datetime, setDatetime] = useState()

  const [displayTime, setDisplayTime] = useState(new Date())
  const navigate = useNavigate();

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

  const fetchStaffData = async () => {
    const response = await apiGetOneStaff(params?.get('st'));
    setStaff(response?.staff)
  };

  const fetchProviderData = async () => {
    const response = await apiGetServiceProviderById(service?.provider_id?._id);
    if (response?.success) {
      setProvider(response?.payload);
    }
  };

  useEffect(() => {
    fetchServiceData();
    fetchStaffData();
  }, [params]);

  useEffect(() => {
    fetchProviderData();
  }, [service]);

  useEffect(() => {
    const fetchData = () => {
      if (provider) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
        const day = String(currentDate.getDate()).padStart(2, '0'); // Thêm số 0 vào trước nếu cần

        const formattedDate = `${year}-${month}-${day}`;
        if(datetime === formattedDate){
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
              let saveOpeningTime = openingTime
  
              setTimeOptions([])
  
              while (saveOpeningTime <= (closingTime - serviceDurationInMinutes)) {
                if(saveOpeningTime >= currentTimeInMinutes){
                  const hour = Math.floor(saveOpeningTime / 60);
                  const minute = saveOpeningTime % 60;
                  const formattedHour = hour.toString().padStart(2, '0');
                  const formattedMinute = minute.toString().padStart(2, '0');
                  const formattedTime = `${formattedHour}:${formattedMinute}`;
                  timeOptions.push(formattedTime);
                  saveOpeningTime += serviceDurationInMinutes;
                }
                else saveOpeningTime += serviceDurationInMinutes;
              }
            }
            return timeOptions;
          };
    
          setTimeOptions(generateTimeOptions(openingTime, closingTime, currentTime, duration));
        }
        else{
          const getOpeningHoursForToday = () => {
            const dateObject = new Date(datetime);
            const dayOfWeek = dateObject.getDay();
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
          const { openingTime, closingTime } = getOpeningHoursForToday();
    
          const generateTimeOptions = (openingTime, closingTime, duration) => {
            const timeOptions = [];
            if (openingTime>=0 && closingTime>=0 && duration>=0) {
              let serviceDurationInMinutes = duration;
              let saveOpeningTime = openingTime
              setTimeOptions([])
  
              while (saveOpeningTime <= (closingTime - serviceDurationInMinutes)) {
                  const hour = Math.floor(saveOpeningTime / 60);
                  const minute = saveOpeningTime % 60;
                  const formattedHour = hour.toString().padStart(2, '0');
                  const formattedMinute = minute.toString().padStart(2, '0');
                  const formattedTime = `${formattedHour}:${formattedMinute}`;
                  timeOptions.push(formattedTime);
                  saveOpeningTime += serviceDurationInMinutes;
              }
            }
            return timeOptions;
          };
    
          setTimeOptions(generateTimeOptions(openingTime, closingTime, duration));
        }
      }
    }

    fetchData(); 

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [datetime]);


  const currentWeek = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(displayTime, index);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayOfWeek: format(date, 'EEEE'), // Lấy ngày trong tuần
    }
  });

  const currentMonth = Array.from(
    { length: endOfMonth(displayTime).getDate() },
    (_, index) => {
      const date = new Date(displayTime.getFullYear(), displayTime.getMonth(), index + 1);
      return {
        date: format(date, 'yyyy-MM-dd'),
        dayOfMonth: format(date, 'EEEE'), // Lấy ngày trong tuần
      };
    }
  );

  const formattedDateRange = type === 'Week' ? `${format(currentWeek[0].date, 'MMMM dd, yyyy')} - ${format(currentWeek[currentWeek.length - 1].date, 'MMMM dd, yyyy')}` : `${format(displayTime, 'MMMM yyyy')}`;

  const isBackButtonDisabled = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const firstDayOfCurrentWeek = currentWeek[0].date;
    return firstDayOfCurrentWeek <= formattedDate;
  };

  const handlePrevNext = (direction) => {
    if (direction === 'prev') {
      if (type === 'Week') {
        setDisplayTime(subDays(displayTime, 7)); // Giảm 7 ngày từ ngày hiện tại
      } else if (type === 'Month') {
        const firstDayOfPrevMonth = startOfMonth(subMonths(displayTime, 1));
        if (firstDayOfPrevMonth < new Date()) {
          setDisplayTime(new Date()); // Nếu ngày đầu tiên của tháng liền trước bé hơn ngày hiện tại thì lấy ngày hiện tại
        } else {
          setDisplayTime(firstDayOfPrevMonth); // Lấy ngày đầu tiên của tháng liền trước
        }
      }
    } else if (direction === 'next') {
      if (type === 'Week') {
        setDisplayTime(addDays(displayTime, 7)); // Tăng 7 ngày từ ngày hiện tại
      } else if (type === 'Month') {
        setDisplayTime(startOfMonth(addMonths(displayTime, 1))); // Lấy ngày đầu tiên của tháng liền sau
      }
    }
  };

  const handleOnClick = async (time) => {
    setSelectedTime(time);

    // Lấy date và chuyển đổi thành định dạng "yyyy-mm-dd"
    const date = moment(new Date(datetime)).format("DD/MM/YYYY");
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    // Kết hợp formattedDate và time để tạo datetime
    const dateTime = new Date(`${formattedDate}T${time}:00Z`);

    await apiUpdateCartService({
        service: service?._id,
        provider: provider?._id,
        staff: staff?._id,
        duration: service?.duration,
        time: time,
        date: date,
        dateTime: dateTime, // datetime chứa cả date và time
        originalPrice: originalPrice,
        discountPrice: +discountValue > 0 ? +discountValue : 0,
        coupon: selectedVoucher?._id
    });
}

  const parseTimee = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return hour * 60 + minute;
  };

  const handleCheckout = async() => {
    const finalPrice = +discountValue > 0 ? +discountValue : +originalPrice;

    const date = moment(new Date(datetime)).format("DD/MM/YYYY");
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const dateTime = new Date(`${formattedDate}T${selectedTime}:00Z`);

    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: staff?._id, 
      time: selectedTime, 
      duration: service?.duration,
      date: date,
      dateTime: dateTime,
      originalPrice: originalPrice,
      discountPrice: +discountValue > 0 ? +discountValue : 0,
      coupon: selectedVoucher?._id
    })
    if(selectedVoucher){
      window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedVoucher?.code}`, '_blank');
    }
    else {
      window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}`, '_blank');
    }
  }

  const beforeCheckout = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
    const day = String(currentDate.getDate()).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
    const formattedDate = `${year}-${month}-${day}`;
    if(datetime === formattedDate){
      if(parseTimee(selectedTime) >= getCurrentTime()){
        return true
      }
      else return false
    }
    else return true
  }

  const isWorkingTime = (time, workSchedule) => {
    const selectedDate = new Date(datetime); // Chuyển đổi datetime thành đối tượng Date
  
    for (const schedule of workSchedule) {
      // Chuyển đổi chuỗi ngày trong lịch làm việc thành đối tượng Date
      const scheduleDateParts = schedule.date.split('/');
      const scheduleDate = new Date(
        parseInt(scheduleDateParts[2]),
        parseInt(scheduleDateParts[1]) - 1,
        parseInt(scheduleDateParts[0])
      );
  
      // Kiểm tra xem ngày trong lịch làm việc có trùng với ngày được chọn không
      if (
        scheduleDate.getDate() === selectedDate.getDate() &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getFullYear() === selectedDate.getFullYear()
      ) {
        const startTime = parseTimee(schedule.time);
        const endTime = startTime + schedule.duration;
        const selectedTime = parseTimee(time);
  
        if (selectedTime >= startTime && selectedTime < endTime) {
          return true; // Thời gian đã có lịch làm việc
        }
      }
    }
  
    return false; // Thời gian không có lịch làm việc hoặc không trùng ngày được chọn
  };
  const handleNavigatePrev = () => {
    navigate({
      pathname:  `/${path.BOOKING}`,
      search: createSearchParams({sid: service?._id}).toString()
    })
  }
  console.log(discountValue)
  return (
    <div className='w-main'>
      <div className='w-main flex gap-2 h-fit my-5'>
        <div className='border border-gray-400 flex-7 flex flex-col gap-4 p-[24px] rounded-md'>
          <div className='flex gap-2 items-center'>
            <div onClick={handleNavigatePrev} className='w-[40px] h-[40px] rounded-md flex items-center justify-center border border-[#868e96] cursor-pointer'><GrPrevious size={20}/></div>
            <span className='text-[18px] leading-6 font-semibold'>Choose Date & Time</span>
          </div>
          <div className='flex justify-between'>
            <div className='flex'>
            <div className={clsx('px-[15px] py-[10px] rounded-l-md cursor-pointer text-[14px] font-medium flex items-center justify-center', type === 'Week' ? 'bg-[#0a66c2] text-white' : 'bg-blue-200')} onClick={()=>{setType('Week'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Week</div>
            <div className={clsx('px-[15px] py-[10px] rounded-r-md cursor-pointer text-[14px] font-medium flex items-center justify-center', type === 'Month' ? 'bg-[#0a66c2] text-white' : 'bg-blue-200')} onClick={()=>{setType('Month'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Month</div>
            </div>
            <div className='flex gap-1'>
              <div className={clsx('border rounded-md flex items-center justify-center px-1 py-1',isBackButtonDisabled() ? 'cursor-not-allowed border-gray-200' : 'border-gray-400  cursor-pointer' )} onClick={() => handlePrevNext('prev')}><IoIosArrowBack size={30} color='gray'/></div>
              <div className='border border-gray-400 rounded-md flex items-center justify-center px-1 py-1 cursor-pointer' onClick={() => handlePrevNext('next')}><IoIosArrowForward size={30} color='gray' /></div>
            </div>
          </div>
          <div className='flex flex-col gap-2 items-center mb-5'>
            <div className='font-semibold mb-2'>{formattedDateRange}</div>
            <div className='w-full flex flex-wrap gap-4 justify-center'>
            {type === 'Week' ? 
            (
              currentWeek?.map(({ date, dayOfWeek }) => (
                <div key={date} className='w-[12%] flex flex-col items-center gap-2'>
                  <div className='font-semibold text-xs'>{dayOfWeek.slice(0, 3)}</div>
                  <div className={clsx('w-full h-[72px] flex items-center justify-center border border-[#0a66c2] rounded-md hover:bg-blue-400  cursor-pointer', date === datetime && 'bg-blue-400 border-[rgba(22,157,215,1)]')} onClick={()=>{setDatetime(date); setSelectedTime()}}>{format(new Date(date), 'dd')}</div>
                </div>
              ))
            ) : 
            (
                currentMonth?.map(({ date, dayOfMonth }) => (
                  <div key={date} className='w-[12%] flex flex-col items-center gap-2'>
                    <div className='font-semibold text-xs'>{dayOfMonth.slice(0, 3)}</div>
                    <div className={clsx('w-full h-[72px] flex items-center justify-center border border-[#0a66c2] rounded-md hover:bg-blue-400 cursor-pointer', date === datetime && 'bg-blue-400 border-[rgba(22,157,215,1)]',new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')} 
                      onClick={() => {
                        if (new Date(date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
                          setDatetime(date);
                          setSelectedTime();
                        }
                      }}
                    >{format(new Date(date), 'dd')}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='font-semibold'>Choose time</div>
            <div className='flex flex-wrap gap-2 my-3 justify-center'>
              {
                datetime &&
                !timeOptions.length ?
                  <h5 className='text-red-500'>Service is not available on {moment(datetime, 'YYYY-MM-DD').format('DD/MM/YYYY')}</h5>
                  : timeOptions?.map((time, idx) => (
                  (!staff?.work || !isWorkingTime(time, staff?.work)) && (
                    <div className={clsx('w-[23%] h-[48px] flex items-center justify-center border border-[#0a66c2] rounded-md hover:bg-blue-400 hover:border-none cursor-pointer', selectedTime===time && 'bg-blue-400 border-none')} key={idx} onClick={() =>{handleOnClick(time)}}>
                      <span className='text-[14px] leading-5 font-medium'>{time}</span>
                      <span className='text-[12px] leading-4 text-[#00143c]'>{parseInt(time.split(':')[0]) >= 12 ? 'pm' : 'am'}</span>
                    </div>
                  )
                ))
              }
            </div>
          </div>
        </div>
        <div className='flex-3 flex-col'>
          <div className='border border-gray-400 h-fit pb-5 rounded-md'>
          <div className='mb-4 border-b-2 border-gray-200 px-3 pb-4'><span className='font-semibold text-3xl'>Booking Details</span></div>
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
              <span className='text-[#00143c]'>{staff ? `${staff?.lastName} ${staff?.firstName}` : ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-gray-700 font-bold'>Date & Time:</span>
              <span className='text-[#00143c]'>{(selectedTime && beforeCheckout()) ? `${selectedTime} ${new Date(datetime).toLocaleDateString()}` : ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-gray-700 font-bold'>Total Price:</span>
              <div className='flex gap-2 items-center'>
                <span className={clsx('text-[#0a66c2] font-semibold', discountValue > 0 && 'font-medium line-through')}>{`${formatPrice(formatPricee(service?.price))} VNĐ`}</span>
                {discountValue > 0 && <span className='leading-7 text-[#0a66c2] font-semibold'>{`${formatPrice(formatPricee(discountValue))} VNĐ`}</span>}
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
          {(selectedTime && beforeCheckout()) && <Button style='px-6 py-1 rounded-md text-white bg-[#0a66c2] font-semibold w-fit h-fit mt-2' handleOnclick={handleCheckout}>Checkout</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDateTIme