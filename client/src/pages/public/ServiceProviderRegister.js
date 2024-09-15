import React, { useState, useCallback, useEffect, useRef } from "react";
import { InputField, Button } from '../../components';
import {apiFinalRegister } from "../../apis/user";
import { apiCreateServiceProvider } from "../../apis/ServiceProvider";
import Swal from 'sweetalert2';
import {Link, useSearchParams } from 'react-router-dom';
import path from "../../ultils/path";

import { useDispatch } from 'react-redux';
import { validate } from "ultils/helper";
import { HashLoader } from "react-spinners";
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import axios from 'axios';
import clsx from "clsx";

const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'IXqHXe9w2riica5A829SuB6HUl5Fi1Yg7LC9OHF2';

const ServiceProviderRegister = () => {
    const dispatch = useDispatch();
    const mapContainer = useRef(null);
    const map = useRef(null);

    const daysInWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        bussinessName: '',
        address: '',
    });
    const [timeOpenPayload, setTimeOpenPayload] = useState({
        startmonday: '', endmonday: '',
        starttuesday: '', endtuesday: '',
        startwednesday: '', endwednesday: '',
        startthursday: '', endthursday: '',
        startfriday: '', endfriday: '',
        startsaturday: '', endsaturday: '',
        startsunday: '', endsunday: '',
    });
    const [isVerify, setIsVerify] = useState(false);
    const [invalidField, setInvalidField] = useState([]);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [searchParams] = useSearchParams();
    const [isInTimeForm, setIsInTimeForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState('');
    const [isMapVisible, setIsMapVisible] = useState(false); // State to control map visibility
    const [addressSuggestions, setAddressSuggestions] = useState([]); // State for address suggestions

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
            startmonday: '', endmonday: '',
            starttuesday: '', endtuesday: '',
            startwednesday: '', endwednesday: '',
            startthursday: '', endthursday: '',
            startfriday: '', endfriday: '',
            startsaturday: '', endsaturday: '',
            startsunday: '', endsunday: '',
        });
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

                    // Set the marker's position initially
                    marker.setLngLat([lng, lat]);
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

    // Function to update address input based on coordinates
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

    //SUBMIT
    const handleSubmit = useCallback(async () => {
        const { firstName, lastName, mobile, ...data } = payload;

        payload.time = {};
        for (const day of daysInWeek) {
            const startKey = `start${day}`;
            const endKey = `end${day}`;
            payload.time[startKey] = timeOpenPayload[startKey];
            payload.time[endKey] = timeOpenPayload[endKey];
        }

        // Add longitude and latitude to the payload
        if (coordinates) {
            payload.longitude = coordinates.lng;
            payload.latitude = coordinates.lat;
        } else {
            Swal.fire('Opps!', 'Please check your location on the map', 'error');
            return;
        }

        const invalid = validate(payload, setInvalidField);
        if (invalid === 0) {
            payload.role = 1411;
            setIsLoading(true)
            let response = await apiCreateServiceProvider(payload);
            setIsLoading(false)
            if (response.success) {
                setIsVerify(true);
            } else {
                Swal.fire('Opps!', response.mes, 'error');
                return;
            }
            resetPayload();
        } else {
            Swal.fire('Opps!', 'Invalid Input Form', 'error');
        }
    }, [payload, timeOpenPayload, isRegister]);

    const finalRegister = async () => {
        const res = await apiFinalRegister(token);
        if (res.success) {
            Swal.fire('Congratulations!', res.mes, 'success').then(() => {
                setIsRegister(false);
                resetPayload();
            });
        } else {
            Swal.fire('Opps!', res.mes, 'error');
        }
        setIsVerify(false);
        setToken('');
    };

    const applyTimeToAllDays = () => {
        const newTimeOpenPayload = { ...timeOpenPayload };
        for (const day of daysInWeek) {
            newTimeOpenPayload[`start${day}`] = timeOpenPayload.startmonday;
            newTimeOpenPayload[`end${day}`] = timeOpenPayload.endmonday;
        }
        setTimeOpenPayload(newTimeOpenPayload);
    };

    const applySpecificDayToAllDays = (day) => {
        const newTimeOpenPayload = { ...timeOpenPayload };
        const startDayKey = `start${day}`;
        const endDayKey = `end${day}`;
        for (const otherDay of daysInWeek) {
            newTimeOpenPayload[`start${otherDay}`] = timeOpenPayload[startDayKey];
            newTimeOpenPayload[`end${otherDay}`] = timeOpenPayload[endDayKey];
        }
        setTimeOpenPayload(newTimeOpenPayload);
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
    
                    new goongjs.Marker(el)
                        .setLngLat([lng, lat])
                        .addTo(map.current);
                }
            }
        } catch (error) {
            console.error('Error fetching coordinates for selected address:', error);
        }
    };

    

    return (
        <div className="w-screen h-fit relative flex justify-center items-center flex-row overflow-y-auto">
            {isVerify &&
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-overlay z-50 flex flex-row items-center justify-center">
                    <div className="bg-white w-[500px] rounded-md p-8">
                        <h4 className="">We have sent a registration code to your email. Please check your mail and enter the code:</h4>
                        <input
                            type="text"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="p-2 rounded-md outline-none border"
                        ></input>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-500 font-semibold text-white rounded-md ml-4"
                            onClick={finalRegister}>
                            Submit
                        </button>
                    </div>
                </div>
            }

            <img src="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8zM18zZF9pbGx1c3RyYXRpb25fb2ZfYV9uZW9uX2ljb25zX3Nob3BwaW5nX2lzb19hYTQwZTZhNi0xOTk1LTRlMTUtOTJjYy03ZjJlODdlNjkyODNfMS5qcGc.jpg" alt=""
                className='w-screen min-h-screen object-cover'>    
            </img>

            <div className="absolute top-0 mt-4 p-8 bg-white rounded-md max-w-[600px] h-fit flex flex-col items-center overflow-y-auto">
                <h1 className="text-[28px] font-semibold text-main mb-8">Đăng ký Dịch vụ Kinh Doanh của Bạn</h1>

                <div className="flex gap-2 w-full">
                    <InputField
                        value={payload.firstName}
                        setValue={setPayload}
                        nameKey='firstName'
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                        style='flex-auto'
                        fullWidth
                    />
                    <InputField
                        value={payload.lastName}
                        setValue={setPayload}
                        nameKey='lastName'
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                        style='flex-auto'
                        fullWidth
                    />
                </div>

                <InputField
                    value={payload.email}
                    setValue={setPayload}
                    nameKey='email'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField
                    value={payload.password}
                    setValue={setPayload}
                    nameKey='password'
                    type='password'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField
                    value={payload.mobile}
                    setValue={setPayload}
                    nameKey='mobile'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField
                    value={payload.bussinessName}
                    setValue={setPayload}
                    nameKey='bussinessName'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />
                
                <div className="flex flex-col items-start w-full h-fit">
                <InputField
                    value={payload.address}
                    setValue={setPayload}
                    nameKey='address'
                    type='address'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                    onChange={handleAddressInputChange}
                    onKeyPress={handleAddressKeyPress}
                />
                <div className="w-[100%]">
                {addressSuggestions.length > 0 && (
                    <ul className="bg-white border border-gray-300 z-10 w-[100%] max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion) => (
                            <li
                                key={suggestion.place_id}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                            >
                                {suggestion.description}
                            </li>
                        ))}
                    </ul>
                )}
                </div>
                </div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 p-4 rounded mt-5 w-full" onClick={() => { setIsInTimeForm(prevState => { setIsInTimeForm(!prevState); }); }}>
                    {isInTimeForm ? 'Close Time Select' : 'Open Time Select'}
                </button>
                <Button
                    handleOnclick={handleSubmit}
                    fullWidth
                >
                    Register As Provider
                </Button>

                <Link className="text-blue-500 text-sm hover:underline cursor-pointer" to={`/${path.LOGIN}`}>
                    Go to Login Page
                </Link>
            </div>

            {isInTimeForm &&
                <div className="bg-white p-10 flex flex-col items-center justify-center px-4 py-6 fixed top-4 border-2 border-gray-800 rounded-md" style={{ width: '50%', margin: '0 auto' }}>
                    <h5 className="text-center text-gray-600 text-3xl font-bold">Select Time Schedule</h5>
                    {isInTimeForm &&
                        daysInWeek.map(day => {
                            return (
                                <div className="flex items-center gap-2 w-full mb-2" key={day}>
                                    <div className="flex-auto capitalize">{day}</div>
                                    <InputField
                                        value={timeOpenPayload[`start${day}`]}
                                        setValue={setTimeOpenPayload}
                                        nameKey={`start${day}`}
                                        invalidField={invalidField}
                                        setInvalidField={setInvalidField}
                                        type="time"
                                        className="flex-auto"
                                    />
                                    <InputField
                                        value={timeOpenPayload[`end${day}`]}
                                        setValue={setTimeOpenPayload}
                                        nameKey={`end${day}`}
                                        invalidField={invalidField}
                                        setInvalidField={setInvalidField}
                                        type="time"
                                        className="flex-auto"
                                    />
                                    <button
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded w-20 text-sm"
                                        onClick={() => applySpecificDayToAllDays(day)}
                                    >
                                        Apply to all
                                    </button>
                                </div>
                            );
                        })
                    }

                    <Button
                        handleOnclick={() => { setIsInTimeForm(prevState => { setIsInTimeForm(!prevState); }); }}
                        fullWidth
                    >
                        Close Time Select
                    </Button>
                </div>
            }
           
            {isLoading && (
            <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
                <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
            </div>
            )}
            
            <div className={clsx("absolute inset-0 w-screen h-screen", isMapVisible ? 'flex items-center justify-center' : 'hidden')}>
                <div ref={mapContainer} className={clsx("absolute w-[75%] h-[90%] border-2 border-gray-300 rounded-md", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}>
                    <button onClick={handleCloseMap} className={clsx("absolute top-2 right-2 bg-red-500 text-white p-2 rounded", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}>X</button>
                </div>
            </div>
        </div>
    );
};

export default ServiceProviderRegister;
