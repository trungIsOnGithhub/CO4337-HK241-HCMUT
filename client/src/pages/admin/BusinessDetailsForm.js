import Swal from "sweetalert2";
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { apiUpdateCurrentServiceProvider, apiGetServiceProviderById } from 'apis';
import { toast } from 'react-toastify';
import { getCurrent } from 'store/user/asyncAction';
// import avatar from '../../assets/avatarDefault.png';
import { useForm } from 'react-hook-form';
import goongjs from '@goongmaps/goong-js';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiX, FiInfo } from "react-icons/fi";

const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'hzX8cXab72XCozZSYvZqkV26qMMQ8JdpkiUwK1Iy';
const BusinessDetailsForm = () => {
  const {current} = useSelector(state => state.user);
  const dispatch = useDispatch();
  // const {register, formState:{errors, isDirty}, handleSubmit, reset, watch} = useForm();
  const [currentProvider, setCurrentProvider] = useState({});
  const [previewUrls, setPreviewUrls] = useState('');
  const [formData, setFormData] = useState({});
  // const [previewImage, setPreviewImage] = useState('');
  const [province, setProvince] = useState('');
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isMapVisible, setIsMapVisible] = useState(false); // State to control map visibility
  const mapContainer = useRef(null);
  const map = useRef(null);
  const suggestionRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]); // State for address suggestions
  const [coordinates, setCoordinates] = useState(null);

  const currentProviderEffectHanlder = async () => {
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }

    // console.log('------>', current);
    const response = await apiGetServiceProviderById(current.provider_id._id)
    // console.log(':::::>', response);

    if (!response?.success && !response?.payload) {
      Swal.fire('Oops!', "Cannot Get Data", 'error');
      return;
    }

    setPreviewUrls(response.payload.images[0]);
    setCurrentProvider(response.payload);

    setFormData({
      // ...response.payload,
      bussinessName: response.payload.bussinessName,
      address: response.payload.address,
      ownerFirstName: current?.firstName || '',
      ownerLastName: current?.lastName || '',
      ownerEmail: current?.email || '',
      mobile: current?.provider_id?.mobile || '',
    });
    // reset({
    //   bussinessName: response.payload?.bussinessName,
    //   province: response.payload?.province,
    //   district: response.payload?.district,
    //   ward: response.payload?.district,
    //   phone: response.payload?.phone,
    //   address: response.payload?.address,
    // })
    // setPreviewImage(current?.avatar)
  }

  // useEffect(() => {
  //   currentProviderEffectHanlder();

  //   // setFormData({
  //   //   businessName: data.businessName || '',
  //   //   address: data.address || '',
  //   //   province: data.province || '',
  //   //   website: data.website || '',
  //   //   mobile: data.mobile || '',
  //   //   bankAccountNumber: data.bankAccountNumber || '',
  //   //   thumbImage: data.thumbImage || '',
  //   //   ownerFirstName: data.ownerFirstName || '',
  //   //   ownerLastName: data.ownerLastName || '',
  //   //   ownerEmail: data.ownerEmail || '',
  //   // });
  // }, []);
  useEffect(() => {
    currentProviderEffectHanlder();
  }, [current])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleSubmitFormData = () => {
  //   // console.log('=====>', formData);
  // }

  useEffect(() => {
    goongjs.accessToken = GOONG_MAPTILES_KEY;

    if (!map.current) {
      map.current = new goongjs.Map({
        container: mapContainer.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [105.83991, 21.02800],
        zoom: 9,
      });
    }
  }, []);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;
  const removeAvatar = (_url) => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setPreviewUrls(currentProvider.images[0]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(reader.result);
        // console.log(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateInfo = async(data) => {
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }

    const newFormDataObj = {
      ...formData
    }

    if (coordinates) {
      newFormDataObj['latitude'] = coordinates.lat;
      newFormDataObj['longitude'] = coordinates.lng;
    }
    if (province) {
      newFormDataObj['province'] = province
    }

    // console.log('=====>', data);
    const fData = new FormData();
    for (let i of Object.entries(newFormDataObj)) {
      // console.log(i);
      fData.append(i[0], i[1]);
    }

    fData.delete('avatar');
    if (newFormDataObj.avatar) fData.append('avatar', newFormDataObj.avatar);

    for (let p of fData.entries()) {
      console.log("kkkkkkkkkkkkkkkk", p);
    }
    // console.log('=========;;;;;;;;;' + );

    const response = await apiUpdateCurrentServiceProvider(current.provider_id._id, fData)
    if(response.success){
      dispatch(getCurrent())
      toast.success("Update Provider Info OK!")
    }
    else{
      toast.error("Cannot update data of provider!");
    }
  }

  const handleClickOutside = (event) => {
    if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setAddressSuggestions([]); // Ẩn gợi ý nếu nhấp ra ngoài
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
            setProvince(data.results[0].compound.province);
            setIsMapVisible(true); // Show map when location is found

            // Update the formData with the coordinates
            // setFormData(prev => ({ ...prev,
            //   longitude: lng, latitude: lat,
            //   province: data.results[0].compound.province }));

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
            setProvince(data.results[0].compound.province);

            // Update the formData with the coordinates
            // setFormData(prev => ({ ...prev,
            //   longitude: lng, latitude: lat,
            //   province: data.results[0].compound.province }));

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

    // if (!coordinates || !province) {
    //   Swal.fire('Error Occured!', 'Cannot find address location info', 'error');
    //   return;
    // }
    // console.log('aaaaaaaa');

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

  const handleAddressKeyPress = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckLocation();
    }
  };

// useEffect(() => {
//   window.alert('=====>' + JSON.stringify(coordinates));
// }, [coordinates]);

console.log(formData)
  return (
    <div className="w-3/4 mx-auto p-6 bg-white shadow-md rounded-md">
      <div className='flex gap-3 justify-center'>
        {/* <label htmlFor='avatar'>
          <img src={previewImage||avatar} alt='avatar' className='cursor-pointer h-[200px] object-cover border-2 rounded-md'></img>
        </label> */}

        <span className='text-sm text-gray-500 flex items-center'>Uploaded image:</span>
          <div className='flex flex-col justify-center items-center gap-2'>
            {/* {currentProvider.images?.length > 0 &&

            {!previewUrls && currentProvider.images.map(image => {
              return <img src={image} alt='avatar' className='cursor-pointer w-[80%] h-80%] object-cover'></img>
            })}
            } */}

              {
              previewUrls &&
                <div className="relative">
                  <img
                    src={previewUrls}
                    alt="Avatar preview"
                    className="w-48 h-48 rounded-full object-cover border-4 border-blue-300 group-hover:border-blue-400 transition-colors duration-300 shadow-lg"
                  />
                  { previewUrls !== currentProvider?.images[0] &&
                  <button
                    type="button"
                    onClick={() => {removeAvatar(previewUrls)}}
                    className="absolute -top-2 -right-2 bg-[#0a66c2] text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                    aria-label="Remove avatar"
                  >
                    <FiX size={20} />
                  </button>
                  }
                </div>
              }

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
              className="flex justify-center h-fit p-1 border border-transparent text-sm text-gray-500 rounded-md bg-slate-300 shadow-md"
            >
              <FiUpload className="mr-2" />
              Upload Image
            </label>
        </div>
{/* 
        <label className="block flex mb-2 flex-col justify-end grow">
          <span className="text-gray-700">Thumb Image URL</span>
          <input
            type="url"
            name="thumbImage"
            value={formData.thumbImage}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500 mb-4 px-3 y-4"
            placeholder="URL of the thumbnail image"
          />
        </label> */}
      </div>

      <label className="block mb-2">
        <span className="text-gray-700">Business Name<span className="text-red-500">*</span></span>
        <input
          type="text"
          name="bussinessName"
          value={formData.bussinessName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >Address</label>
        <div className="mt-1 relative rounded-lg shadow-sm" ref={suggestionRef}>
          {/* <div className="absolute inset-y-0 left-0 pl-3 pt-4">
            <FiMapPin />
          </div> */}
          <input
            type="text"
              value={formData.address}
              id="address"
              name="address"
              onChange={handleAddressInputChange}
              onKeyDown={handleAddressKeyPress}
              className={`block w-full rounded-md border focus:outline-none focus:ring-2 bg-white/50 transition-all duration-300 text-slate-500 focus:ring focus:ring-blue-300 focus:outline-none p-2`}
          />
          {/* {errors.address && (
            <p className="mt-2 text-sm text-red-600" id="address-error">
              {errors.address}
            </p>
          )} */}
          <div className="w-[100%]">
              {addressSuggestions.length > 0 && (
                  <ul className="bg-white border border-gray-300 z-10 w-[100%] max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion) => (
                          <li
                              key={suggestion.place_id}
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className="p-2 cursor-pointer hover:bg-gray-200 text-slate-700"
                          >
                              {suggestion.description}
                          </li>
                      ))}
                  </ul>
              )}
          </div>
        </div>
      </div>


        <div className={clsx("relative mt-2", isMapVisible ? '' : 'hidden')}>
          <div ref={mapContainer} className={clsx("w-full h-[20%] order-2 border-gray-300 rounded-md", isMapVisible ? 'block' : 'hidden')}>
            <button onClick={() => {setIsMapVisible(false);}}
                  className={clsx("absolute top-2 right-2 bg-red-500 text-white p-2 rounded", isMapVisible ? 'block' : 'hidden')}
                  style={{ zIndex: 999 }}>X</button>
          </div>
        </div>
      {/* { !isMapVisible && <div ref={mapContainer}></div> } */}
      {/* <label className="block mb-2">
        <span className="text-gray-700">Address</span>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Province</span>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label> */}
{/* 
      <label className="block mb-2">
        <span className="text-gray-700">Website</span>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label> */}

      <label className="block mb-2">
        <span className="text-gray-700">Phone number</span>
        <div className="flex items-center mt-1">
          <select className="border border-gray-300 rounded-l-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500">
            <option>+84</option>
          </select>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-r-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
            placeholder="Phone number"
          />
        </div>
      </label>

      {/* <label className="block mb-2">
        <span className="text-gray-700">Company Bank Account Number</span>
        <input
          type="text"
          name="bankAccountNumber"
          value={formData.bankAccountNumber}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
        <span className="text-sm text-gray-500">Used for payments when wire transfer payment method is selected.</span>
      </label> */}

      <label className="block mb-2">
        <span className="text-gray-700">Business Owner First Name</span>
        <input
          type="text"
          name="ownerFirstName"
          value={formData.ownerFirstName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Business Owner Last Name</span>
        <input
          type="text"
          name="ownerLastName"
          value={formData.ownerLastName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Business Owner Email</span>
        <input
          disabled={true}
          type="email"
          name="ownerEmail"
          value={formData.ownerEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500 cursor-not-allowed"
        />
      </label>

      <button
        onClick={() => {handleUpdateInfo();}}
        className="mt-4 w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700 focus:outline-none"
      >
        Submit
      </button>
    </div>
  );
};

export default BusinessDetailsForm;