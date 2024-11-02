import React, { useState, useEffect } from 'react';
import { FaCog } from "react-icons/fa";
import { apiGetPerformanceDataByService, apiGetPerformanceDataByStaff } from 'apis';
import Swal from 'sweetalert2';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function PerformanceSummary() {
  // State for managing time period selection
  const [timePeriod, setTimePeriod] = useState("Current Week");

  const [services, setServices] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2024);

  const [performanceViewOption, setPerformanceViewOption] = useState("staff");
  // Update time period handler
  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  // Effect to simulate updates to occupancy rates or revenue every 10 seconds
  useEffect(() => {
    (async () => {
      let resp = null
      
      if (performanceViewOption === "service") {
        resp = await apiGetPerformanceDataByService({
          currMonth: selectedMonth,
          currYear: selectedYear
        });
      } else {
        resp = await apiGetPerformanceDataByStaff({
          currMonth: selectedMonth,
          currYear: selectedYear
        });
      }
  
      if (resp.success && resp.performance) {
        console.log("---------------", resp.performance, "-----------")
        if (performanceViewOption === "service") setServices(resp.performance);
        else if (performanceViewOption === "staff") setStaffs(resp.performance);
      }
      else {
        Swal.fire('Error Occured!', "Cannot fetch data", "error");
      }
    })();
  }, [selectedMonth, selectedYear, performanceViewOption]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-800">Top Performance</h2>

        {/* Time Period Dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-2 text-gray-500">
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* <button onClick={() => console.log('Open settings')} className="text-gray-400 hover:text-gray-600 ml-2">
            <FaCog />
          </button> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-4 gap-2">
        <button className={
          performanceViewOption === "service" ?
            "text-blue-600 font-medium pb-2 border-b-2 border-blue-600 mr-4"
            : "text-gray-500 mr-4 pb-2 font-medium"
          }
          onClick={() => { setPerformanceViewOption("service"); }}   
        >Services</button>
        <button className={
          performanceViewOption === "staff" ?
            "text-blue-600 font-medium pb-2 border-b-2 border-blue-600 mr-4"
            : "text-gray-500 mr-4 pb-2 font-medium"
          }
          onClick={() => { setPerformanceViewOption("staff"); }}  
        >Staffs</button>
      </div>

      {/* Service List */}
      <div className="space-y-4">
        {performanceViewOption === "service" && services.map((service, index) => (
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
                <span>{service.occupancy.toFixed(2)}%</span>
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

        {performanceViewOption === "staff" && staffs.map((service, index) => (
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
                <span>{service.occupancy.toFixed(2)}%</span>
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