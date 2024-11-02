import React, { useState, useEffect } from 'react';
import { FaCog } from "react-icons/fa";

function PerformanceSummary({ servicesData }) {
  // State for managing time period selection
  const [timePeriod, setTimePeriod] = useState("Current Week");

  // State for service performance data
  const [services, setServices] = useState(servicesData);

  // Update time period handler
  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  // Effect to simulate updates to occupancy rates or revenue every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prevServices) =>
        prevServices.map((service) => ({
          ...service,
          appointments: service.appointments + Math.floor(Math.random() * 3),
          revenue: service.revenue + (Math.random() * 100).toFixed(2),
          occupancyRate: Math.min(service.occupancyRate + Math.floor(Math.random() * 5), 100),
        }))
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-800">Performance</h2>
        
        {/* Time Period Dropdown */}
        <div className="relative">
          <select
            value={timePeriod}
            onChange={handleTimePeriodChange}
            className="text-gray-500 text-sm bg-transparent appearance-none"
          >
            <option>Current Week (Mon - Sun)</option>
            <option>Last Week</option>
            <option>Last Month</option>
          </select>

          <button onClick={() => console.log('Open settings')} className="text-gray-400 hover:text-gray-600 ml-2">
            <FaCog />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-4">
        <button className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 mr-4">Services</button>
      </div>

      {/* Service List */}
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              {/* Service Image */}
              <img
                src={service.thumb}
                alt={`${service.name} icon`}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <h3 className="text-gray-800 font-semibold">{service.name}</h3>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Number Of Orders</span>
                <span>{service.numberOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue</span>
                <span>${Number(service.revenue).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Occupancy rate</span>
                <span>{service.occupancy}%</span>
              </div>
            </div>
            {/* Occupancy Rate Bar */}
            <div className="w-full bg-gray-200 h-1 rounded-full mt-2">
              <div
                style={{ width: `${service.occupancy}%` }}
                className="bg-blue-600 h-1 rounded-full"
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PerformanceSummary;