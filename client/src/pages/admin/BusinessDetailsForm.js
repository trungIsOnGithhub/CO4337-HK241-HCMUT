import Swal from "sweetalert2";
import { useDispatch, useSelector } from 'react-redux'
import React, { useState, useEffect } from 'react';
import { apiUpdateCurrentServiceProvider, apiGetServiceProviderById } from 'apis'
import { toast } from 'react-toastify'
import { getCurrent } from 'store/user/asyncAction'
import avatar from '../../assets/avatarDefault.png'

const BusinessDetailsForm = () => {
  const {current} = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [currentProvider, setCurrentProvider] = useState({})
  const [formData, setFormData] = useState({
    bussinessName: '',
    address: '',
    province: '',
    phoneNumber: '',
    // bankAccountNumber: '',
    thumbImage: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
  });
  const [previewImage, setPreviewImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentProviderEffectHanlder = async () => {
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }

    console.log('------>', current);
    // const response = await apiGetServiceProviderById(current.provider_id._id)
    // console.log(':::::>', response);

    if (!current.provider_id) {
      Swal.fire('Oops!', "Cannot Get Data", 'error');
      return;
    }

    setFormData({
      ...current.provider_id,
      ownerFirstName: current?.firstName || '',
      ownerLastName: current?.lastName || '',
      ownerEmail: current?.email || '',
      phoneNumber: current?.provider_id?.phone || '',
    });
    setPreviewImage(current?.avatar);
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
  //   //   phoneNumber: data.phoneNumber || '',
  //   //   bankAccountNumber: data.bankAccountNumber || '',
  //   //   thumbImage: data.thumbImage || '',
  //   //   ownerFirstName: data.ownerFirstName || '',
  //   //   ownerLastName: data.ownerLastName || '',
  //   //   ownerEmail: data.ownerEmail || '',
  //   // });
  // }, []);
  useEffect(() => {
    currentProviderEffectHanlder();
    //console.log('hehhehehehehe');
  }, [current])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    handleUpdateInfo(formData);
  };

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;


  const handleUpdateInfo = async(data) => {
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }

    console.log('=====>', data);

    const formData = new FormData();
    for (let i of Object.entries(data)) {
        formData.append(i[0], i[1]);
    }
    if (!current?.provider_id) {
        toast.error('No Provider Specified With Current User!!');
        return;
    }

    formData.delete('avatar');
    if (data.avatar) formData.append('avatar', data.avatar[0]);

    const response = await apiUpdateCurrentServiceProvider(current.provider_id._id, formData)
    if(response.success){
      dispatch(getCurrent())
      toast.success("Update Provider Info OK!")
    }
    else{
      toast.error(response.mes)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-3/4 mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">My Business</h2>

      <div className='flex gap-3 mb-4 justify-start'>
        <label htmlFor='avatar'>
          <img src={previewImage||avatar} alt='avatar' className='cursor-pointer h-[200px] object-cover border-2 rounded-md'></img>
        </label>

        <label className="block flex mb-2 flex-col justify-end grow">
          <span className="text-gray-700">Thumb Image URL</span>
          <input
            type="url"
            name="thumbImage"
            value={formData.thumbImage}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
            placeholder="URL of the thumbnail image"
          />
        </label>
      </div>

      <label className="block mb-2">
        <span className="text-gray-700">Business Name<span className="text-red-500">*</span></span>
        <input
          type="text"
          name="businessName"
          value={formData.bussinessName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
          required
        />
      </label>

      <label className="block mb-2">
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
      </label>
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
            name="phoneNumber"
            value={formData.phoneNumber}
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
          type="email"
          name="ownerEmail"
          value={formData.ownerEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none text-gray-500"
        />
      </label>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

export default BusinessDetailsForm;