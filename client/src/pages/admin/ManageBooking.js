import React, { useEffect, useRef, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { apiGetOrdersByAdmin, apiUpdateStatusOrder } from 'apis/order';
import moment from 'moment';
import { Button, InputFormm, Pagination } from 'components';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';
import bgImage from '../../assets/clouds.svg'
import { TfiExport } from "react-icons/tfi";
import { useForm } from 'react-hook-form';
import { BsCalendar } from "react-icons/bs";
import { RxMixerVertical } from 'react-icons/rx';
import { GoPlusCircle } from "react-icons/go";
import { format, isValid, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import useDebounce from 'hook/useDebounce';
import { FaAngleDown } from 'react-icons/fa';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import clsx from 'clsx';
import { toast } from 'react-toastify';

const ManageBooking = () => {
  const [params] = useSearchParams();
  const [booking, setBookings] = useState(null);
  const [counts, setCounts] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()
  const location = useLocation()
  const [showOptionStatus, setShowOptionStatus] = useState(null)
  const optionRef = useRef(null);

  const handleInputClick = () => {
    setShowCalendar(!showCalendar);
  };
  const handleConfirm = () => {
    if (startDate && endDate) {
      setShowCalendar(false);
    }
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return isAfter(date, startDate) && isBefore(date, endDate);
  };

  const fetchBooking = async (params) => {
    if (startDate && endDate) {
        const startDateUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        const endDateUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59));

        const startDateISO = startDateUTC.toISOString();
        const endDateISO = endDateUTC.toISOString();

        const response = await apiGetOrdersByAdmin({
            ...params,
            startDate: startDateISO,
            endDate: endDateISO,
            limit: process.env.REACT_APP_LIMIT
        });

        if (response?.success) {
            setBookings(response?.orders);
            setCounts(response?.counts);
        }
    } else {
        const response = await apiGetOrdersByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT });
        if (response?.success) {
            setBookings(response?.orders);
            setCounts(response?.counts);
        }
    }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchBooking(searchParams);
  }, [params, startDate, endDate, showOptionStatus]);


  const handleClearDates = (e) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setError("");
  };



  const {register,formState:{errors}, handleSubmit, watch} = useForm()

  const data = [
    {
        cate: 'Hairstylist',
        color: 'rgba(255, 0, 0, 0.5)' // Màu đỏ
    },
    {
        cate: 'Barber',
        color: 'rgba(0, 255, 0, 0.5)' // Màu xanh lá cây
    },
    {
        cate: 'Nail',
        color: 'rgba(0, 0, 255, 0.5)' // Màu xanh dương
    },
    {
        cate: 'Makeup',
        color: 'rgba(255, 255, 0, 0.5)' // Màu vàng
    },
    {
        cate: 'Tattoo',
        color: 'rgba(255, 0, 255, 0.5)' // Màu tím
    },
    {
        cate: 'Massage',
        color: 'rgba(0, 255, 255, 0.5)' // Màu cyan
    },
    {
        cate: 'Gym',
        color: 'rgba(255, 128, 0, 0.5)' // Màu cam
    },
    {
        cate: 'Yoga',
        color: 'rgba(128, 0, 255, 0.5)' // Màu violet
    },
    {
        cate: 'Fitness',
        color: 'rgba(255, 128, 128, 0.5)' // Màu hồng
    }
  ];

  const getColorByCategory = (category) => {
    const item = data.find(el => el.cate === category);
    return item ? item.color : 'rgba(0, 0, 0, 0.1)'; // Màu mặc định nếu không tìm thấy
  };

  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateSelect = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (isBefore(date, startDate)) {
        setError("End date cannot be before start date");
        return;
      }
      setEndDate(date);
      setError("");
    }
  };
  const generateCalendarDays = (month) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  };

  const Calendar = ({ month }) => {
    const days = generateCalendarDays(month);

    return (
      <div className="p-4 rounded-lg shadow-lg text-[#00143c] w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
          {days.map((date) => {
            const isSelected = 
              (startDate && format(date, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd")) ||
              (endDate && format(date, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd"));
            const inRange = isDateInRange(date);

            return (
              <button
                key={date.toString()}
                onClick={() => handleDateSelect(date)}
                className={`
                  p-2 text-sm rounded-full transition-all
                  ${isSelected ? "bg-blue-500 text-white" : ""}
                  ${inRange ? "bg-blue-100" : ""}
                  hover:bg-blue-200
                `}
                aria-label={format(date, "MMMM d, yyyy")}
              >
                {format(date, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };


  const queryDebounce = useDebounce(watch('q'),800)

  useEffect(() => {
    if(queryDebounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({q:queryDebounce}).toString()
      })
    }
    else{
      navigate({
        pathname: location.pathname,
      })
    }
  }, [queryDebounce])


  const handleShowOptionStatus = (bookingId) => {
    setShowOptionStatus(bookingId)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionRef.current && !optionRef.current.contains(event.target)) {
        setShowOptionStatus(null); // Đặt lại showOptionStatus
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChangeStatusBooking = async(bookingId, status) => {
    console.log(bookingId, status)
    const response = await apiUpdateStatusOrder({bookingId, status})
    if(response?.success){
      setShowOptionStatus(null)
      toast.success(response?.mes)
    }
    else{
      setShowOptionStatus(null)
      toast.error(response?.mes)
    }
  }
  const handleNavigateBookingDetail = (bookingid) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_BOOKING_DETAIL}`,
      search: createSearchParams({ bookingid }).toString()
    });
  }

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Booking</span>
        </div>
        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`Bookings (${counts})`}</h1>
            <Button style={'px-4 py-2 rounded-md text-[#00143c] bg-[#fff] font-semibold w-fit h-fit flex gap-2 items-center border border-[#b3b9c5]'}><TfiExport className='text-lg font-bold' /> Export Data</Button>
          </div>
          <div className='w-full h-[48px] mx-[-6px] mt-[-6px] mb-[10px] flex'>
            <div className='w-[62%] h-[36px] m-[6px] flex'>
              <form className='flex-1' >
                <InputFormm
                  id='q'
                  register={register}
                  errors={errors}
                  fullWidth
                  placeholder= 'Search booking by service, customer, staff ...'
                  style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                  styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
                >
                </InputFormm>
              </form>
            </div>
            <div className="relative w-[35%] h-[36px] m-[6px]">
              <div className="relative" onClick={handleInputClick}>
                <input
                  type="text"
                  readOnly
                  value={
                    startDate && endDate
                      ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
                      : "Select date range"
                  }
                  className="w-full px-4 py-2 border rounded-lg cursor-pointer focus:outline-none text-[#00143c] text-sm"
                  aria-label="Date range picker"
                />
                {startDate && endDate ? (
                  <FiX
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00143c] cursor-pointer"
                    onClick={handleClearDates}
                  />
                ) : (
                  <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00143c] cursor-pointer" />
                )}
              </div>

              {error && <p className="text-[#0a66c2] mt-2 text-xs font-medium">{error}</p>}

              {showCalendar && (
                <div className="absolute w-fit right-[-100px] z-10 mt-2 px-4 py-3 bg-white rounded-lg shadow-xl border animate-fade-in-down">
                  <div className="flex gap-4">
                    <Calendar month={currentMonth} />
                    <Calendar month={addMonths(currentMonth, 1)} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleConfirm}
                      disabled={!startDate || !endDate}
                      className={`
                        px-4 py-2 rounded-lg transition-all
                        ${startDate && endDate
                          ? "text-white bg-[#005aee] hover:bg-blue-600"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"}
                      `}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] p-[8px]'>
              <span className='w-[10%]'>Time</span>
              <span className='w-[25%] flex items-center justify-center'>Service</span>
              <span className='w-[15%] flex items-center justify-center'>Customer</span>
              <span className='w-[10%] flex items-center justify-center'>Duration</span>
              <span className='w-[15%] flex items-center justify-center'>Status</span>
              <span className='w-[25%] flex items-center justify-center'>Employee</span>
            </div>
            <div>
              {booking?.map((el,index) => (
                <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1 h-[56px] px-[8px] py-[12px] cursor-pointer hover:bg-blue-200'>
                  <span className='w-[10%] py-2 text-[#00143c]'>{el?.info[0]?.time}</span>
                  <span onClick={()=>handleNavigateBookingDetail(el?._id)} className='w-[25%] py-2 text-[#00143c] text-sm flex justify-start font-medium'>
                    <div className='pl-[4px] flex items-center' style={{borderLeft: `4px solid ${getColorByCategory(el?.serviceDetails?.category)}` }}>
                      {el?.serviceDetails?.name}
                    </div>
                  </span>
                  <span className='w-[15%] py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>{`${el?.userDetails?.lastName} ${el?.userDetails?.firstName}`}</span>
                  <span className='w-[10%] py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>{`${el?.serviceDetails?.duration}min`}</span>
                  <span className='w-[15%] py-2 text-[#00143c] flex items-center justify-center relative cursor-pointer' onClick={()=>{handleShowOptionStatus(el?._id)}}>
                    <div className='w-full flex justify-between items-center border rounded-md px-2 shadow-sm'>
                      <span className='flex gap-[6px] items-center'><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color={el?.status === 'Successful' ? 'green' : el?.status === 'Pending' ? 'orange' : 'red'}/>{el?.status}</span>
                      <FaAngleDown size={10}/>
                    </div>
                   {
                    (showOptionStatus === el?._id && el?.status !== 'Cancelled') &&
                    <div ref={optionRef} className='w-full bg-white border shadow-xl absolute top-8 left-0 px-[7px] py-[5px] flex flex-col gap-1 z-50'>
                      <span onClick={()=>handleChangeStatusBooking(el?._id, 'Successful')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.status === 'Successful' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='green'/> Successful</span>
                      <span onClick={()=>handleChangeStatusBooking(el?._id, 'Pending')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.status === 'Pending' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='orange'/> Pending</span>
                      <span onClick={()=>handleChangeStatusBooking(el?._id, 'Cancelled')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.status === 'Cancelled' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='red'/> Cancelled</span>
                    </div>
                   }
                  </span>
                  <span className='w-[25%] py-2 text-[#00143c] flex items-center justify-center'>
                    <img className='w-[32px] h-[32px] rounded-full ml-[-10px] mr-[0px]' src={el?.staffDetails?.avatar}/>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className='text-[#00143c] flex-1 flex items-end'>
            <Pagination totalCount={counts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;