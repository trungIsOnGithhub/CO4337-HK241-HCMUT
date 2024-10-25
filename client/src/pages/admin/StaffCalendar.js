import React, {useCallback, useEffect, useRef, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams, createSearchParams, useNavigate, useLocation} from 'react-router-dom'
import Swal from 'sweetalert2'
import parse from "date-fns/parse";
import { toast } from 'react-toastify'
import { apiGetServiceByAdmin } from 'apis/service'
import { apiGetAllStaffs, apiGetOrdersForStaffCalendar } from 'apis'
import clsx from 'clsx'
import { Calendar, momentLocalizer, dateFnsLocalizer } from 'react-big-calendar';
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSelector } from 'react-redux';
import bgImage from '../../assets/clouds.svg'
import { FaUsersViewfinder } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi'
import format from "date-fns/format";
import { IoNavigate } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";

const localizer = momentLocalizer(moment);

const StaffCalendar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [editService, setEditService] = useState(null)
  const [update, setUpdate] = useState(false)
  const [variant, setVariant] = useState(null)
  const [staffs, setStaffs] = useState([])
  const [services, setServices] = useState([])
  const { current } = useSelector((state) => state.user);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Service name");
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const locales = {
    "en-US": require("date-fns/locale/en-US")
  };

  const handleSelectSlot = ({ start }) => {
    if (view === "month") {
      setDate(start);
      setView("day");
    }
  };

  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs()
    if(response.success){
      setStaffs(response.staffs)
    }
  }
  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchService = async(params) => {
    const response = await apiGetServiceByAdmin()
    if(response?.success && response.services){
      setServices(response.services)
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
      })
    }
  }
  useEffect(() => {
    fetchService()
  }, [])

  const [selectedStaff, setSelectedStaff] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);

  const getEventDatePair = useCallback((dateStr, timeStr, duration) => {
    const ddmmyyArr = dateStr.split('/').map(Number)
    const hhmmArr = timeStr.split(':').map(Number)


    const startDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], hhmmArr[0], hhmmArr[1], 0)
    const endDate = moment(startDate).add(duration, 'm')

    return [startDate, endDate]
  }, []);


  const render = useCallback(() => {
    setUpdate(!update)
   })

  const fetchOrder = async(params) => {
    const payload = {
      provider_id: current.provider_id?._id,
      assigned_staff_ids: selectedStaff,
      service_ids: selectedServices
    }
    const response = await apiGetOrdersForStaffCalendar(payload)

    if (response?.orders) {
      const mappedEvents = response.orders.map((order, index) => {
        const { date, time } = order?.info[0];
        const { name } = order?.info[0]?.service;
        const { duration } = order?.info[0]?.service || 0;
        const datepair = getEventDatePair(date, time, duration);
        const service = order?.info[0]?.service;
        const staff = order?.info[0]?.staff;
        
        return {
            id: index,
            title: name,
            start: datepair[0],
            end: datepair[1].toDate(),
            service,
            staff
        };
      });
      setCalendarEvents(mappedEvents);
    } 
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
      })
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [selectedStaff, selectedServices])

  const eventStyleGetter = (event) => {
    const categoryColors = {
      "Hairstylist": "rgba(255, 0, 0, 0.5)",
      "Barber": "rgba(0, 255, 0, 0.5)",
      "Nail": "rgba(0, 0, 255, 0.5)",
      "Makeup": "rgba(255, 255, 0, 0.5)",
      "Tattoo": "rgba(255, 0, 255, 0.5)",
      "Massage": "rgba(0, 255, 255, 0.5)",
      "Gym": "rgba(255, 128, 0, 0.5)",
      "Yoga": "rgba(128, 0, 255, 0.5)",
      "Fitness": "rgba(255, 128, 128, 0.5)"
    };
    return {
        style: {
          backgroundColor: "#FFFFFF",
          borderLeft: `4px solid ${categoryColors[event?.service?.category] || "#3B82F6"}`,
          borderRadius: "4px",
          color: "#00143c",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          fontSize: "12px",
        }
      };
    };

  useEffect(() => {
    const updatedEvents = calendarEvents?.map((calendar) => {
      if (selectedOption === 'Service name') {
          return {
              ...calendar,
              title: calendar?.service?.name
          };
      }
      if (selectedOption === 'Employee name') {
          return {
              ...calendar,
              title: calendar?.staff?.lastName + ' ' + calendar?.staff?.firstName
          };
      }
      return calendar; // Trả về đối tượng gốc nếu không có điều kiện nào khớp
    });
    setCalendarEvents(updatedEvents);

  }, [selectedOption])
    
  const handleAddSelectedStaff = (staff) => {
    if(selectedStaff?.find(el => el === staff?._id)){
      setSelectedStaff(selectedStaff?.filter(el => el !== staff?._id))
    }
    else{
      setSelectedStaff([...selectedStaff, staff?._id])
    }
  }

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  });
  
  const handleSelectEvent = (event) => {
    setSelectedOrder(calendarEvents.find(order => order.id === event.id));
  };

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const goToCurrent = () => {
      toolbar.onNavigate("TODAY");
    };

    const getHeaderContent = () => {
      const date = toolbar.date;
      const view = toolbar.view;

      if (view === "month") {
        return format(date, "MMMM yyyy");
      } else if (view === "week") {
        const start = startOfWeek(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`;
      } else if (view === "day") {
        return format(date, "MMMM d, yyyy");
      }
    };

    const handleOptionClick = (option) => {
      setSelectedOption(option);
      setIsOpen(false);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 gap-1">
          <button
            onClick={goToCurrent}
            className="px-4 py-1 text-sm font-medium text-[#00143c] bg-[#edeff3] rounded-md hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={goToBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-lg">{getHeaderContent()}</span>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className='w-fit h-fit relative'>
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 text-sm font-medium text-[#00143c] bg-white border border-[b3b9c5] rounded-md hover:bg-gray-50 flex gap-1 items-center"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            Options
            <span className='font-semibold'><FaCaretDown /></span>
          </button>
          {isOpen && (
            <div
              ref={modalRef}
              className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out"
              role="dialog"
              aria-modal="true"
              aria-label="Options modal"
            >
              <div className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Show appointment titles as
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleOptionClick("Service name")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 ${selectedOption === "Service name" ? "bg-[#f2f6fe] text-[#005aee] font-medium" : "text-[#00143c] hover:bg-gray-100"}`}
                    role="menuitem"
                  >
                    Service name
                  </button>
                  <button
                    onClick={() => handleOptionClick("Employee name")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 ${selectedOption === "Employee name" ? "bg-[#f2f6fe] text-[#005aee] font-medium" : "text-[#00143c] hover:bg-gray-100"}`}
                    role="menuitem"
                  >
                    Employee name
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>

          <div className="border-l h-6 mx-2 border-gray-300" />
          <button
            onClick={() => toolbar.onView("month")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${toolbar.view === "month" ? "bg-[#005aee] text-white" : "bg-[#f4f6fa] text-[#00143c] hover:bg-gray-50"}`}
          >
            Month
          </button>
          <button
            onClick={() => toolbar.onView("week")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${toolbar.view === "week" ? "bg-[#005aee] text-white" : "bg-[#f4f6fa] text-[#00143c] hover:bg-gray-50"}`}
          >
            Week
          </button>
          <button
            onClick={() => toolbar.onView("day")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${toolbar.view === "day" ? "bg-[#005aee] text-white" : "bg-[#f4f6fa] text-[#00143c] hover:bg-gray-50"}`}
          >
            Day
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Calendar</span>
        </div>
        <div className='w-[95%] h-[fit] shadow-2xl rounded-md bg-white ml-4 mb-[200px] pt-[8px] flex flex-col gap-4'>
          <div className='w-full h-[116px] px-[20px] pb-[8px] flex'>
            <div onClick={() => setSelectedStaff([])} className={clsx('w-[92px] mr-[8px] p-[10px] rounded-md flex flex-col justify-start items-center cursor-pointer ease-in-out', selectedStaff?.length === 0 ? 'bg-[#e6effe]' : 'bg-white hover:bg-[#f2f6fe]')}>
              <div className='w-[48px] h-[48px] rounded-full mb-[8px] text-[#005aee] bg-white p-[12px] flex items-center justify-center text-2xl'>
                <FaUsersViewfinder />
              </div>
              <span className='text-xs text-[#00143c] text-center font-medium'>All Employees</span>
            </div>
            {
              staffs?.map((el, index) => {
                return (
                  <div onClick={()=>handleAddSelectedStaff(el)} className={clsx('w-[92px] mr-[8px] p-[10px] rounded-md flex flex-col justify-start items-center cursor-pointer ease-in-out', selectedStaff?.find(item => item === el?._id) ? 'bg-[#e6effe]' : 'bg-white hover:bg-[#f2f6fe]')} key={index}>
                    <img className='w-[48px] h-[48px] rounded-full mb-[8px]' src={el?.avatar} alt='avatarStaff'/>
                    <span className='text-xs text-[#00143c] text-center font-medium'>{`${el.lastName} ${el.firstName}`}</span>
                  </div>
                )
              })
            }
          </div>
          <div className='w-full text-[#00143c] px-[20px] pb-[8px]'>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable={true}
              eventPropGetter={eventStyleGetter}
              view={view}
              date={date}
              onView={setView}
              onNavigate={setDate}
              views={["month", "week", "day"]}
              components={{
                toolbar: CustomToolbar
              }}
            />
          </div>
          <div className='w-full z-[99] text-[#00143c]'>
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Booking Detail</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedOrder?.service?.thumb}
                        alt={selectedOrder?.service?.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{selectedOrder?.service?.name}</h3>
                        <p className="text-gray-600">{selectedOrder?.service?.category}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p><span className="font-semibold">Date:</span> {format(selectedOrder?.start, "PP")}</p>
                      <p><span className="font-semibold">Time:</span> {format(selectedOrder?.start, "p")} - {format(selectedOrder?.end, "p")}</p>
                      <p><span className="font-semibold">Duration:</span> {selectedOrder?.service?.duration}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Staff:</span>
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedOrder?.staff?.avatar}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{`${selectedOrder?.staff?.lastName} ${selectedOrder?.staff?.firstName}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-6">
                      <button
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        aria-label="Edit appointment"
                      >
                        <IoNavigate className="w-4 h-4" />
                        Go to detail
                      </button>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        aria-label="Close details"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffCalendar