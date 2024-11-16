import {apiGetProductByProviderId, apiGetServiceByProviderId, apiGetServiceProviderById, apiAddContactToCurrentUser, apiGetOneService, apiUpdateCartService, apiGetCouponsByServiceId } from 'apis'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom'
import defaultProvider from '../../assets/defaultProvider.jpg'
import clsx from 'clsx'
import { GrPrevious } from "react-icons/gr";
import path from 'ultils/path';
import { apiGetAllBlogs } from 'apis/blog';
import { BookingFromProvider, Pagination, Product, Service, Button, InputFormm, ServiceItem, ProductItem } from 'components'
import Masonry from 'react-masonry-css'
import { FaLocationDot, FaUserGear } from 'react-icons/fa6'
import Mapbox from 'components/Map/Mapbox'
import { FaAngleDown, FaAngleUp, FaChevronDown, FaChevronUp, FaRegClock, FaWindowClose } from "react-icons/fa";
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { RiCoupon3Fill } from "react-icons/ri";
import { CiClock1 } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import { MdOutlineSort } from "react-icons/md";

import { FaRegThumbsUp, FaRegThumbsDown, FaLocationArrow, FaExternalLinkAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux'
import avatarDefault from 'assets/avatarDefault.png'
import { useForm } from 'react-hook-form'
import { BsFillTagsFill } from 'react-icons/bs'
import { SlCalender } from 'react-icons/sl'
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import axios from 'axios';
import { formatPrice, formatPricee } from 'ultils/helper'
import moment from 'moment'
import { useSetState } from 'react-use'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { addDays, addMonths, endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'IXqHXe9w2riica5A829SuB6HUl5Fi1Yg7LC9OHF2';
const DetailProvider = () => {
    const navigate = useNavigate();
    const {current} = useSelector(state => state.user)
    const {v} = useParams();
    const {prid} = useParams()
    const [providerData, setProviderData] = useState(null)
    const [showMap, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);
    const [searchParams] = useSearchParams();
    const sid = searchParams.get('sid'); 
    const [variable, setVariable] = useState('')
    const [detailService, setDetailService] = useState(null)
    const currentUser = useSelector(state => state.user.current);
    const [service, setService] = useState(null)
    const [product, setProduct] = useState(null)
    
    const [totalService, setTotalService] = useState(0)
    const [totalProduct, setTotalProduct] = useState(0)

    const [params, setParams] = useSearchParams();
    const [findUs, setFindUs] = useState(false);
    
    const [address, setAddress] = useState('');
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [duration, setDuration] = useState(null)
    const [currentTime, setCurrentTime] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState({
      time: null,
      date: null,
      staff: null
      }
    )
    const [timeOptions, setTimeOptions] = useState([]);
    const [timeOptionsDateTime, setTimeOptionsDateTime] = useState([]);
    const [type, setType] = useState('Week')
    const [datetime, setDatetime] = useState(null)
    const [displayTime, setDisplayTime] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState(null)
    const intervalRef = useRef(null);
    const [flashSale, setFlashSale] = useState([])
    const [currentFlashSaleIndex, setCurrentFlashSaleIndex] = useState(0); // Thêm state để theo dõi chỉ số hiện tại
    const [showSort, setShowSort] = useState(false)
    const [showWorkingHours, setShowWorkingHours] = useState(false)

    useEffect(() => {
      const fetchServiceData = async() => {
        const response = await apiGetOneService(sid)
        if(response?.success){
          setDetailService(response?.service)
          setDuration(response?.service?.duration)
        }
      }
      if(sid){
        fetchServiceData()
      }
    }, [sid])
    
    useEffect(() => {
      setVariable(v)
    }, [v])

    const parseTimee = (time) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };

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

    const handleOnClick = async(time, el) => {
      setSelectedStaff({time, staff:el, date:new Date().toLocaleDateString()});
      const date = moment(new Date()).format("DD/MM/YYYY");
      const [day, month, year] = date.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      // // Kết hợp formattedDate và time để tạo datetime
      const dateTime = new Date(`${formattedDate}T${time}:00Z`);

      await apiUpdateCartService({
        service: detailService?._id, 
        provider: providerData?._id, 
        staff: el?._id, 
        time: time,
        duration: detailService?.duration,
        date: new Date().toLocaleDateString(),
        price: detailService?.price,
        dateTime: dateTime
      })
    }

    const handleOnClickDateTime = async(time) => {
      setSelectedTime(time);
      // Lấy date và chuyển đổi thành định dạng "yyyy-mm-dd"
      const date = moment(new Date(datetime)).format("DD/MM/YYYY");
      const [day, month, year] = date.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      // Kết hợp formattedDate và time để tạo datetime
      const dateTime = new Date(`${formattedDate}T${time}:00Z`);

      await apiUpdateCartService({
          service: detailService?._id,
          provider: providerData?._id,
          staff: selectedStaff?.staff?._id,
          duration: detailService?.duration,
          time: time,
          date: date,
          dateTime: dateTime, // datetime chứa cả date và time
          price: detailService?.price
      });
    }

    const [bookingDateTime, setBookingDateTime] = useState(false)
    useEffect(() => {
      const fetchData = () => {
        if (providerData && duration && !bookingDateTime) {
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
          
            const openingTime = parseTime(providerData?.time[openingTimeKey]);
            const closingTime = parseTime(providerData?.time[closingTimeKey]);
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
  
      intervalRef.current = setInterval(() => {
        fetchData();
      }, 10000);
  
      return () => clearInterval(intervalRef.current);
    }, [providerData, duration, bookingDateTime]);    

    useEffect(() => {
      if(mapContainer.current && variable === 'find-us'){
        goongjs.accessToken = GOONG_MAPTILES_KEY;

        map.current = new goongjs.Map({
            container: mapContainer.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: [105.83991, 21.02800],
            zoom: 9,
        });
      }
    }, [mapContainer.current, variable]);

    useEffect(() => {
      if (map.current && providerData && variable === 'find-us') {
        map.current.setCenter([providerData?.longitude || 105.83991, providerData?.latitude || 21.02800]);
        map.current.setZoom(15);
        
        // Remove existing markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while (markers[0]) {
            markers[0].parentNode.removeChild(markers[0]);
        }

        // Add new marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.02944 0 3 4.02944 3 9C3 13.9706 12 24 12 24C12 24 21 13.9706 21 9C21 4.02944 16.9706 0 12 0ZM12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12Z" fill="#3887be"/>
          </svg>
        `;
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.cursor = 'pointer';

        const marker = new goongjs.Marker(el)
            .setLngLat([providerData?.longitude || 105.83991, providerData?.latitude || 21.02800])
            .addTo(map.current)
    }
    }, [providerData, mapContainer.current, variable]);


    useEffect(() => {
        const fetchProviderData = async() => {
          const response = await apiGetServiceProviderById(prid)
          if(response?.success){
            setProviderData(response?.payload)
          }
        }
        fetchProviderData()
      }, [prid])
    
    useEffect(() => {
        const fetchData = async() => {
          if(variable === 'service' || variable === 'book'){
            const response = await apiGetServiceByProviderId(prid)
            setService(response?.services)
            setTotalService(response?.counts)
            setFindUs(false)
          }
          if(variable === 'product'){
            const response = await apiGetProductByProviderId(prid)
            setProduct(response?.products)
            setTotalProduct(response?.counts)
            setFindUs(false)
          }
          // if(variable === 'find-us'){
          //   Swal.fire({
          //     title: 'Chia sẻ vị trí',
          //     text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
          //     icon: 'question',
          //     showCancelButton: true,
          //     confirmButtonText: 'Chia sẻ',
          //     cancelButtonText: 'Không'
          //   }).then((result) => {
          //     if (result.isConfirmed) {
          //       if ("geolocation" in navigator) {
          //           navigator.geolocation.getCurrentPosition(position => {
          //           const { latitude, longitude } = position.coords;
          //           // Call the function to show the route using latitude and longitude
          //           showFindUs(latitude, longitude);
          //         }, () => {
          //           Swal.fire('Không thể lấy vị trí của bạn.');
          //         });
          //       } else {
          //         Swal.fire('Geolocation không khả dụng.');
          //       }
          //     }
          //   });
          // }
        }
        fetchData()
        setBooking(null)
        setBookingDateTime(null)
        setSelectedStaff({
          time: null,
          date: null,
          staff: null
          })
        setDetailService(null)
    }, [variable, prid]);

    const fetchServiceByProviderId = async (queries) =>{
      const response = await apiGetServiceByProviderId(prid, queries)
      if(response.success) setService(response?.services)
    }
  
    useEffect(() => {
      window.scrollTo(0,0)
      const queries = Object.fromEntries([...params])
      fetchServiceByProviderId(queries)
    }, [params])

   
    const showRoute = (userLat, userLng) => {
      // Logic to display the route from user's location to the service provider's location
      const providerLat = providerData?.latitude; // Assuming you have the provider's latitude
      const providerLng = providerData?.longitude; // Assuming you have the provider's longitude
      setUserLocation({ latitude: userLat, longitude: userLng });
      setProviderLocation({ latitude: providerLat, longitude: providerLng });

      if(userLat && userLng && providerLat && providerLng){
        setShowMap(true);
      }
      else{
        const errorMessage = !userLat || !userLng ? 'Thiếu thông tin địa chỉ của bạn.' : 'Thiếu thông tin địa chỉ của nhà cung cấp.';
        toast.error(errorMessage);
      }
      
    };

    const showFindUs = (userLat, userLng) => {
      // Logic to display the route from user's location to the service provider's location
      const providerLat = providerData?.latitude; // Assuming you have the provider's latitude
      const providerLng = providerData?.longitude; // Assuming you have the provider's longitude
      setUserLocation({ latitude: userLat, longitude: userLng });
      setProviderLocation({ latitude: providerLat, longitude: providerLng });

      if(userLat && userLng && providerLat && providerLng){
        setFindUs(true);
      }
      else{
        const errorMessage = !userLat || !userLng ? 'Thiếu thông tin địa chỉ của bạn.' : 'Thiếu thông tin địa chỉ của nhà cung cấp.';
        toast.error(errorMessage);
      }
      
    };

    const switchToChatWithProvider = async (event) => {
      if (!current?.chat_users?.includes(providerData.owner)) {
        let openSwalResult = await Swal.fire({
          title: 'Do You Want To Add This Provider To Your Contact?',
          showDenyButton: true,
          // showCancelButton: true,
          confirmButtonText: 'Yes',
          // denyButtonText: 'No',
          customClass: {
            cancelButton: 'order-1 right-gap',
            confirmButton: 'order-2',
            // denyButton: 'order-3',
          },
        });

        if (openSwalResult.isConfirmed) {
          let response = await apiAddContactToCurrentUser({uid: current?._id, ucid: providerData.owner});
          if (response?.success && response.contact) {
            navigate(`/${path.CHAT}`,{ state: { currenRedirectedChatUserId: providerData.owner } });
          }
        } 
        // else {

        // }
      }
      else {
        navigate(`/${path.CHAT}`,{ state: { currenRedirectedChatUserId: providerData.owner } })
      }
    }

    const handleShowDistance = () => {
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          // Call the function to show the route using latitude and longitude
          showRoute(latitude, longitude);
        }, () => {
          Swal.fire('Không thể lấy vị trí của bạn.');
        });
      } else {
        Swal.fire('Geolocation không khả dụng.');
      }
    }

    const [booking, setBooking] = useState(null)
    const [voucher, setVoucher] = useState([])
    const [showVoucher, setShowVoucher] = useState(false)
    const [selectedVoucher, setSelectedVoucher] = useState(null)
    const [discountValue, setDiscountValue] = useState(-1);

    const handleSelectedVoucher = (voucher) => {
      setSelectedVoucher(voucher)
    }

    const handleNextStepPrice = () => {
      setBooking(detailService?._id)
    }

    const fetchVoucher = async(serviceId) => {
      const response = await apiGetCouponsByServiceId(serviceId);
      setVoucher(response?.coupons)
    }
    useEffect(() => {
      if(booking){
        fetchVoucher(detailService?._id)
      }
    }, [booking])

    const canUseDiscount = (coupon) => {
      if (!currentUser) return false;
      
      const userUsage = coupon.usedBy.find(usage => usage.user.toString() === currentUser._id);
      
      return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
    };
  
    const usableDiscountCodes = voucher?.filter(canUseDiscount);

    useEffect(() => {
      const coupon = usableDiscountCodes?.find(el => el?.code === selectedVoucher?.code)
      if(coupon?.discount_type === 'percentage'){
        const percent = coupon?.percentageDiscount?.find(e => e.id === detailService?._id)?.value
        const discountPrice = Math.round(detailService?.price * (100-percent)/100)
        discountPrice === detailService?.price ? setDiscountValue(-1) : setDiscountValue(discountPrice)
      }
      if(coupon?.discount_type === 'fixed'){
        const fixed = coupon?.fixedAmount?.find(e => e.id === detailService?._id)?.value
        const discountPrice = Math.round(detailService?.price - fixed)
        discountPrice === detailService?.price ? setDiscountValue(-1) : setDiscountValue(discountPrice)
      }
    }, [selectedVoucher]);

    const handleResetBooking = () => {
      setBooking(null)
      setSelectedVoucher(null)
      setVoucher([])
      setShowVoucher(false)
      setDiscountValue(-1)
    }
    
    const handleCheckOut = async() => {
      if(!bookingDateTime){
        const finalPrice = +discountValue > 0 ? +discountValue : +detailService?.price;
        const date = moment(new Date()).format("DD/MM/YYYY");
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}`;
        const dateTime = new Date(`${formattedDate}T${selectedStaff?.time}:00Z`);
        await apiUpdateCartService({
          service: detailService?._id, 
          provider: providerData?._id, 
          staff: selectedStaff?.staff?._id, 
          time: selectedStaff?.time,
          duration: detailService?.duration,
          date: new Date().toLocaleDateString(),
          dateTime: dateTime,
          price: finalPrice,
        })
        if(selectedVoucher){
          window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedVoucher?.code}`, '_blank');
        }
        else {
          window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}`, '_blank');
        }
      }
      else{
        const finalPrice = +discountValue > 0 ? +discountValue : +detailService?.price;
        const date = moment(new Date(datetime)).format("DD/MM/YYYY");
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}`;
        const dateTime = new Date(`${formattedDate}T${selectedTime}:00Z`);

        await apiUpdateCartService({
          service: detailService?._id, 
          provider: providerData?._id, 
          staff: selectedStaff?.staff?._id, 
          time: selectedTime,
          duration: detailService?.duration,
          date: date,
          dateTime: dateTime,
          price: finalPrice,
        })
        if(selectedVoucher){
          window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}&couponCode=${selectedVoucher?.code}`, '_blank');
        }
        else {
          window.open(`/${path.CHECKOUT_SERVICE}?price=${finalPrice}`, '_blank');
        }
      }
    }

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

    const handleBookDateTime = (el) => {
      setSelectedStaff({time: null, staff:el, date:null})
      setBookingDateTime(true)
      setTimeOptions([])

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

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

    const isBackButtonDisabled = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const firstDayOfCurrentWeek = currentWeek[0].date;
      return firstDayOfCurrentWeek <= formattedDate;
    };

    const formattedDateRange = type === 'Week' ? `${format(currentWeek[0].date, 'MMMM dd, yyyy')} - ${format(currentWeek[currentWeek.length - 1].date, 'MMMM dd, yyyy')}` : `${format(displayTime, 'MMMM yyyy')}`;

    useEffect(() => {  
      const fetchData = () => {
        if (providerData) {
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
          const day = String(currentDate.getDate()).padStart(2, '0'); // Thêm số 0 vào trước nếu cần
  
          const formattedDate = `${year}-${month}-${day}`;
          if(datetime === formattedDate){
            console.log('test111')
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
                if (!timeString) return 0; 
                const [hour, minute] = timeString.split(':').map(Number);
                return hour * 60 + minute;
              };
            
              const openingTime = parseTime(providerData?.time[openingTimeKey]);
              const closingTime = parseTime(providerData?.time[closingTimeKey]);
            
              return { openingTime, closingTime };
            };
      
            const currentTime = getCurrentTime();
            const { openingTime, closingTime } = getOpeningHoursForToday();
      
            const generateTimeOptions = (openingTime, closingTime, currentTime, duration) => {
              console.log('check1');
              const timeOptions = [];
              if (openingTime>=0 && closingTime>=0 && duration>=0) {
                let currentHour = Math.floor(currentTime / 100);
                let currentMinute = currentTime % 100;
                let currentTimeInMinutes = currentHour * 60 + currentMinute;
                let serviceDurationInMinutes = duration;
                let saveOpeningTime = openingTime
    
                setTimeOptionsDateTime([])
    
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
      
            setTimeOptionsDateTime(generateTimeOptions(openingTime, closingTime, currentTime, duration));
          }
          else{
            const getOpeningHoursForToday = () => {
              console.log('test222')
              const dateObject = new Date(datetime);
              const dayOfWeek = dateObject.getDay();
              const openingTimeKey = `start${dayOfWeek === 0 ? 'sunday' : dayOfWeek === 1 ? 'monday' : dayOfWeek === 2 ? 'tuesday' : dayOfWeek === 3 ? 'wednesday' : dayOfWeek === 4 ? 'thursday' : dayOfWeek === 5 ? 'friday' : 'saturday'}`;
              const closingTimeKey = `end${dayOfWeek === 0 ? 'sunday' : dayOfWeek === 1 ? 'monday' : dayOfWeek === 2 ? 'tuesday' : dayOfWeek === 3 ? 'wednesday' : dayOfWeek === 4 ? 'thursday' : dayOfWeek === 5 ? 'friday' : 'saturday'}`;

              const parseTime = (timeString) => {
                if(!timeString){
                  return 0
                }
                const [hour, minute] = timeString.split(':').map(Number);
                return hour * 60 + minute;
              };
            
              const openingTime = parseTime(providerData?.time[openingTimeKey]);
              const closingTime = parseTime(providerData?.time[closingTimeKey]);
            
              return { openingTime, closingTime };
            };
            const { openingTime, closingTime } = getOpeningHoursForToday();
      
            const generateTimeOptions = (openingTime, closingTime, duration) => {
              console.log('check2')
              const timeOptions = [];
              if (openingTime>=0 && closingTime>=0 && duration>=0) {
                let serviceDurationInMinutes = duration;
                let saveOpeningTime = openingTime
                setTimeOptionsDateTime([])
    
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
      
            setTimeOptionsDateTime(generateTimeOptions(openingTime, closingTime, duration));
          }
        }
      }
  
      fetchData(); 
  
      const interval = setInterval(() => {
        fetchData();
      }, 10000);
  
      return () => clearInterval(interval);
    }, [datetime]);

    const getCurrentTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      return hour * 60 + minute;
    };
  

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
  
    const handleResetChooseEmployee = () => {
      setSelectedStaff({time: null, staff:null, date:null})
      setTimeOptions([])
      setTimeOptionsDateTime([])
      setBookingDateTime(false)
      setSelectedTime(null)
      setDatetime(null)
    }


    return (
    <div className='w-full'>
      <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
        <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/service`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'service' && 'border-b-2 border-[#15a9e8]')}>Service</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/book`); setBooking(null); setBookingDateTime(null); setDetailService(null); setSelectedStaff({time: null,date: null,staff: null}) }} className={clsx('font-semibold cursor-pointer capitalize', variable === 'book' && 'border-b-2 border-[#15a9e8]')}>Book Now</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/product`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'product' && 'border-b-2 border-[#15a9e8]')}>Product</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/blog`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'blog' && 'border-b-2 border-[#15a9e8]')}>Blog</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/find-us`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'find-us' && 'border-b-2 border-[#15a9e8]')}>Find us</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/faq`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'faq' && 'border-b-2 border-[#15a9e8]')}>FAQ</span>
          <span onClick={()=>{navigate(`/detail_provider/${providerData?._id}/chat`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'chat' && 'border-b-2 border-[#15a9e8]')}>Chat</span>
        </div>
      </div>
      <div className='w-full h-[86px]'></div>
      {
        variable === 'service' &&
        <>
          <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
              <div className='w-full flex justify-between'>
                <span className='text-[22px] font-semibold'>Services</span>
                <div className='relative'>
                  <Button handleOnclick={()=>{setShowSort(prev => !prev)}} style={'px-[23px] rounded-l-full rounded-r-full text-white border border-[##e6ebef] w-fit h-[40px] flex items-center gap-2'}><MdOutlineSort />Sort by</Button>
                  {
                    showSort && 
                    <div className='absolute w-[160px] h-[152px] px-[8px] py-[6px] bg-[#212529] rounded-md right-0 mt-2 z-50 flex flex-col'>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (lowest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (highest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Popularity</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (ascending)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (descending)</span>
                    </div>
                  }
                </div>
              </div>
              <div className='w-full h-full flex gap-6'>
                <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                  <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                    <span className='text-xl'><CiSearch size={20}/></span>
                    <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search services'/>
                  </div>
                </div>
                <div className='w-[80%] h-full mt-[32px]'>
                  <div className='flex flex-wrap gap-4'>
                    {
                      service?.map((el,index) => (
                        <div key={index} className='w-[31%]'>
                          <ServiceItem serviceData={el} providerData={providerData}/>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      {
        (variable === 'book') &&
        <>
        <div className={clsx('w-full h-[fit] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
          <div className='w-[90%] flex gap-8'>
              {
                !sid ? 
                <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4'>
                  <div className='w-full h-[40px] flex justify-between items-center'>
                    <span className='text-[18px] font-semibold'>Choose Service</span>
                    <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                      <span className='text-xl'><CiSearch size={20}/></span>
                      <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search services'/>
                    </div>
                  </div>
                  <div className='w-full flex flex-col gap-4'>
                    {service?.map((el, index) => 
                      <BookingFromProvider providerData={providerData} serviceData={el}/>
                    )}
                  </div>
                </div>
                :
                (!booking 
                ?
                (
                  !bookingDateTime ?
                  <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4'>
                    <div className='flex w-full justify-between items-center'>
                      <span className='text-[18px] leading-6 font-semibold'>Choose Employee</span>
                      <div className='w-[187px] h-[40px] flex gap-1 items-center border focus-within:border-[#15a9e8] rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                        <span className='text-xl'><CiSearch size={20}/></span>
                        <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search employee'/>
                      </div>
                    </div>

                    <div>
                    {detailService?.assigned_staff?.map((el, index) => (
                      <div key={index} className='border border-gray-300 px-2 py-2 rounded-md my-2'>
                        <div className='flex justify-between'>
                          <div className='flex items-center gap-1'>
                            <img src={el?.avatar} className='w-16 h-16 rounded-full' alt={el?.firstName} />
                            <span>{`${el.lastName} ${el.firstName}`}</span>
                          </div>
                          <Button style='px-6 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit' handleOnclick={()=>handleBookDateTime(el)}>Choose</Button>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <span className='text-xs leading-4'>Available</span>
                          <div className=' text-xs leading-4 font-medium w-fit h-fit bg-[#12ae51] px-[2px] py-[1px] rounded-md text-white'>Today</div>
                        </div>
                        <div className='flex flex-wrap gap-2 my-3 justify-center'>
                          {timeOptions.length <= 0 ?
                              <h5 className='text-red-500'>Service is not available today</h5>
                              :
                            timeOptions.map((time, idx) => (
                            (!el.work || !isWorkingTime(time, el.work)) && (
                              <div className={clsx('w-[15%] h-[46px] border border-[#868e96] bg-[#343a40] rounded-md cursor-pointer flex items-center justify-center gap-1 hover:bg-[rgba(32,44,51,1)] hover:border-none', (selectedStaff.time===time && selectedStaff.staff===el) && 'bg-[rgba(32,44,51,1)] border-none')} key={idx} onClick={() =>{handleOnClick(time,el)}}>
                                <span className='text-[14px] leading-5 font-medium'>{time}</span>
                                <span className='text-[12px] leading-4 text-[#868e96]'>{parseInt(time.split(':')[0]) >= 12 ? 'pm' : 'am'}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                  :
                  <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4'>
                    <div className='flex gap-2 items-center'>
                      <div onClick={handleResetChooseEmployee} className='w-[40px] h-[40px] rounded-md flex items-center justify-center border border-[#868e96] cursor-pointer'><GrPrevious size={20}/></div>
                      <span className='text-[18px] leading-6 font-semibold'>Choose Date & Time</span>
                    </div>
                    <div className='flex justify-between'>
                      <div className='flex'>
                      <div className={clsx('px-[15px] py-[10px] rounded-l-md cursor-pointer text-[14px] font-medium flex items-center justify-center', type === 'Week' ? 'bg-[#15a9e8] text-white' : 'bg-[#343a40]')} onClick={()=>{setType('Week'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Week</div>
                      <div className={clsx('px-[15px] py-[10px] rounded-r-md cursor-pointer text-[14px] font-medium flex items-center justify-center', type === 'Month' ? 'bg-[#15a9e8] text-white' : 'bg-[#343a40]')} onClick={()=>{setType('Month'); setDatetime(); setDisplayTime(new Date()); setSelectedTime()}}>Month</div>
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
                            <div className={clsx('w-full h-[72px] flex items-center justify-center border border-[#868e96] rounded-md cursor-pointer bg-[#343a40]', date === datetime && 'bg-[rgba(21,169,232,0.1)] border-[rgba(22,157,215,1)]')} onClick={()=>{setDatetime(date); setSelectedTime()}}>{format(new Date(date), 'dd')}</div>
                          </div>
                        ))
                      ) : 
                      (
                          currentMonth?.map(({ date, dayOfMonth }) => (
                            <div key={date} className='w-[12%] flex flex-col items-center gap-2'>
                              <div className='font-semibold text-xs'>{dayOfMonth.slice(0, 3)}</div>
                              <div className={clsx('w-full h-[72px] flex items-center justify-center border border-[#868e96] rounded-md bg-[#343a40]', date === datetime && 'bg-[rgba(21,169,232,0.1)] border-[rgba(22,157,215,1)]',new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')} 
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
                          !timeOptionsDateTime.length ?
                            <h5 className='text-red-500'>Service is not available on {moment(datetime, 'YYYY-MM-DD').format('DD/MM/YYYY')}</h5>
                            : timeOptionsDateTime?.map((time, idx) => (
                            (!selectedStaff?.staff?.work || !isWorkingTime(time, selectedStaff?.staff?.work)) && (
                              <div className={clsx('w-[23%] h-[48px] flex items-center justify-center border border-[#868e96] rounded-md bg-[#343a40] hover:bg-[rgba(32,44,51,1)] hover:border-none cursor-pointer', selectedTime===time && 'bg-[rgba(32,44,51,1)] border-none')} key={idx} onClick={() =>{handleOnClickDateTime(time)}}>
                                <span className='text-[14px] leading-5 font-medium'>{time}</span>
                                <span className='text-[12px] leading-4 text-[#868e96]'>{parseInt(time.split(':')[0]) >= 12 ? 'pm' : 'am'}</span>
                              </div>
                            )
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )
                :
                <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4'>
                  <div className='flex items-center gap-2'>
                    <div onClick={handleResetBooking} className='w-[40px] h-[40px] rounded-md flex items-center justify-center border border-[#868e96] cursor-pointer'><GrPrevious size={20}/></div>
                    <span className='text-[18px] leading-6 font-semibold'>Checkout</span>
                  </div>
                  <div className='w-full bg-[rgba(32,50,61,1)] rounded-md flex flex-col gap-2 p-[12px]'>
                    <div className='flex justify-between items-center'>
                      <span className='text-[14px] leading-5 font-medium'>Total price</span>
                      <div className='flex gap-2 items-center'>
                        <span className={clsx('text-[22px] leading-7 text-[#15a9e8] font-semibold', discountValue > 0 && 'text-lg font-medium line-through')}>{`${formatPrice(formatPricee(detailService?.price))} VNĐ`}</span>
                        {discountValue > 0 && <span className='text-[22px] leading-7 text-[#15a9e8] font-semibold'>{`${formatPrice(formatPricee(discountValue))} VNĐ`}</span>}
                      </div>
                    </div>
                    <div className='p-[6px]'> 
                      You can make payment online or directly at the appointment location.
                    </div>
                  </div>
                  <div className='w-1/2 flex justify-between items-center bg-[rgba(32,50,61,1)] p-[12px] rounded-md'>
                    <span>Choose a voucher</span>
                    <span onClick={()=>{setShowVoucher(prev=>!prev)}} className='cursor-pointer p-2 border border-[#868e96] rounded-full'>{!showVoucher ? <FaAngleDown /> : <FaAngleUp />}</span>
                  </div>
                  {showVoucher && 
                    (
                      usableDiscountCodes?.length > 0 
                      ? 
                      <div className='flex flex-col gap-1 w-1/2 p-[6px] bg-white h-fit max-h-[180px] overflow-y-scroll scrollbar-thin'>
                        {usableDiscountCodes?.map((el, index) => (
                          <div onClick={()=>handleSelectedVoucher(el)} key={index} className={clsx('w-full flex items-center cursor-pointer', el?._id === selectedVoucher?._id ? 'bg-gray-400' : 'hover:bg-gray-200')}>
                            <div className='w-[20%]'>
                              <img src={el?.image} className='w-[80px] h-[60px] object-cover rounded-sm'/>
                            </div>
                            <div className='w-[80%] pl-[12px] flex flex-col justify-between text-black'>
                              <span className='text-lg line-clamp-1'>{el?.name}</span>
                              <div className='flex gap-4 items-center justify-between'>
                                <span className='text-[#15a9e8] text-sm font-medium line-clamp-1'>{el?.code}</span>
                                <div className='px-[6px] py-[1px] bg-[#15a9e8] rounded-md'>
                                  {
                                  el?.discount_type === 'fixed' 
                                  ? `-${el?.fixedAmount?.find(e => e.id === detailService?._id)?.value}VNĐ` 
                                  : `-${el?.percentageDiscount?.find(e => e.id === detailService?._id)?.value}%`
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
                        
                </div>)
              }
              <div className='w-[30%] flex flex-col gap-4'>
                <div className='h-fit pt-[20px] pb-[16px] bg-[#212529] mt-[32px] rounded-md'>
                  <div className='border-b border-[#868e96] w-full h-[49px] pl-[20px] pr-[12px] py-[12px] text-[18px] font-semibold leading-6'>Booking Details</div>
                  <div className='px-[8px] pt-[8px]'>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center'>
                        <FaLocationDot color='#1696ca'/>
                        <span className='text-[12px] text-[#868e96] font-medium'>Location</span>
                      </div>
                      <div className='w-full pl-[26px] flex flex-col gap-1'>
                        <span className='text-[13px] font-medium'>{providerData?.bussinessName}</span>
                        <span className='text-[#868e96] text-[12px] leading-4 line-clamp-2'>{providerData?.address}</span>
                      </div>
                    </div>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span className={clsx(detailService && 'text-[#1696ca]')}><BsFillTagsFill/></span>
                        <span>Service</span>
                      </div>
                      {detailService &&
                        <div className='w-full pl-[26px] flex flex-col gap-1'>
                          <span className='text-[13px] font-medium'>{detailService?.name}</span>
                        </div>
                      }
                    </div>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span className={clsx(selectedStaff?.staff && 'text-[#1696ca]')}><FaUserGear /></span>
                        <span>Employee</span>
                      </div>
                      {selectedStaff?.staff &&
                        <div className='w-full pl-[26px] flex flex-col gap-1'>
                          <span className='text-[13px] font-medium'>{`${selectedStaff?.staff?.lastName} ${selectedStaff?.staff?.firstName}`}</span>
                        </div>
                      }
                    </div>
                    <div className='w-full p-[8px]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span className={clsx(!bookingDateTime ? (selectedStaff?.date && selectedStaff?.time && 'text-[#1696ca]') : (selectedTime && beforeCheckout() && 'text-[#1696ca]'))}><SlCalender /></span>
                        <span>Date & Time</span>
                      </div>
                      {
                        !bookingDateTime 
                        ? 
                        (
                          selectedStaff?.date && selectedStaff?.time &&
                            <div className='w-full pl-[26px] flex flex-col gap-1'>
                              <span className='text-[13px] font-medium'>{`${selectedStaff?.date} ${selectedStaff?.time}`}</span>
                            </div>
                        )
                        :
                        (
                          selectedTime && beforeCheckout() &&
                            <div className='w-full pl-[26px] flex flex-col gap-1'>
                              <span className='text-[13px] font-medium'>{`${new Date(datetime).toLocaleDateString()} ${selectedTime}`}</span>
                            </div>
                        )
                      }
                    </div>
                  </div>
                </div>
                {
                  booking 
                  ? 
                  <Button handleOnclick={handleCheckOut} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}>Checkout</Button>
                  :
                  (
                    !bookingDateTime 
                    ?
                    (selectedStaff?.staff && selectedStaff?.date && selectedStaff?.time && parseTimee(selectedStaff?.time) >= currentTime) &&
                    <Button handleOnclick={handleNextStepPrice} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}>Continue</Button>
                    :
                    (selectedTime && beforeCheckout()) &&
                    <Button handleOnclick={handleNextStepPrice} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}>Continue</Button>
                  )
                }
              </div>
          </div>
        </div>
        </>
      }
      {
        variable === 'find-us' &&
        <>
          <div className={clsx('w-full h-[fit] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%]'>
              <div className='w-[800px] h-fit pt-[24px] pb-[48px] mx-auto flex flex-col gap-8'>
                <div className='w-full text-[22px] leading-7 font-semibold'>Location</div>
                <div className='w-full h-fit p-[20px] border border-[#868e96] rounded-md bg-[#212529] flex flex-col gap-6'>
                  <div className='w-full flex items-center justify-between h-[40px]'>
                    <span className='text-[22px] font-semibold leading-7'>{providerData?.bussinessName}</span>
                    <Button handleOnclick={handleShowDistance} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}>Show distance</Button>
                  </div>
                  <div className='w-full h-fit flex gap-8'>
                    <div className='flex flex-1 flex-col gap-2'>
                      <div className='w-full h-[40px] flex gap-2 items-center text-[#868e96]'>
                        <FaLocationDot />
                        <span className='text-[14px] leading-5 font-normal text-white'>{providerData?.address}</span>
                      </div>
                      <div className='w-full flex flex-col gap-4'>
                        <div className='w-full h-[24px] flex gap-2 items-center text-[#868e96]'>
                          <FaRegClock />
                          <span className='text-[14px] leading-5 font-normal text-white'>Working Hours</span>
                          <span onClick={()=>{setShowWorkingHours(prev => !prev)}} className='cursor-pointer'>{!showWorkingHours ? <FaChevronDown /> : <FaChevronUp />}</span>
                        </div>
                        {
                          showWorkingHours &&
                          <div className='w-full pl-[36px] flex flex-col gap-2'>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Monday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startmonday} - ${providerData?.time?.endmonday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Tuesday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.starttuesday} - ${providerData?.time?.endtuesday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Wednesday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startwednesday} - ${providerData?.time?.endwednesday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Thursday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startthursday} - ${providerData?.time?.endthursday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Friday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startfriday} - ${providerData?.time?.endfriday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Saturday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startsaturday} - ${providerData?.time?.endsaturday}`}</span>
                            </div>
                            <div className='w-full flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Sunday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startsunday} - ${providerData?.time?.endsunday}`}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    <div className='flex flex-1 flex-col h-[188px]'>
                      {/* Hiển thị bản đồ */}
                      <div className='w-full h-full rounded-lg' ref={mapContainer} style={{ zIndex: 1000 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            showMap && 
            <div className='w-full h-full z-[1000] fixed top-0 left-0 bg-overlay flex items-center justify-center'>
              <div className='w-[800px] h-[600px] border-2 border-[#868e96] rounded-md relative'>
                <Mapbox userCoords={userLocation} providerCoords={providerLocation} small={true}/>
                <div onClick={()=>setShowMap(false)} className='w-fit h-fit absolute top-2 right-2 cursor-pointer hover:text-[#868e96]'><FaWindowClose size={20}/></div>
              </div>
            </div>
          }
        </>
      }
      {
        variable === 'product' &&
        <>
          <div className={clsx('w-full h-[fit] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
              <div className='w-full flex justify-between'>
                <span className='text-[22px] font-semibold'>Services</span>
                <div className='relative'>
                  <Button handleOnclick={()=>{setShowSort(prev => !prev)}} style={'px-[23px] rounded-l-full rounded-r-full text-white border border-[##e6ebef] w-fit h-[40px] flex items-center gap-2'}><MdOutlineSort />Sort by</Button>
                  {
                    showSort && 
                    <div className='absolute w-[160px] h-[152px] px-[8px] py-[6px] bg-[#212529] rounded-md right-0 mt-2 z-50 flex flex-col'>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (lowest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (highest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Popularity</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (ascending)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (descending)</span>
                    </div>
                  }
                </div>
              </div>
              <div className='w-full h-full flex gap-6'>
                <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                  <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                    <span className='text-xl'><CiSearch size={20}/></span>
                    <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search products'/>
                  </div>
                </div>
                <div className='w-[80%] h-full mt-[32px]'>
                  <div className='flex flex-wrap gap-4'>
                    {
                      product?.map((el,index) => (
                        <div key={index} className='w-[31%]'>
                          <ProductItem productData={el}/>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      <div className={clsx('w-full h-[229px]', providerData?.theme === 'dark' ? 'bg-[rgba(33,37,41,0.5)]' : 'bg-[rgba(248,249,250,0.5)]')}>

      </div>
    </div>
  )
}

export default DetailProvider





