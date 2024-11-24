import { apiGetCalendarByUserId, apiUpdateEmailByBookingId } from 'apis';
import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import googleCalendar from '../../assets/google_calendar_icon.png'
import { Button } from 'components';
import { FaGoogle, FaSignOutAlt } from "react-icons/fa";
import { FaSync } from "react-icons/fa";
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import moment from 'moment';


const Calendar = () => {
  const { current } = useSelector(state => state.user);
  const [calendar, setCalendar] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const session = useSession();
  const supabase = useSupabaseClient(); //Khởi tạo supabase Client

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

  const handleAddCalendarEvent = async (reservation) => {
    if (!session) {
      await googleSignIn(); // Gọi hàm đăng nhập nếu chưa có session
    } else {
      // Tạo sự kiện lịch
      const event = {
        'summary': reservation.serviceName,
        'description': `Status: ${reservation.status}`,
        'start': {
          'dateTime': reservation.localStart,
          'timeZone': "UTC"
        },
        'end': {
          'dateTime': reservation.localEnd,
          'timeZone': "UTC"
        }
      };

      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + session.provider_token, // Access token for google
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      .then((response) => response.json())
      .then(async(data) => {
        toast.success("Event created, check your Google Calendar!");
        await apiUpdateEmailByBookingId({bookingId: reservation?.bookingId, email: session?.user?.email})
        const response = await apiGetCalendarByUserId(current?._id);
        if (response?.success) {
          setCalendar(response?.bookings);
        } else {
          toast.error('Something went wrong!');
        }
      })
      .catch((error) => {
        console.error("Error creating event:", error);
        toast.error("Failed to create event.");
      });
    }
  };

  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: 'http://localhost:3000/user/my_calendar' // Thêm redirectTo
      }
    });
  
    if (error) {
      toast.error("Error logging in to Google provider with Supabase");
    }
  };


  const handleLogout = async() => {
    await supabase.auth.signOut();
  }
  
  const handleSyncAllCalendar = async() => {
    // Tạo một mảng các promise từ map
    const syncPromises = filteredCalendar?.map(async(calendar) => {
      if(!calendar?.emailsSync?.includes(session?.user?.email)){
        const event = {
          'summary': calendar.serviceName,
          'description': `Status: ${calendar.status}`,
          'start': {
            'dateTime': calendar.localStart,
            'timeZone': "UTC"
          },
          'end': {
            'dateTime': calendar.localEnd,
            'timeZone': "UTC"
          }
        };
        return fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' + session.provider_token, // Access token for google
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        })
        .then((response) => response.json())
        .then(async(data) => {
          await apiUpdateEmailByBookingId({bookingId: calendar?.bookingId, email: session?.user?.email});
          const response = await apiGetCalendarByUserId(current?._id);
          if (response?.success) {
            setCalendar(response?.bookings);
          } else {
            toast.error('Something went wrong!');
          }
        })
        .catch((error) => {
          console.error("Error creating event:", error);
        });
      }
    });

    // Chờ tất cả các promise hoàn thành
    await Promise.all(syncPromises);
    

    // Tính toán số lượng sự kiện đã đồng bộ
    let count = 0;
    filteredCalendar?.forEach((calendar) => {
      if(calendar?.emailsSync?.includes(session?.user?.email)){
        count += 1;
      }
    });

    if(count === filteredCalendar.length){
      toast.success("All events have been synced to Google Calendar!");
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };
  

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg flex flex-col overflow-y-hidden h-screen">
      {
        session && 
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-4 p-4 bg-gray-100 shadow-md rounded-lg'>
            <h2 className='text-xl text-gray-700 font-semibold hover:text-gray-900 transition-colors duration-200'>
                Hey: {session?.user?.email}
            </h2>
          </div>
          <Button
            handleOnclick={handleLogout} 
            style={'flex items-center px-4 py-2 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out'}
          >
            <FaGoogle className="mr-2" />
            <span className="mr-2">Logout</span>
            <FaSignOutAlt />
          </Button>
        </div>
      }
      <div className="flex justify-between items-center mb-4 h-[10%]">
        <button onClick={() => changeMonth('prev')}><FaChevronLeft /></button>
        <h2 className="font-semibold">{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
        <button onClick={() => changeMonth('next')}><FaChevronRight /></button>
      </div>
      {session &&   
      <div className='w-full flex justify-end mb-4 h-[5%] items-center'>
        <div className='flex gap-1 items-center bg-[#4285F4] py-1 px-2 rounded-md text-white cursor-pointer' onClick={() => handleSyncAllCalendar()}>
          <FaSync/>
          <span>Sync all calendars</span>
        </div>
      </div>}
      <div className='grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-white'>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCalendar.map((reservation, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-4 h-full bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
            >
              <div className="flex justify-between items-center h-[20%]">
              <span className="text-sm font-medium text-gray-600">
                {new Date(reservation.localStart).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC", // Chỉ định múi giờ là UTC để không cộng thêm 7 giờ
                })} -{" "}
                {new Date(reservation.localEnd).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC", // Chỉ định múi giờ là UTC
                })}
              </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>
              <div className='flex flex-col justify-between flex-grow'>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{reservation.serviceName}</h3>
                <div className='flex justify-between items-center'>
                  <p className="text-sm text-gray-600">{formatDate(reservation?.localStart)}</p>
                  {
                    !reservation?.emailsSync?.includes(session?.user?.email) ?
                    <img src={googleCalendar} className='w-8 h-8 rounded-md cursor-pointer' onClick={()=>handleAddCalendarEvent(reservation)}/>
                    :
                    <div
                      className="bg-green-500 rounded-full p-1"
                    >
                      <FaCheckCircle className="w-3 h-3 text-white" />
                    </div>
                  }
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