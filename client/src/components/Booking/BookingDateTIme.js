import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, endOfMonth, startOfMonth, addMonths, subMonths  } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { apiGetOneService, apiGetOneStaff, apiGetServiceProviderById, apiUpdateCartService } from 'apis'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { formatPrice, formatPricee } from 'ultils/helper'
import Button from 'components/Buttons/Button'
import path from 'ultils/path'
import moment from 'moment'

const BookingDateTIme = () => {
  const [type, setType] = useState('Week')

  const [selectedTime, setSelectedTime] = useState(null)
  const [params] = useSearchParams();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [staff, setStaff] = useState(null)
  const [duration, setDuration] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);

  const [datetime, setDatetime] = useState()

  const [displayTime, setDisplayTime] = useState(new Date())

  const fetchServiceData = async () => {
    const response = await apiGetOneService(params?.get('sid'));
    if (response?.success) {
      setService(response?.service);
      setDuration(response?.service?.duration);
    }
  };

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
            if (openingTime && closingTime && duration) {
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
            if (openingTime && closingTime && duration) {
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

  const handleOnClick = async(time) => {
    setSelectedTime(time);
    await apiUpdateCartService({
      service: service?._id, 
      provider: provider?._id, 
      staff: staff?._id, 
      duration: service?.duration,
      time: time,
      date: moment(new Date(datetime)).format("DD/MM/YYYY")
    })
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

  const handleCheckout = () => {
    window.open(`/${path.CHECKOUT_SERVICE}`, '_blank')
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

  return (
    <div className='w-main'>
      <div className='w-main flex gap-2 h-fit my-5'>
        <div className='border border-gray-400 flex-7 flex-col pl-3 pr-3 rounded-md'>
          <div className='mb-4'><span className='font-semibold text-3xl'>Choose Date & Time</span></div>
          <div className='flex justify-between'>
            <div className='flex gap-1'>
            <div className={clsx('px-3 py-1 rounded-md cursor-pointer font-semibold flex items-center justify-center border-2 border-gray-200', type === 'Week' ? 'bg-blue-500 text-white' : 'bg-blue-100')} onClick={()=>{setType('Week'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Week</div>
            <div className={clsx('px-3 py-1 rounded-md cursor-pointer font-semibold flex items-center justify-center border-2 border-gray-200', type === 'Month' ? 'bg-blue-500 text-white' : 'bg-blue-100')} onClick={()=>{setType('Month'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Month</div>
            </div>
            <div className='flex gap-1'>
              <div className={clsx('border rounded-md flex items-center justify-center px-1 py-1',isBackButtonDisabled() ? 'cursor-not-allowed border-gray-200' : 'border-gray-400  cursor-pointer' )} onClick={() => handlePrevNext('prev')}><IoIosArrowBack size={30} color='gray'/></div>
              <div className='border border-gray-400 rounded-md flex items-center justify-center px-1 py-1 cursor-pointer' onClick={() => handlePrevNext('next')}><IoIosArrowForward size={30} color='gray' /></div>
            </div>
          </div>
          <div className='flex flex-col gap-2 items-center mb-5'>
            <div className='font-semibold mb-2'>{formattedDateRange}</div>
            <div className='flex flex-wrap gap-4 justify-center'>
            {type === 'Week' ? 
            (
              currentWeek?.map(({ date, dayOfWeek }) => (
                <div key={date} className='flex flex-col items-center'>
                  <div className='font-semibold'>{dayOfWeek.slice(0, 3)}</div>
                  <div className={clsx('px-6 py-4 flex items-center justify-center border border-gray-400 rounded-md cursor-pointer', date === datetime && 'bg-blue-400')} onClick={()=>{setDatetime(date); setSelectedTime()}}>{format(new Date(date), 'dd')}</div>
                </div>
              ))
            ) : 
            (
                currentMonth?.map(({ date, dayOfMonth }) => (
                  <div key={date} className='flex flex-col items-center'>
                    <div className='font-semibold'>{dayOfMonth.slice(0, 3)}</div>
                    <div className={clsx('px-6 py-4 flex items-center justify-center border border-gray-400 rounded-md', date === datetime && 'bg-blue-400',new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')} 
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
                  (!staff.work || !isWorkingTime(time, staff.work)) && (
                    <div className={clsx('px-3 py-1 border border-gray-400 rounded-md hover:bg-blue-400 cursor-pointer', selectedTime===time && 'bg-blue-400')} key={idx} onClick={() =>{handleOnClick(time)}}>
                      {parseInt(time.split(':')[0]) >= 12 ? `${time} pm` : `${time} am`}
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
              <span className='font-semibold text-yellow-600'>{staff ? `${staff?.lastName} ${staff?.firstName}` : ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-gray-700 font-bold'>Date & Time:</span>
              <span className='font-semibold text-green-600'>{(selectedTime && beforeCheckout()) ? `${selectedTime} ${new Date(datetime).toLocaleDateString()}` : ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-gray-700 font-bold'>Total Price:</span>
              <span className='font-semibold text-main'>{`${formatPrice(formatPricee(service?.price))} VNĐ`}</span>
            </div>
          </div>
          </div>
          <div className='text-right'>
          {(selectedTime && beforeCheckout()) && <Button style='px-6 py-1 rounded-md text-white bg-green-600 font-semibold w-fit h-fit mt-2' handleOnclick={handleCheckout}>Checkout</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDateTIme