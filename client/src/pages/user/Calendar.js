import { apiGetCalendarByUserId } from 'apis';
import React, { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import googleCalendar from '../../assets/google_calendar_icon.png'
const Calendar = () => {
  const { current } = useSelector(state => state.user);
  const [calendar, setCalendar] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchCalendarByUserId = async () => {
      const response = await apiGetCalendarByUserId(current?._id);
      if (response?.success) {
        setCalendar(response?.bookings);
      } else {
        toast.error('Something went wrong!');
      }
    };
    fetchCalendarByUserId();
  }, [current]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Successful":
        return "bg-green-200 text-green-800";
      case "Pending":
        return "bg-yellow-200 text-yellow-800";
      case "Cancelled":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Hàm lọc lịch theo tháng
  const filteredCalendar = calendar.filter(reservation => {
    const reservationDate = new Date(reservation.localStart);
    return reservationDate.getMonth() === currentMonth && reservationDate.getFullYear() === currentYear;
  });

  // Chuyển tháng
  const changeMonth = (direction) => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleAddCalendarEvent = () => {
    
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg flex flex-col overflow-y-hidden h-screen">
      <div className="flex justify-between items-center mb-4 h-[10%]">
        <button onClick={() => changeMonth('prev')}><FaChevronLeft /></button>
        <h2 className="font-semibold">{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
        <button onClick={() => changeMonth('next')}><FaChevronRight /></button>
      </div>
      <div className='grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-white'>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCalendar.map((reservation, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-4 h-full bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
            >
              <div className="flex justify-between items-center h-[20%]">
                <span className="text-sm font-medium text-gray-600">
                  {new Date(reservation.localStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(reservation.localEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>
              <div className='flex flex-col justify-between flex-grow'>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{reservation.serviceName}</h3>
                <div className='flex justify-between items-center'>
                  <p className="text-sm text-gray-600">{new Date(reservation.localStart).toDateString()}</p>
                  <img src={googleCalendar} className='w-8 h-8 rounded-md cursor-pointer' onClick={()=>handleAddCalendarEvent()}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
