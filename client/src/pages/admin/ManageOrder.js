import React, { useEffect, useState } from 'react';
import { FiCalendar, FiUser, FiBriefcase, FiClock, FiDollarSign, FiChevronLeft, FiChevronRight, FiX  } from 'react-icons/fi';
// import { FaTags } from "react-icons/fa";
// import path from 'ultils/path';
import { formatPrice, formatPricee } from 'ultils/helper';
import bgImage from '../../assets/clouds.svg';
import { createSearchParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { apiGetOrdersProductByAdmin } from 'apis/orderProduct';
// import moment from 'moment';
import { Button, InputFormm, Pagination } from 'components';
// import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { TfiExport } from "react-icons/tfi";
import { useForm } from 'react-hook-form';
import { BsCalendar } from "react-icons/bs";
import { RxMixerVertical } from 'react-icons/rx';
import { GoPlusCircle } from "react-icons/go";
import { format, isValid, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import useDebounce from 'hook/useDebounce';

const ManageOrder = () => {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchBooking = async () => {
    if (startDate && endDate) {
        const startDateUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        const endDateUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59));

        const startDateISO = startDateUTC.toISOString();
        const endDateISO = endDateUTC.toISOString();

        console.log(`....${startDateISO}|||||${endDateISO}........`)

        const response = await apiGetOrdersProductByAdmin({
            searchTerm,
            startDate: startDateISO,
            endDate: endDateISO,
            limit: process.env.REACT_APP_LIMIT
        });

        if (response?.success) {
            setOrders(response?.orders);
            setCounts(response?.counts);
        }
    } else {
        const response = await apiGetOrdersProductByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT });
        if (response?.success) {
            setOrders(response?.orders);
            setCounts(response?.counts);
        }
    }
  };

  useEffect(() => {
    // const searchParams = Object.fromEntries([...params]);
    fetchBooking();
  }, [params, startDate, endDate]);


  const handleClearDates = (e) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setError("");
  };

  const {register,formState:{errors}, handleSubmit, watch} = useForm()

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

  useEffect(() => {
    if(startDate && endDate){

    }
  }, [startDate, endDate]);

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Order</span>
        </div>


        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`Total Orders (${counts})`}</h1>
            <Button style={'px-4 py-2 rounded-md text-[#00143c] bg-[#fff] font-semibold w-fit h-fit flex gap-2 items-center border border-[#b3b9c5]'}><TfiExport className='text-lg font-bold' /> Export Data</Button>
          </div>
          <div className='w-full h-[48px] mx-[-6px] mt-[-6px] mb-[10px] flex'>
            <div className='w-[62%] h-[36px] m-[6px] flex'>
              <form className='flex-1' >
                <InputFormm
                  id='q'
                  register={()=>{}}
                  errors={()=>{}}
                  fullWidth
                  placeholder= 'Search order by customer name, email'
                  style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                  styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
                  onChange={() => {}}
                >
                </InputFormm>
              </form>
            </div>
            <div className="relative w-[25%] h-[36px] m-[6px]">
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
            <div className='w-[10%] h-[36px] m-[6px]'>
              <Button style={'w-fit px-4 py-2 bg-[#dee1e6] rounded-md text-[#00143c] flex gap-1 items-center justify-center font-semibold'}>
                <span className='font-bold text-xl'><RxMixerVertical /></span>
                <span>Filters</span>
              </Button>
            </div>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] p-[8px]'>
              <span className='w-[20%] text-center'>Date</span>
              <span className='w-[15%] text-center'>Time</span>
              <span className='w-[20%] text-center'>Customer</span>
              <span className='w-[15%] text-center'>Number Items</span>
              <span className='w-[15%] text-center'>Status</span>
              {/* <span className='w-[20%]'>Employee</span> */}
              <span className='w-[15%]'>Action</span>
            </div>
            <div>
              {orders?.map((el,index) => (
                <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1 h-[56px] px-[8px] py-[12px]'>
                  <span className='w-[15%] py-2 text-[#00143c] text-center'>{el?.info[0]?.date}</span>
                  <span className='w-[15%] py-2 text-[#00143c] text-center'>{el?.info[0]?.time}</span>
                  {/* <span className='w-[25%] py-2 text-[#00143c] text-sm flex justify-start font-medium'>
                    <div className='pl-[4px] flex items-center' style={{borderLeft: `4px solid` }}>
                      {el?.createdAt}
                    </div>
                  </span> */}
                  <span className='w-[20%] py-2 text-[#00143c] text-sm line-clamp-1 text-center'>{`${el?.orderBy?.lastName} ${el?.orderBy?.firstName}`}</span>
                  <span className='w-[10%] px-2 py-2 text-[#00143c] text-sm line-clamp-1 text-center'>{el?.info?.length  || 0}</span>
                  <span className='w-[15%] px-2 py-2 text-[#00143c] text-center'>{el?.status}</span>
                  {/* <span className='w-[20%] px-4 py-2 text-[#00143c] flex items-center'>
                    <img className='w-[32px] h-[32px] rounded-full ml-[-10px] mr-[0px]' src={el?.staffDetails?.avatar}/>
                  </span> */}
                  <span className='w-[15%] px-2 py-2 text-[#00143c] font-bold text-xl'><GoPlusCircle /></span>
                </div>
              ))}
            </div>
          </div>
          <div className='text-[#00143c] flex-1 flex items-end'>
            <Pagination totalCount={counts} />
          </div>
        </div>


{/*   
          <div className='mt-[85px] w-full flex flex-col items-start gap-6'>
            {orders && orders.map((orderItem, index) => (
              <div
                key={index}
                className='cursor-pointer w-[90%] lg:w-[70%] p-6 ml-16 border rounded-lg shadow-md flex flex-col gap-4 bg-white hover:animate-scale-in-center'
                style={{ backgroundColor: backgroundColors[index % 5] }}
              >
                <div className='flex flex-col gap-4 text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <span><strong className='text-[#0a66c2] text-xl'>#ID: {orderItem?._id}</strong></span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiUser className='text-xl text-blue-400' />
                    <span><strong>Customer Name:</strong> {`${orderItem?.orderBy?.lastName} ${orderItem?.orderBy?.firstName}`}</span>
                  </div>
                  <div className='flex flex-col items-start gap-2'>
                    <div className='flex items-center gap-2'>
                      <FiBriefcase className='text-xl text-orange-400' />
                      <span><strong>Products:</strong></span>
                    </div>
                    <div className='h-[300px] overflow-y-auto'>
                    {orderItem?.products.map((product, index) => (
                      <div key={index} className='flex flex-col items-start gap-2 ml-7'>
                        <div className='flex gap-4 items-center'>
                        <span className='max-w-[70%] line-clamp-1 italic text-gray-600 font-semibold'>{`${index+1}) ${product?.product?.title}`}</span>
                        <span className='text-gray-700 font-bold text-lg'>{`: ${formatPrice(formatPricee(product?.price))} VNĐ X ${product?.quantity}`}</span>
                        </div>
                        <div className='ml-48'>
                          <img className='w-48 h-48 object-cover border border-gray-500 rounded-md shadow-md' src={product?.product?.thumb}></img>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiCalendar className='text-xl text-pink-400' />
                    <span><strong>Created At:</strong> {moment(orderItem?.createdAt).fromNow()}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiDollarSign className='text-xl text-green-400' />
                    <span><strong>Total Price:</strong> {calculateTotalPrice(orderItem?.products).toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
            ))}
            <div className='w-full flex justify-end'>
              <Pagination totalCount={counts} />
            </div>
          </div> */}
    </div>
    </div>
  );
};

export default withBaseComponent(ManageOrder);
