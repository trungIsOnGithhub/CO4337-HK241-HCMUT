import { apiGetCouponsByServiceId, apiGetOneService, apiGetServiceProviderById, apiGetServiceTimeOptionAvailableCurrentDay } from 'apis';
import clsx from 'clsx';
import Button from 'components/Buttons/Button';
import React, { useEffect, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { convertH2M, formatPrice, formatPricee } from 'ultils/helper';
import path from 'ultils/path';
import { apiUpdateCartService } from 'apis';
import withBaseComponent from 'hocs/withBaseComponent';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrent } from 'store/user/asyncAction';
import { CiSearch } from 'react-icons/ci';
import { FaAngleDown, FaAngleUp, FaPhone } from 'react-icons/fa';
import moment from 'moment';
import { HashLoader } from 'react-spinners';
import { convertM2H } from 'ultils/helper';
import { toast } from 'react-toastify';

// const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Booking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [staffs, setStaffs] = useState([]);
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  // const [duration, setDuration] = useState(null);
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
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [pathname]);

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
    const fetchData = async () => {
      if (!service?._id) {
        return;
      }

      let now = new Date();
      const mStarted = now.getHours() * 60 + now.getMinutes();
      const dow = daysOfWeek[now.getDay()];

      setIsLoading(true)
      let resp = await apiGetServiceTimeOptionAvailableCurrentDay({ now:now.getTime(), dow, mStarted, svid: service._id });

      // console.log('}}}}', resp.timeOptions);

      if (resp.success && resp.timeOptions) {
        setTimeOptions(resp.timeOptions);
      }
      setIsLoading(false);
    }

    fetchData(); 
  }, [service]);

  const handleBookDateTime = (el) => { 
    navigate({
      pathname: `/${path.BOOKING_DATE_TIME}`,
      search: createSearchParams({sid: service?._id, st: el?._id}).toString()
    })
  }

  const parseTimee = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  
  const handleOnClick = async(time, el) => {
    // console.log('|'+time+'|');
    const fetchData = async () => {
      if (!service?._id) {
        return;
      }

      let now = new Date();
      const mStarted = now.getHours() * 60 + now.getMinutes();
      const dow = daysOfWeek[now.getDay()];

      setIsLoading(true)
      let resp = await apiGetServiceTimeOptionAvailableCurrentDay({ now:now.getTime(), dow, mStarted, svid: service._id });

      if (resp.success && resp.timeOptions) {
        setTimeOptions(resp.timeOptions);
      }
      setIsLoading(false);
    };

    const startMM = time.start;

    time = convertM2H(time?.start);
    setSelectedStaff({time, staff:el, date:new Date().toLocaleDateString()});
    const nowDate = new Date();
    const date = moment(nowDate).format("DD/MM/YYYY");

    if (provider?.advancedSetting?.minutesBeforeSameDayBook > 0) {
      const nowMM = nowDate.getHours() * 60 + nowDate.getMinutes() + 1; // add 1 one more minute to fix delay

      if (startMM - nowMM <= provider.advancedSetting.minutesBeforeSameDayBook) {
        const hNeed = Math.trunc(provider.advancedSetting.minutesBeforeSameDayBook / 60);
        const mNeed = provider.advancedSetting.minutesBeforeSameDayBook % 60;
        let msg = `Provider required ${hNeed} hours ${mNeed} before booking this timeslot!`;
        if (hNeed < 1) {
          msg = `Provider required ${mNeed} minutes before booking this timeslot!`;
        }
        toast.error(msg);
        fetchData();
        setSelectedStaff({
          time: null,
          date: null,
          staff: null
        });
        return;
      }
    }

    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    // // Kết hợp formattedDate và time để tạo datetime
    const dateTime = new Date(`${formattedDate}T${time}:00Z`);

    // console.log('......', {
    //   service: service?._id, 
    //   provider: provider?._id,
    //   staff: el?._id, 
    //   time: time,
    //   duration: service?.duration,
    //   date,
    //   price: +discountValue > 0 ? +discountValue : +originalPrice,
    //   dateTime
    // });

    let resp = await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id,
      staff: el?._id, 
      time: time,
      duration: service?.duration,
      date,
      originalPrice: originalPrice,
      discountPrice: +discountValue > 0 ? +discountValue : 0,
      dateTime,
      coupon: selectedVoucher?._id
    });

    if (resp.success) {
      toast.success("Service cart updated successfully!");
    }
    else if (resp.mes) {
      // console.log('==============', resp);
      toast.error(resp.mes);
  
      fetchData();
    }
    else  {
      toast.error("Error add service to cart!");
    }
  }

  const handleCheckout = async() => {
  
    const fetchData = async () => {
      if (!service?._id) {
        return;
      }

      let now = new Date();
      const mStarted = now.getHours() * 60 + now.getMinutes();
      const dow = daysOfWeek[now.getDay()];

      setIsLoading(true)
      let resp = await apiGetServiceTimeOptionAvailableCurrentDay({ now:now.getTime(), dow, mStarted, svid: service._id });

      if (resp.success && resp.timeOptions) {
        setTimeOptions(resp.timeOptions);
      }
      setIsLoading(false);
    }
  

    const nowDate = new Date();
    const startMM = convertH2M(selectedStaff?.time);

    const finalPrice = +discountValue > 0 ? +discountValue : +originalPrice;
    const date = moment().format("DD/MM/YYYY");
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
      // // Kết hợp formattedDate và time để tạo datetime
    const dateTime = new Date(`${formattedDate}T${selectedStaff?.time}:00Z`);

    if (provider?.advancedSetting?.minutesBeforeSameDayBook > 0) {
      const nowMM = nowDate.getHours() * 60 + nowDate.getMinutes() + 1; // add 1 one more minute to fix delay

      if (startMM - nowMM <= provider.advancedSetting.minutesBeforeSameDayBook) {
        const hNeed = Math.trunc(provider.advancedSetting.minutesBeforeSameDayBook / 60);
        const mNeed = provider.advancedSetting.minutesBeforeSameDayBook % 60;
        let msg = `Provider required ${hNeed} hours ${mNeed} before booking this timeslot!`;
        if (hNeed < 1) {
          msg = `Provider required ${mNeed} minutes before booking this timeslot!`;
        }
        toast.error(msg);
        fetchData();
        setSelectedStaff({
          time: null,
          date: null,
          staff: null
        });
        return;
      }
    }
    // console.log('......', {
    //   service: service?._id, 
    //   provider: provider?._id, 
    //   staff: selectedStaff?.staff?._id, 
    //   time: selectedStaff?.time,
    //   duration: service?.duration,
    //   date,
    //   price: finalPrice,
    //   dateTime: dateTime
    // });

    let resp = await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: selectedStaff?.staff?._id, 
      time: selectedStaff?.time,
      duration: service?.duration,
      date,
      originalPrice: originalPrice,
      discountPrice: +discountValue > 0 ? +discountValue : 0,
      dateTime: dateTime,
      coupon: selectedVoucher?._id
    })

    if (resp.success) {
      toast.success("Service cart updated successfully!");
    }
    else if (resp.mes) {
      console.log('==============', resp);
      toast.error(resp.mes);
  
      fetchData(); 
    }
    else  {
      toast.error("Error add service to cart!");
    }

    if(selectedVoucher){
      navigate(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedVoucher?.code}`);
    }
    else {
      navigate(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}`);
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
    console.log(coupon)
    const { date, time } = coupon.expirationDate;
    const expirationDateTime = new Date(`${date.split('/').reverse().join('-')}T${time}:00`); // Chuyển đổi sang ISO format

    // Kiểm tra nếu thời gian hết hạn đã qua
    const now = new Date();
    console.log(expirationDateTime)
    console.log(now)

    if (expirationDateTime < now) return false;

    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === currentUser._id);
    
    return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
  };

  const usableDiscountCodes = discountCodes.filter(canUseDiscount);
  
  return (
    <div className='w-main'>
      <div className='w-main flex gap-2 h-fit my-5'>
        <div className='border border-gray-400 flex-7 flex-col p-[24px] rounded-md'>
        <div className='flex w-full justify-between items-center mb-4'>
          <span className='text-[18px] leading-6 font-semibold'>Choose Employee</span>
          <div className='w-[40%] h-[40px] flex gap-1 items-center border border-[#0a66c2] rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px]'>
            <span className='text-xl'><CiSearch size={20}/></span>
            <input className=' h-full flex-1 bg-transparent outline-none text-[15px] text-[#00143c] placeholder:text-slate-400'
              onChange={(event) => {

                  const staffsSearched = service?.assigned_staff.filter(stf => {
                    return stf.firstName.includes(event.target.value) || stf.lastName.includes(event.target.value)
                          || stf.email.includes(event.target.value) || stf.mobile.includes(event.target.value);
                  });
                  console.log(staffsSearched);
                  setStaffs(staffsSearched);

              }}
              placeholder='Search employee name, email...'/>
          </div>
        </div>

        <div>
        {staffs?.map((el, index) => (
          <div key={index} className='border border-gray-300 px-2 py-2 rounded-md my-2'>
            <div className='flex justify-between'>
              <div className='flex items-center gap-1'>
                <img src={el?.avatar} className='w-16 h-16 rounded-full' alt={el?.firstName} />
                {/* <span>Working Hour: 88 : 99</span> */}
                <span className='flex flex-col gap-1'>
                  <span className='text-lg'>{`${el.lastName} ${el.firstName}`}</span>
                  {provider?.advancedSetting && <span className='text-md flex gap-2 items-center'><FaPhone size='12px'/> {el.mobile}</span>}
                </span>
              </div>
              <Button style='px-6 rounded-md text-white bg-[#0a66c2] font-semibold h-fit py-2 w-fit' handleOnclick={()=>handleBookDateTime(el)}>Choose other date</Button>
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-xs leading-4'>Availability</span>
              <div className=' text-xs leading-4 font-medium w-fit h-fit bg-[#0a66c2] p-2 rounded-md text-white'>Today</div>
            </div>
            <div className='flex flex-wrap gap-2 my-3 justify-center'>
              {!(timeOptions[el?._id]?.length) ?
                  <h5 className='text-red-400 font-semibold'>Service by this staff is not available today!</h5>
                  :
                timeOptions[el?._id].map((time, idx) => (
                (
                  <div className={clsx('w-[15%] h-[46px] border border-[#0a66c2] rounded-md cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-400 hover:border-none', (selectedStaff.time === convertM2H(time.start) && selectedStaff?.staff?._id === el?._id) && 'bg-blue-400 border-none')}
                      key={idx} onClick={() =>{handleOnClick(time,el)}}>
                    <span className='text-[14px] leading-5 font-medium'>{convertM2H(time.start)} - {convertM2H(time.end)}</span>
                    {/* <span className='text-[12px] leading-4 text-[#00143c]'>{(time[0]/60) >= 12 ? 'pm' : 'am'}</span> */}
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
                <span className='text-[#00143c] flex-1 line-clamp-1'>{(selectedStaff?.time && parseTimee(selectedStaff?.time) >= currentTime) ? `${selectedStaff?.time} - ${selectedStaff?.date}` : ''}</span>
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

        {isLoading && (
        <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
            <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
        </div>
        )}
      </div>
    </div>
  );
};

export default Booking;