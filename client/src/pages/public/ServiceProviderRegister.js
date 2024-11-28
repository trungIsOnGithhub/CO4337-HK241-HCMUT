import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from '../../components';
import {apiFinalRegister } from "../../apis/user";
import { apiCreateServiceProvider, apiFinalRegisterProvider } from "../../apis/ServiceProvider";
import Swal from 'sweetalert2';
import {Link, useNavigate, useSearchParams } from 'react-router-dom';
import path from "../../ultils/path";
import { useDispatch } from 'react-redux';
import { validate } from "ultils/helper";
import { HashLoader } from "react-spinners";
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import axios from 'axios';
import clsx from "clsx";
import bg1 from "../../assets/bg1.jpg"
import bg2 from "../../assets/bg2.jpg"
import bg3 from "../../assets/bg3.jpg"
import bg4 from "../../assets/bg4.jpg"
import bg5 from "../../assets/bg5.jpg"
import { FaCalendarAlt, FaCamera, FaClock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";


const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'hzX8cXab72XCozZSYvZqkV26qMMQ8JdpkiUwK1Iy';

const ServiceProviderRegister = () => {
    const navigate = useNavigate()
    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatar: null,
        images: null,
        mobile: '',
        password: '',
        bussinessName: '',
        address: '',
    });
    const [timeOpenPayload, setTimeOpenPayload] = useState({
        startmonday: '', endmonday: '', isworkingmonday: true,
        starttuesday: '', endtuesday: '', isworkingtuesday: true,
        startwednesday: '', endwednesday: '', isworkingwednesday: true,
        startthursday: '', endthursday: '', isworkingthursday: true,
        startfriday: '', endfriday: '', isworkingfriday: true,
        startsaturday: '', endsaturday: '', isworkingsaturday: true,
        startsunday: '', endsunday: '', isworkingsunday: true,
    });
    const [isVerify, setIsVerify] = useState(false);
    const [invalidField, setInvalidField] = useState([]);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [searchParams] = useSearchParams();
    const [isInTimeForm, setIsInTimeForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState('');
    const [isMapVisible, setIsMapVisible] = useState(false); // State to control map visibility
    const [addressSuggestions, setAddressSuggestions] = useState([]); // State for address suggestions

    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});

    const [previewImage, setPreviewImage] = useState(null);
    const [previewImageProvider, setPreviewImageProvider] = useState(null)
    const [showPassword, setShowPassword] = useState(false);

    const mapContainer = useRef(null);
    const map = useRef(null);
    const suggestionRef = useRef(null);

    const handleClickOutside = (event) => {
        if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
            setAddressSuggestions([]); // Ẩn gợi ý nếu nhấp ra ngoài
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setPayload({ ...payload, avatar: file });
          setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleImageProviderChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPayload({ ...payload, images: file });
            setPreviewImageProvider(URL.createObjectURL(file));
        }
    };

    const daysInWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const [selectedBackground, setSelectedBackground] = useState("bg1");


    useEffect(() => {
        resetPayload();
    }, [isRegister]);



    useEffect(() => {
        goongjs.accessToken = GOONG_MAPTILES_KEY;

        map.current = new goongjs.Map({
            container: mapContainer.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: [105.83991, 21.02800],
            zoom: 9,
        });
    }, []);

    useEffect(() => {
        if (isMapVisible && map.current) {
            map.current.resize(); // Resize the map when it becomes visible
        }
    }, [isMapVisible]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const resetPayload = () => {
        setPayload({
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            password: '',
            bussinessName: '',
            address: '',
        });
        setTimeOpenPayload({
           startmonday: '', endmonday: '', isworkingmonday: true,
            starttuesday: '', endtuesday: '', isworkingtuesday: true,
            startwednesday: '', endwednesday: '', isworkingwednesday: true,
            startthursday: '', endthursday: '', isworkingthursday: true,
            startfriday: '', endfriday: '', isworkingfriday: true,
            startsaturday: '', endsaturday: '', isworkingsaturday: true,
            startsunday: '', endsunday: '', isworkingsunday: true,
        });
    };

    const handleSubmit = async() => {
        validateFormFinish()
        if (Object.keys(errors).length === 0) {
            setIsLoading(true)
            payload.time = {}
            for (const day of daysInWeek) {
                const startKey = `start${day}`;
                const endKey = `end${day}`;
                if(timeOpenPayload[`isworking${day}`]){
                    payload.time[startKey] = timeOpenPayload[startKey];
                    payload.time[endKey] = timeOpenPayload[endKey];
                }
                else{
                    payload.time[startKey] = "";
                    payload.time[endKey] = "";
                }
            }
            if (coordinates) {
                console.log(coordinates);
                payload.longitude = coordinates.lng;
                payload.latitude = coordinates.lat;
                payload.geolocation = {
                    type: "Point",
                    coordinates: [coordinates.lng,coordinates.lat]
                }
            } else {
                Swal.fire('Opps!', 'Please check your location on the map', 'error');
                return;
            }
            payload.role = 1411;
            console.log(payload)
            const formData = new FormData()
            for(let i of Object.entries(payload)){
                formData.append(i[0],i[1])
            }
            formData.delete('time');
            for (let [key, value] of Object.entries(payload.time)) {
                formData.append(`time[${key}]`, value);
            }

            formData.delete('geolocation')
            formData.append('geolocation.type', payload.geolocation.type);
            formData.append('geolocation.coordinates[0]', payload.geolocation.coordinates[0]); // longitude
            formData.append('geolocation.coordinates[1]', payload.geolocation.coordinates[1]); // latitude

            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            let response = await apiCreateServiceProvider(formData);
            setIsLoading(false)
            if (response.success) {
                setIsVerify(true);
            } else {
                Swal.fire('Opps!', response.mes, 'error');
                return;
            }
        }
    }

    const finalRegister = async () => {
        const res = await apiFinalRegisterProvider(verificationCode.join(""));
        if (res.success) {
            Swal.fire('Congratulations!', res.mes, 'success').then(() => {
                setIsRegister(false);
                resetPayload();
            });
        } else {
            Swal.fire('Opps!', res.mes, 'error');
        }
        setIsVerify(false)
        setVerificationCode(["", "", "", "", "", ""]);
    };

    const applyTimeToAllDays = () => {
        const newTimeOpenPayload = { ...timeOpenPayload };
        for (const day of daysInWeek) {
            newTimeOpenPayload[`start${day}`] = timeOpenPayload.startmonday;
            newTimeOpenPayload[`end${day}`] = timeOpenPayload.endmonday;
        }
        setTimeOpenPayload(newTimeOpenPayload);
    };


    const updateAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await axios.get(`https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`);
            const data = await response.data;

            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address; // Get the formatted address
                setPayload(prev => ({ ...prev, address })); // Update the address in the payload
            }
        } catch (error) {
            console.error('Error fetching address from coordinates:', error);
        }
    };

    const handleCheckLocation = async () => {
        try {
            const response = await axios.get(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(payload.address)}&api_key=${GOONG_API_KEY}`);
            const data = await response.data;

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setCoordinates({ lat, lng });
                setError('');
                setIsMapVisible(true); // Show map when location is found

                // Update the payload with the coordinates
                setPayload(prev => ({ ...prev, longitude: lng, latitude: lat, province: data.results[0].compound.province }));

                if (map.current) {
                    map.current.setCenter([lng, lat]);
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
                        .setLngLat([lng, lat])
                        .addTo(map.current)
                        .setDraggable(true); // Make the marker draggable

                    // Enable dragging the marker
                    marker.on('dragend', async () => {
                        const lngLat = marker.getLngLat();
                        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
                        await updateAddressFromCoordinates(lngLat.lat, lngLat.lng); // Update address input
                    });
                } else {
                    console.error('Map not initialized');
                }
            } else {
                setCoordinates(null);
                setError('Invalid location');
            }
        } catch (error) {
            console.error('Error in handleCheckLocation:', error);
            setCoordinates(null);
            setError('Error fetching location');
        }
    };

    const handleAddressKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCheckLocation();
        }
    };

    const handleCloseMap = () => {
        setIsMapVisible(false);
    };

    const handleAddressInputChange = async (e) => {
        const value = e.target.value;
        setPayload(prev => ({ ...prev, address: value })); // Update address in payload

        if (value.length > 2) {
            try {
                const response = await axios.get(`https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(value)}`);
                const data = await response.data;
                setAddressSuggestions(data.predictions || []); // Set suggestions
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
            }
        } else {
            setAddressSuggestions([]); // Clear suggestions if input is less than 3 characters
        }
    };

    const handleSuggestionSelect = async (suggestion) => {
        setPayload(prev => ({ ...prev, address: suggestion.description })); // Set selected address
        setAddressSuggestions([]); // Clear suggestions
    
        try {
            // Fetch the coordinates for the selected address
            const response = await axios.get(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(suggestion.description)}&api_key=${GOONG_API_KEY}`);
            const data = await response.data;
    
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setCoordinates({ lat, lng });
                setIsMapVisible(true);
                setPayload(prev => ({ ...prev, province: data.results[0].compound.province }));
                if (map.current) {
                    map.current.setCenter([lng, lat]);
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
                        .setLngLat([lng, lat])
                        .addTo(map.current)
                        .setDraggable(true); // Make the marker draggable
                    
                    marker.on('dragend', async () => {
                        const lngLat = marker.getLngLat();
                        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
                        await updateAddressFromCoordinates(lngLat.lat, lngLat.lng); // Update address input
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching coordinates for selected address:', error);
        }
    };

    
    const backgroundOptions = {
        bg1: bg1,
        bg2: bg2,
        bg3: bg3,
        bg4: bg4,
        bg5: bg5
      };

    const [step, setStep] = useState(1)

    const [registerText1, setRegisterText1] = useState("")
    const fullRegisterText1 = "Step 1 of 2: Personal Information"
    const [currentRegisterIndex1, setCurrentRegisterIndex1] = useState(0);

    const [registerText2, setRegisterText2] = useState("")
    const fullRegisterText2 = "Step 2 of 2: Business Details"
    const [currentRegisterIndex2, setCurrentRegisterIndex2] = useState(0);
    
    useEffect(() => {
        if (currentRegisterIndex1 < fullRegisterText1.length && +step === 1) {
            const timeout = setTimeout(() => {
                setRegisterText1(fullRegisterText1.substring(0, currentRegisterIndex1 + 1));
                setCurrentRegisterIndex1(currentRegisterIndex1 + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [currentRegisterIndex1, step]);

    useEffect(() => {
        if (currentRegisterIndex2 < fullRegisterText2.length && +step === 2) {
            const timeout = setTimeout(() => {
                setRegisterText2(fullRegisterText2.substring(0, currentRegisterIndex2 + 1));
                setCurrentRegisterIndex2(currentRegisterIndex2 + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [currentRegisterIndex2, step]);

    const handleInputChange = (e) => {
            const { name, value } = e.target;
            setPayload({ ...payload, [name]: value });
      };
    const validateForm = () => {
    const newErrors = {};
    if (!payload.avatar) newErrors.avatar = "Avatar is required";
    if (!payload.firstName.trim()) newErrors.firstName = "First name is required";
    if (!payload.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!payload.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        newErrors.email = "Invalid email format";
    }
    if (!payload.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
    } else if (!/^(\+84|0)\d{9}$/.test(payload.mobile)) {
        newErrors.mobile = "Invalid mobile number";
    }
    if (!payload.password) {
        newErrors.password = "Password is required";
    } else if (payload.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
    }
    return newErrors;
    };

    const validateFormFinish = () => {
        if (!payload.bussinessName.trim()) {
            setErrors((prev) => ({
                ...prev,
                bussinessName: 'Business name is required'
            }));
        }
        if (!payload.address.trim()) {
            setErrors((prev) => ({
                ...prev,
                address: 'Business address is required'
            }));
        }
        if (!payload.images){
            setErrors((prev) => ({
                ...prev,
                images: 'Images is required'
            }));
        }
    }
    
    const handleNextStep = () => {
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            setStep(2);
            setCurrentRegisterIndex1(0); 
            setCurrentRegisterIndex2(0)
        }
    }

    
    const handleWorkingChange = (day, checked) => {
        setTimeOpenPayload(prev => ({ ...prev, [`isworking${day}`]: checked }));
    }
    const handleChangeStartTime = (day, time) => {
        setTimeOpenPayload(prev => ({ ...prev, [`start${day}`]: time }));
    }
    const handleChangeEndTime = (day, time) => {
        setTimeOpenPayload(prev => ({ ...prev, [`end${day}`]: time }));
    }


    const handleApplyToAll = (day) => {
        // Lấy giờ bắt đầu và giờ kết thúc của ngày được chọn
        const startKey = `start${day}`;
        const endKey = `end${day}`;
        const startValue = timeOpenPayload[startKey];
        const endValue = timeOpenPayload[endKey];
        
        // Cập nhật giờ bắt đầu và kết thúc cho các ngày còn lại mà isworking là true
        const updatedPayload = Object.keys(timeOpenPayload).reduce((acc, key) => {
            const dayName = key.match(/start(.*)/)?.[1] || key.match(/end(.*)/)?.[1] || key.match(/isworking(.*)/)?.[1];
            // Kiểm tra nếu ngày đó đang làm việc và khác với ngày đang áp dụng
            if (dayName !== day && timeOpenPayload[`isworking${dayName}`]) {
                if (key.startsWith('start')) {
                    acc[key] = startValue;
                } else if (key.startsWith('end')) {
                    acc[key] = endValue;
                } else {
                    acc[key] = timeOpenPayload[key];
                }
            } else {
                acc[key] = timeOpenPayload[key];
            }
            return acc;
        }, {});
    
        setTimeOpenPayload(updatedPayload);
    };


    const handleInputChangee = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newVerificationCode = [...verificationCode];
            newVerificationCode[index] = value;
            setVerificationCode(newVerificationCode);
            if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
            }
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
    };
    
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);

    const handleClear = () => {
        setVerificationCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative">
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                {Object.keys(backgroundOptions).map((bg) => (
                <button
                    key={bg}
                    onClick={() => setSelectedBackground(bg)}
                    className={`w-8 h-8 rounded-full border-2 ${selectedBackground === bg ? "border-white" : "border-transparent"} overflow-hidden transition-all duration-300 hover:scale-110`}
                >
                    <img
                    src={backgroundOptions[bg]}
                    alt={`Background ${bg}`}
                    className="w-full h-full object-cover"
                    />
                </button>
                ))}
            </div>
            {/* Main background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{
                backgroundImage: `url(${backgroundOptions[selectedBackground]})`
                }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg z-10">
                {step === 1 ?
                <div className="flex flex-col gap-2">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Create your business</h2>
                        <p className="mt-2 text-sm text-gray-600">{registerText1}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded">
                            <div
                            className="h-full bg-[#0a66c2] rounded transition-all duration-300 ease-in-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-6 h-[400px] overflow-y-scroll scrollbar-none">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaCamera size={32} />
                                    </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar"
                                    className="absolute bottom-0 right-0 bg-[#0a66c2] text-white p-2 rounded-full cursor-pointer transition-colors duration-200"
                                >
                                    <FaCamera size={16} />
                                        <input
                                        type="file"
                                        id="avatar"
                                        name="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        // className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        {errors.avatar && (
                        <p id="email-error" className="mt-1 text-sm text-red-500 flex justify-center" role="alert">
                            {errors.avatar}
                        </p>
                        )}

                        <div className="grid grid-cols-1 gap-6 px-[2px]">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                    </label>
                                    <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={payload.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                    />
                                    {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                    </label>
                                    <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={payload.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                    />
                                    {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={payload.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                            </div>

                            <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                id="mobile"
                                name="mobile"
                                value={payload.mobile}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.mobile ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                            />
                            {errors.mobile && (
                                <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                            )}
                            </div>

                            <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={payload.password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                />
                                <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                            </div>

                            <button onClick={handleNextStep} className="w-full h-[40px] bg-[#0a66c2] text-white flex justify-center items-center rounded-md p-4 font-medium"
                                cytest="sp_register_next_btn"
                            >Next</button>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <button onClick={() => {navigate(`/${path.LOGIN}`)}} className="font-medium text-[#0a66c2]">
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
                :
                <div className="flex flex-col gap-2">
                    <div className="text-center relative">
                        <span onClick={()=>{setStep(1); setCurrentRegisterIndex1(0); setCurrentRegisterIndex2(0)}} className="absolute top-[12px] left-0 p-1 rounded-full border-2 border-gray-500 text-gray-500 cursor-pointer"><IoIosArrowBack size={20}/></span>
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Create your business</h2>
                        <p className="mt-2 text-sm text-gray-600">{registerText2}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded">
                            <div
                            className="h-full bg-[#0a66c2] rounded transition-all duration-300 ease-in-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-6 h-[400px] overflow-y-scroll scrollbar-none">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {previewImageProvider ? (
                                    <img
                                        src={previewImageProvider}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaCamera size={32} />
                                    </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="images"
                                    className="absolute bottom-0 right-0 bg-[#0a66c2] text-white p-2 rounded-full cursor-pointer transition-colors duration-200"
                                >
                                    <FaCamera size={16} />
                                        <input
                                        type="file"
                                        id="images"
                                        name="images"
                                        accept="image/*"
                                        onChange={handleImageProviderChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        {errors.images && (
                        <p id="email-error" className="mt-1 text-sm text-red-500 flex justify-center" role="alert">
                            {errors.images}
                        </p>
                        )}

                        <div className="grid grid-cols-1 gap-6 px-[2px]">
                            <div>
                            <label htmlFor="bussinessName" className="block text-sm font-medium text-gray-700">
                                Business Name
                            </label>
                            <input
                                type="text"
                                id="bussinessName"
                                name="bussinessName"
                                value={payload.bussinessName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border ${errors.bussinessName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                            />
                            {errors.bussinessName && (
                                <p className="mt-1 text-sm text-red-500">{errors.bussinessName}</p>
                            )}
                            </div>

                            <div ref={suggestionRef}>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Business Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={payload.address}
                                    onChange={handleAddressInputChange}
                                    onKeyDown={handleAddressKeyPress}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.address ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                />
                                <div className="w-[100%]">
                                    {addressSuggestions.length > 0 && (
                                        <ul className="bg-white border border-gray-300 z-10 w-[100%] max-h-60 overflow-y-auto">
                                            {addressSuggestions.map((suggestion) => (
                                                <li
                                                    key={suggestion.place_id}
                                                    onClick={() => handleSuggestionSelect(suggestion)}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                    cytest="goong_location_option"
                                                >
                                                    {suggestion.description}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                                )}
                            </div>

                            <button className="bg-[#0a66c2] hover:bg-blue-700 text-sm text-white font-bold py-3 px-4 rounded-md w-full mx-auto" onClick={() => { setIsInTimeForm(prev => !prev) }}
                                cytest="sp_register_open_time_select"
                            >
                                <span className="flex gap-2 w-full justify-center items-center">
                                    <FaClock />
                                    {isInTimeForm ? 'Close Time Select' : 'Open Time Select'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0a66c2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                cytest="sp_register_signup_btn"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Creating account...
                                    </span>
                                ) : (
                                    "Sign up"
                                )}
                            </button>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <button onClick={() => {navigate(`/${path.LOGIN}`)}} className="font-medium text-[#0a66c2]">
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>

                </div>}
            </div>

            {isInTimeForm &&
                <div className="h-[600px] overflow-y-scroll scrollbar-none bg-white flex flex-col items-center justify-center px-4 py-12 border-2 border-gray-800 rounded-md z-[99] fixed w-[50%] m-auto">
                    <div className="flex flex-col gap-4 items-start w-full">
                        {
                            daysInWeek.map((day, index) => (
                                <div key={index} className="w-full h-[60px] flex items-center ">
                                    <div className="w-[20%] flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={timeOpenPayload[`isworking${day}`]}
                                            onChange={(e) => handleWorkingChange(day, e.target.checked)}
                                            className="rounded border-gray-300 text-[#0a66c2]"
                                        />
                                        <span className="capitalize">{day}</span>
                                    </div>
                                    {
                                        timeOpenPayload[`isworking${day}`] &&
                                        <div className="w-[80%] flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={timeOpenPayload[`start${day}`]}
                                                onChange={(e) => handleChangeStartTime(day, e.target.value)}
                                                className="flex-1 rounded-md border border-gray-600 shadow-sm p-1 cursor-pointer"
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                value={timeOpenPayload[`end${day}`]}
                                                onChange={(e) => handleChangeEndTime(day, e.target.value)}
                                                className="flex-1 rounded-md border border-gray-600 shadow-sm p-1 cursor-pointer"
                                                />
                                            <div onClick={()=>handleApplyToAll(day)} className="flex-1 flex gap-1 items-center text-[#0a66c2] border border-[#0a66c2] p-1 rounded-md justify-center cursor-pointer">
                                                <span><FaCalendarAlt /></span>
                                                <span>Apply to All</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                            ))
                        }
                    </div>

                    <Button
                        handleOnclick={() => { setIsInTimeForm(prev => !prev); }}
                        fullWidth
                    >
                        Close Time Select
                    </Button>
                </div>
            }

            <div className={clsx("absolute inset-0 w-screen h-screen", isMapVisible ? 'flex items-center justify-center' : 'hidden')}>
                <div ref={mapContainer} className={clsx("absolute w-[75%] h-[90%] border-2 border-gray-300 rounded-md", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}>
                    <button onClick={handleCloseMap} className={clsx("absolute top-2 right-2 bg-red-500 text-white p-2 rounded", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}
                        cytest="close_goong_map"
                    >X</button>
                </div>
            </div>

            {isVerify &&
                <div className="absolute inset-0 bg-overlay z-50 flex flex-col items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Verification Code</h2>
                        <p className="mt-2 text-sm text-gray-600">
                        Please enter the 6-digit code sent to your device
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-6">
                        <div className="flex justify-between space-x-4">
                        {verificationCode.map((digit, index) => (
                            <div key={index} className="relative w-12">
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleInputChangee(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-full h-12 text-[#0a66c2] text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-300 outline-none`}
                                maxLength="1"
                                aria-label={`Digit ${index + 1}`}
                            />
                            </div>
                        ))}
                        </div>

                        <button
                        type="button"
                        className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0a66c2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${verificationCode.join("").length !== 6 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={verificationCode.join("").length !== 6}
                        onClick={finalRegister}
                        >
                        Verify
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-300"
                        onClick={handleClear}
                        >
                        Clear Input
                        </button>
                    </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default ServiceProviderRegister;
