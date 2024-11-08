import React, { useState, useEffect } from 'react';
import { apiGetOneOrderByAdmin, apiUpdateOrderStatus } from 'apis/order';
import Swal from 'sweetalert2';

const ViewOrderDetail = ({ bookingId, onClose }) => {
    const [isEditMode, setEditMode] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);

    useEffect(() => {
        // Fetch order data on component mount
        if (bookingId?.length < 1) {
            Swal.fire("Error Occured!", "Cannot fetch data!", "error");
            return;
        }
        const fetchOrderData = async () => {
            try {
                const data = await apiGetOneOrderByAdmin(bookingId);
                console.log("+++++++}}}", data);
                setOrderData(data?.booking);
            } catch (err) {
                setError('Failed to fetch order data.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, []);

    const toggleEditMode = () => {
        if (isEditMode) {
            saveChanges();
        }
        setEditMode(!isEditMode);
    };

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
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-md shadow-lg [&>*]:text-gary-500">
            <h2 className="text-2xl font-semibold mb-6">Edit Appointment</h2>
            
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
                                <p className="text-gray-500">{orderData?.info[0]?.service?.duration} &nbsp;|&nbsp; ${orderData?.info[0]?.service?.price}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Employee Dropdown */}
                    <div>
                        <label className="block font-semibold mb-1">Employee</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            disabled={!isEditMode}
                            value={orderData.selectedEmployee}
                            onChange={(e) => handleChange('selectedEmployee', e.target.value)}
                        >
                            {orderData?.info.map(serv => (
                                <option key={serv?.staff._id} value={serv?.staff._id}>{`${serv?.staff?.firstName} ${serv?.staff?.lastName}`}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md"
                                value={orderData?.info[0]?.dateTime}
                                disabled={!isEditMode}
                                onChange={(e) => handleChange('date', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Time</label>
                            <input
                                type="time"
                                className="w-full p-2 border rounded-md"
                                value={orderData?.info[0]?.dateTime}
                                disabled={!isEditMode}
                                onChange={(e) => handleChange('time', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Location */}
                    <div>
                        <label className="block font-semibold mb-1">Location</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            disabled={!isEditMode}
                            value={orderData?.info[0]?.provider?.province}
                            onChange={(e) => handleChange('location', e.target.value)}
                        >
                            <option>{orderData.location}</option>
                        </select>
                    </div>

                    {/* New Customers Section */}
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center font-semibold">
                            <p>Customers</p>
                            <a href="#" className="text-blue-500 text-sm">+ New Customer</a>
                        </div>

                        {/* Customer Input */}
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            className="w-full p-2 border rounded-md mb-2"
                            value={`${orderData?.staff?.firstName} ${orderData?.staff?.lastName}`}
                            readOnly={!isEditMode}
                        />

                        {/* Notification Message */}
                        {/* {orderData.noMorePlaces && (
                            <div className="flex items-center bg-gray-100 text-gray-600 text-sm p-2 rounded-md">
                                <span>ℹ️</span>
                                <p className="ml-2">There are no more places available for this time slot.</p>
                            </div>
                        )} */}

                        {/* Customer List */}
                        <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{`${orderData?.orderBy?.firstName} ${orderData?.orderBy?.lastName}`}</p>
                                <button className="text-red-500 text-sm" disabled={!isEditMode}>✕ Remove</button>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <p>{orderData?.orderBy?.email}</p>
                                <select className="border rounded-md p-1" disabled={!isEditMode}>
                                    <option>Approved</option>
                                    <option>Pending</option>
                                    <option>Declined</option>
                                </select>
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
                </div>
                
                {/* Right Section - Summary */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                    {/* Display summaries (not modified for brevity) */}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
                {isEditMode ? (
                    <button
                        onClick={toggleEditMode}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
                    >
                        Save
                    </button>
                ) : (
                    <button
                        onClick={toggleEditMode}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* Save Feedback Message */}
            {saveMessage && <p className="mt-4 text-green-500">{saveMessage}</p>}
        </div>
    );
};

export default ViewOrderDetail;