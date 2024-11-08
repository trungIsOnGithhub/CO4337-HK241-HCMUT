import clsx from 'clsx'
import { Button, InputForm } from 'components'
import moment from 'moment'
import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import avatar from '../../assets/avatarDefault.png'
import { apiUpdateCurrent } from 'apis'
import { getCurrent } from 'store/user/asyncAction'
import { toast } from 'react-toastify'
import { getBase64 } from 'ultils/helper'
import { useNavigate, useSearchParams } from 'react-router-dom'
import withBaseComponent from 'hocs/withBaseComponent'
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiX, FiInfo } from "react-icons/fi";
import goongjs from '@goongmaps/goong-js';
import axios from 'axios'

const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'IXqHXe9w2riica5A829SuB6HUl5Fi1Yg7LC9OHF2';
const Personal = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {current} = useSelector(state => state.user)
  const [isMapVisible, setIsMapVisible] = useState(false); // State to control map visibility
  const mapContainer = useRef(null);
  const map = useRef(null);
  const suggestionRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]); // State for address suggestions
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    goongjs.accessToken = GOONG_MAPTILES_KEY;

    map.current = new goongjs.Map({
        container: mapContainer.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [105.83991, 21.02800],
        zoom: 9,
    });
}, []);

  const handleClickOutside = (event) => {
    if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setAddressSuggestions([]); // Ẩn gợi ý nếu nhấp ra ngoài
    }
  };

  const handleCloseMap = () => {
    setIsMapVisible(false);
  };
  useEffect(() => {
    if (isMapVisible && map.current) {
        map.current.resize(); // Resize the map when it becomes visible
    }
  }, [isMapVisible]);


  const handleAddressKeyPress = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckLocation();
    }
  };

  const updateAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await axios.get(`https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`);
        const data = await response.data;

        if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address; // Get the formatted address
            setFormData(prev => ({ ...prev, address })); // Update the address in the formData
        }
    } catch (error) {
        console.error('Error fetching address from coordinates:', error);
    }
  };

  const handleCheckLocation = async () => {
    try {
        const response = await axios.get(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(formData.address)}&api_key=${GOONG_API_KEY}`);
        const data = await response.data;

        if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            setCoordinates({ lat, lng });
            setIsMapVisible(true); // Show map when location is found

            // Update the formData with the coordinates
            setFormData(prev => ({ ...prev, longitude: lng, latitude: lat }));

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
        }
    } catch (error) {
        console.error('Error in handleCheckLocation:', error);
        setCoordinates(null);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    setFormData(prev => ({ ...prev, address: suggestion.description })); // Set selected address
    setAddressSuggestions([]); // Clear suggestions

    try {
        // Fetch the coordinates for the selected address
        const response = await axios.get(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(suggestion.description)}&api_key=${GOONG_API_KEY}`);
        const data = await response.data;

        if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            setCoordinates({ lat, lng });
            setIsMapVisible(true);
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
        console.error('Error fetching coordinates for selected address:');
    }
  };

  const handleAddressInputChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value })); // Update address in payload

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

  useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatar: null,
    // Read-only fields
    role: "",
    createdAt: "",
    latitude: "",
    longitude: "",
  });
  
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({
      firstName: current?.firstName,
      lastName: current?.lastName,
      email: current?.email,
      phone: current?.mobile,
      address: current?.address,
      avatar: current?.avatar,
      role: current?.role === '1411' ? 'Admin' : 'Customer',
      createdAt: moment(current?.createdAt).format("MMM DD, YYYY"),
      latitude: current?.latitude,
      longitude: current?.longitude,
    })
    setPreviewUrl(current?.avatar)
  }, [current])

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[A-Za-z]{2,}$/.test(value)) {
          error = `${name === "firstName" ? "First" : "Last"} name must contain only letters and be at least 2 characters long`;
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!/^(\+84|0)\d{9}$/.test(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    let hasErrors = false;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (field !== "avatar" && field !== "role" && field !== "createdAt") {
        const error = validateField(field, formData[field]);
        if (error) {
          hasErrors = true;
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      if (coordinates) {
        formData.longitude = coordinates.lng;
        formData.latitude = coordinates.lat;
      }
      const data = new FormData()
      if(typeof formData?.avatar === 'string'){
        delete formData.avatar
      }

      for(let i of Object.entries(formData)){
        data.append(i[0],i[1])
      }
      
      const response = await apiUpdateCurrent(data)
      if(response.success){
        dispatch(getCurrent())
        toast.success(response.mes)
        // if(params?.get('redirect')){
        //   navigate(params.get('redirect'))
        // }
      }
      else{
        toast.error(response.mes)
      }
    }
  };

  const ReadOnlyField = ({ label, value, icon: Icon }) => (
    <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
      <Icon className="text-blue-500" size={20} />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base font-semibold text-blue-700">{value}</p>
      </div>
    </div>
  );

  console.log(formData)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 text-center mb-8">
          Profile Management
        </h2>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <ReadOnlyField label="Role" value={formData.role} icon={FiUser} />
          <ReadOnlyField label="Created At" value={formData.createdAt} icon={FiInfo} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              {previewUrl ? (
                <div className="relative">
                  {previewUrl ? 
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 group-hover:border-blue-400 transition-colors duration-300 shadow-lg"
                  />
                  :
                  <img
                    src={formData.avatar}
                    alt="Avatar preview"
                    className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 group-hover:border-blue-400 transition-colors duration-300 shadow-lg"
                  />
                  }
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-[#0a66c2] text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                    aria-label="Remove avatar"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center group-hover:from-blue-300 group-hover:to-blue-400 transition-all duration-300 shadow-lg">
                  <FiUser size={48} className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-md"
            >
              <FiUpload className="mr-2" />
              Upload Avatar
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {["firstName", "lastName"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field === "firstName" ? "First Name" : "Last Name"}
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 rounded-lg border ${errors[field] ? "border-red-300" : "border-blue-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-400`}
                    aria-describedby={`${field}-error`}
                  />
                  {errors[field] && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id={`${field}-error`}
                    >
                      {errors[field]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {[
              { name: "email", icon: FiMail, type: "email", label: "Email" },
              { name: "phone", icon: FiPhone, type: "tel", label: "Phone Number" },
            ].map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon className="text-blue-400" />
                  </div>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 px-4 py-3 rounded-lg border ${errors[field.name] ? "border-red-300" : "border-blue-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-300 hover:border-blue-400`}
                    aria-describedby={`${field.name}-error`}
                  />
                  {errors[field.name] && (
                    <p className="mt-2 text-sm text-red-600" id={`${field.name}-error`}>
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm" ref={suggestionRef}>
                <div className="absolute inset-y-0 left-0 pl-3 pt-4">
                  <FiMapPin className="text-blue-400" />
                </div>
                <input
                    type="text"
                    value={formData.address}
                    id="address"
                    name="address"
                    onChange={handleAddressInputChange}
                    onKeyDown={handleAddressKeyPress}
                    className={`block w-full pl-10 px-4 py-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-300 hover:border-blue-400`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600" id="address-error">
                    {errors.address}
                  </p>
                )}
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
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <div className={clsx("absolute inset-0 w-screen h-screen", isMapVisible ? 'flex items-center justify-center' : 'hidden')}>
        <div ref={mapContainer} className={clsx("absolute w-[75%] h-[90%] border-2 border-gray-300 rounded-md", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}>
            <button onClick={handleCloseMap} className={clsx("absolute top-2 right-2 bg-red-500 text-white p-2 rounded", isMapVisible ? 'block' : 'hidden')} style={{ zIndex: 1000 }}>X</button>
        </div>
      </div>
    </div>
  );
  
}

export default Personal