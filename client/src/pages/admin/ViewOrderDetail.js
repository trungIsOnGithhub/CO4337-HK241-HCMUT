import React, { useState, useEffect } from 'react';
import { apiGetOneOrderByAdmin, apiUpdateOrderStatus } from 'apis/order';
import Swal from 'sweetalert2';

const ViewOrderDetail = ({ bookingId, onClose }) => {
    const [isEditMode, setEditMode] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const [status, setStatus] = useState("Pending");
    const [isChanged, setIsChanged] = useState(false);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setIsChanged(true); // Show the submit button when a change is made
    };
    const handleStatusSubmit = async () => {
        // console.log("Status submitted:", status);
        if (!orderData?._id) {
            Swal.fire("Error Occured!", "Cannot Find User Session!", "error");
            return;
        }

        let resp = await apiUpdateOrderStatus({status}, orderData._id);
        if (resp.success && resp.order) {
            fetchOrderData();
            Swal.fire("Success!", "Order Status Updated!", "success");
        } else {
            Swal.fire("Error Occured!", "Cannot Update Order Status!", "error");
        }
        setIsChanged(false); // Hide the button after submission
    };
    const fetchOrderData = async () => {
        const data = await apiGetOneOrderByAdmin(bookingId);
        // console.log("+++++++}}}", data.booking);
        setOrderData(data?.booking);
        setStatus(data?.booking?.status);

        if (!data.success) {
            setError('Failed to fetch order data.');
        }
        setLoading(false);
    };

    useEffect(() => {
        // Fetch order data on component mount
        if (bookingId?.length < 1) {
            Swal.fire("Error Occured!", "Cannot fetch data!", "error");
            return;
        }

        fetchOrderData();
    }, []);

    // const toggleEditMode = () => {
    //     if (isEditMode) {
    //         saveChanges();
    //     }
    //     setEditMode(!isEditMode);
    // };

    const handleChange = (field, value) => {
        setOrderData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    const saveChanges = async () => {
        try {
            // Simulate saving the data (you would use an API call here)
            setSaveMessage('Saving...');
            await apiUpdateOrderStatus(orderData);  // Assume this function exists to update the order
            setSaveMessage('Data saved successfully.');
            setTimeout(() => setSaveMessage(null), 3000);  // Clear message after 3 seconds
        } catch (err) {
            setSaveMessage('Failed to save data.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-md shadow-lg [&>*]:text-gray-500">
            <h2 className="text-2xl font-semibold mb-6">Booking Detail</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Section */}
                <div className="space-y-4">
                    {/* Service Section */}
                    <div>
                        <label className="block font-semibold mb-1">Service</label>
                        <div className="flex items-center bg-gray-100 p-4 rounded-md">
                            <img src={orderData?.info[0]?.service?.thumb} alt="Service" className="w-12 h-12 rounded-full mr-4" />
                            <div>
                                <p className="font-semibold">{orderData?.info[0]?.service?.name}</p>
                                <p className="text-gray-500">{`${orderData?.info[0]?.service?.duration} min`} &nbsp;|&nbsp; ${orderData?.info[0]?.service?.price}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Employee Dropdown */}
                    <div>
                        <label className="block font-semibold mb-1">Employee</label>
                        {/* <select
                            className="w-full p-2 border rounded-md"
                            disabled={!isEditMode}
                            value={orderData.selectedEmployee}
                            onChange={(e) => handleChange('selectedEmployee', e.target.value)}
                        >
                            {orderData?.info.map(serv => (
                                <option key={serv?.staff._id} value={serv?.staff._id}>{`${serv?.staff?.firstName} ${serv?.staff?.lastName}`}</option>
                            ))}
                        </select> */}

                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={`${orderData?.info[0]?.staff?.firstName} ${orderData?.info[0]?.staff?.lastName}`}
                            disabled={true}
                            onChange={(e) => {}}
                        />
                    </div>
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Date</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={orderData?.info[0]?.date}
                                disabled={true}
                                onChange={(e) => {}}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Time</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={orderData?.info[0]?.time}
                                disabled={true}
                                onChange={(e) => {}}
                            />
                        </div>
                    </div>


                    {/* New Customers Section */}
                    <div className="space-y-2 mt-4">
                        {/* <div className="flex justify-between items-center font-semibold"> */}
                            <p className='font-semibold'>Customer Name</p>
                            {/* <a href="#" className="text-blue-500 text-sm">+ New Customer</a> */}
                        {/* </div> */}

                        {/* Customer Input */}
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            className="w-full p-2 border rounded-md mb-2"
                            value={`${orderData?.orderBy.firstName} ${orderData?.orderBy?.lastName}`}
                            readOnly={true}
                        />
                        <p className='font-semibold'>Customer Email</p>
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            className="w-full p-2 border rounded-md mb-2"
                            value={orderData?.orderBy.email}
                            readOnly={true}
                        />

                        {/* Notification Message */}
                        {/* {orderData.noMorePlaces && (
                            <div className="flex items-center bg-gray-100 text-gray-600 text-sm p-2 rounded-md">
                                <span>ℹ️</span>
                                <p className="ml-2">There are no more places available for this time slot.</p>
                            </div>
                        )} */}

                        {/* Customer List */}
                        {/* <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{`${orderData?.orderBy?.firstName} ${orderData?.orderBy?.lastName}`}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <p>{orderData?.orderBy?.email}</p>
                                <select className="border rounded-md p-1" disabled={!isEditMode}>
                                    <option>Approved</option>
                                    <option>Pending</option>
                                    <option>Declined</option>
                                </select>
                            </div>
                        </div> */}
                    </div>

                </div>
                
                {/* Right Section - Summary */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                {/* <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-4"> */}
            {/* Service */}
            {/* <div>
                <div className="flex items-center space-x-4">
                    <img
                        src="https://via.placeholder.com/40"
                        alt="Service Icon"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Afternoon DJ service</p>
                        <p className="text-xs text-gray-500">2h</p>
                        <p className="text-xs font-semibold text-gray-800">$250.00</p>
                    </div>
                </div>
            </div> */}

            {/* Employee */}
            {/* <div>
                <p className="text-sm font-semibold text-gray-600">Employee</p>
                <div className="flex items-center space-x-4">
                    <img
                        src="https://via.placeholder.com/40"
                        alt="Employee"
                        className="w-10 h-10 rounded-full"
                    />
                    <p className="text-sm text-gray-800">John Doe</p>
                </div>
            </div> */}

            {/* Date & Time */}
            {/* <div>
                <p className="text-sm font-semibold text-gray-600">Date & Time</p>
                <p className="text-sm text-gray-800">November 14, 2024</p>
                <p className="text-sm text-gray-800">12:00 pm</p>
            </div> */}

            {/* Pricing */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-600">Pricing</p>
                    {/* <a href="#" className="text-sm text-blue-600">View detailed pricing</a> */}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="flex justify-between">
                        <p className="text-sm text-gray-800">Service</p>
                        <p className="text-sm text-gray-800">${orderData?.total}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm text-gray-800">Extras</p>
                        <p className="text-sm text-gray-800">$0.00</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm text-gray-800">Coupon</p>
                        <p className="text-sm text-gray-800">$0.00</p>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                        <p className="text-sm text-gray-800">Total</p>
                        <p className="text-sm text-gray-800">${orderData?.total}</p>
                    </div>
                </div>
            </div>

                    {/* Coupon Section */}
                    <div className="space-y-2 mt-4">
                        <p className="font-semibold">Coupon</p>
                        <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                            {orderData.coupons?.map((coupon) => (
                                <div key={coupon.code} className="flex justify-between items-center text-sm">
                                    <p>{coupon.code} - ${coupon.discount} Off</p>
                                    <button className="text-red-500 text-sm" disabled={!isEditMode}>✕ Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Location */}
                    {/* <div>
                        <label className="block font-semibold mb-1">Location</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            disabled={!isEditMode}
                            value={orderData?.info[0]?.provider?.province}
                            onChange={(e) => handleChange('location', e.target.value)}
                        >
                            <option>{orderData.location}</option>
                        </select>
                    </div> */}

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Status</p>
 
                        <select
                            className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${status === "Successful" ? "bg-green-100 text-green-800" : 
                                status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                "bg-red-100 text-red-800"}
                            `}
                            value={status}
                            onChange={handleStatusChange}
                        >
                            <option value="Successful">Successful</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
            
                        {isChanged && (
                            <button
                                onClick={handleStatusSubmit}
                                className="mt-2 w-fit p-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500"
                            >
                                Submit Status Change
                            </button>
                        )}

                    </div>

        {/* </div> */}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
                {/* {isEditMode ? (
                    <button
                        onClick={toggleEditMode}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
                    >
                        Save
                    </button>
                ) : ( */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-400 text-white rounded-md shadow-md"
                    >
                        Back to Manage Booking
                    </button>
                {/* )} */}
            </div>

            {/* Save Feedback Message */}
            {saveMessage && <p className="mt-4 text-green-500">{saveMessage}</p>}
        </div>
    );
};

export default ViewOrderDetail;