import React, { useState, useEffect } from 'react';

// Sample statuses with styling
const STATUS_STYLES = {
  Approved: 'text-green-500 bg-green-100',
  "No Show": 'text-gray-500 bg-gray-100',
  Canceled: 'text-yellow-500 bg-yellow-100',
  Rejected: 'text-red-500 bg-red-100'
};

// Available statuses for filtering and editing
const STATUS_OPTIONS = ["All Statuses", "Approved", "No Show", "Canceled", "Rejected"];
const EDITABLE_STATUS_OPTIONS = ["Approved", "No Show", "Canceled", "Rejected"];

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All Statuses"); // Default to show all statuses
  const ordersPerPage = 7; // Display 7 orders per page

  // Fetch orders data from the API
  const fetchOrders = async (page, status) => {
    try {
      const statusQuery = status === "All Statuses" ? "" : `&status=${status}`;
      const response = await fetch(`https://api.example.com/orders?page=${page}&limit=${ordersPerPage}${statusQuery}`);
      const data = await response.json();

      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedStatus);
  }, [currentPage, selectedStatus]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Optimistically update the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Call the API to update the status
      await fetch(`https://api.example.com/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      // Rollback UI update in case of error
      fetchOrders(currentPage, selectedStatus);
    }
  };

  // Format timestamp to a more readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Last booked appointments</h2>
        
        {/* Status Filter Dropdown */}
        <select
          className="border border-gray-300 rounded px-2 py-1 text-gray-500"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1); // Reset to page 1 on status change
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2">Date</th>
            <th>Service</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Staff</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-4 text-gray-500">{formatTimestamp(order.timestamp)}</td>
              <td className="flex items-center space-x-2">
                <span className="text-gray-600">{order.serviceType}</span>
              </td>
              <td className="text-gray-600">{order.customerName}</td>
              <td>
                {/* Editable Status Dropdown */}
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`px-2 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[order.status] || 'text-gray-500 bg-gray-100'}`}
                >
                  {EDITABLE_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="flex items-center space-x-2">
                <img src={order.staff.avatarUrl} alt={order.staff.name} className="w-8 h-8 rounded-full" />
                <span className="text-gray-600">{order.staff.name}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            &lt;
          </button>
          {[...Array(totalPages).keys()].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-500 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;