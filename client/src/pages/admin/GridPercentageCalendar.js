import React, { useState, useEffect } from 'react';
import { apiGetOccupancyDataByMonth } from 'apis'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GridPercentageCalendar = () => {
  const [occupancyData, setOccupancyData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoverInfo, setHoverInfo] = useState({ date: null, occupancy: null, isHovered: false });

  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2024);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const fetchOccupancyData = async () => {
    // const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    // const newData = Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 101));
    let resp = await apiGetOccupancyDataByMonth({ currMonth: 5, currYear: 2024 });

    if (resp.success && resp.occupancySeries) {
      setOccupancyData(resp.occupancySeries);
    }
  };

  useEffect(() => {
    fetchOccupancyData();
  }, [currentMonth, currentYear]);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startDay = getStartDayOfMonth(currentMonth, currentYear);

  const getOccupancyColor = (percentage) => {
    if (percentage >= 81) return 'bg-blue-900';
    if (percentage >= 41) return 'bg-blue-700';
    if (percentage >= 21) return 'bg-blue-500';
    if (percentage > 0) return 'bg-blue-300';
    return 'bg-gray-200';
  };

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleMouseEnter = (day, occupancy) => {
    const date = new Date(currentYear, currentMonth, day + 1).toLocaleDateString();
    setHoverInfo({ date, occupancy, isHovered: true });
  };

  const handleMouseLeave = () => {
    setHoverInfo({ ...hoverInfo, isHovered: false });
  };

  return (
    <div className="max-w-md p-4 bg-white border-2 rounded-lg w-1/3 h-fit">
      <div className="flex flex-col justify-center items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Daily occupancy</h2>
  
        <div className="flex items-center justify-center text-gray-500 gap-2">
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
{/* 
        <div className="flex items-center space-x-2">
          <button onClick={() => changeMonth('prev')} className="text-gray-500">&lt;</button>
          <span className="text-sm text-gray-500">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
          </span>
          <button onClick={() => changeMonth('next')} className="text-gray-500">&gt;</button>
        </div> */}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div key={index} className="text-gray-500">{day}</div>
        ))}

        {/* Empty placeholders for days before the start of the month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-${index}`} className="w-8 h-8"></div>
        ))}

        {/* Days of the month with occupancy data */}
        {occupancyData.map((percentage, day) => (
          <div
            key={day}
            className={`relative w-8 h-8 rounded-lg ${getOccupancyColor(percentage)} flex items-center justify-center text-white`}
            onMouseEnter={() => handleMouseEnter(day, percentage)}
            onMouseLeave={handleMouseLeave}
          >
            {/* {day + 1} */}
            {hoverInfo.isHovered && new Date(hoverInfo.date).getDate() === day && (
              <div className="bottom-16 p-2 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700 z-10 w-fit">
                <div><strong>Date:</strong> {hoverInfo.date}</div>
                <div><strong>Occupancy:</strong> {hoverInfo.occupancy}%</div>
              </div>
            )}
          </div>
        ))}

      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">Legend</div>
        <div className="flex items-center mt-2">
          <span className="w-4 h-4 bg-blue-900 rounded-full mr-2"></span>
          <span className="text-gray-700 text-sm">81% and higher</span>
        </div>
        <div className="flex items-center mt-2">
          <span className="w-4 h-4 bg-blue-700 rounded-full mr-2"></span>
          <span className="text-gray-700 text-sm">Between 41% and 80%</span>
        </div>
        <div className="flex items-center mt-2">
          <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
          <span className="text-gray-700 text-sm">Between 21% and 40%</span>
        </div>
        <div className="flex items-center mt-2">
          <span className="w-4 h-4 bg-blue-300 rounded-full mr-2"></span>
          <span className="text-gray-700 text-sm">20% and lower</span>
        </div>
        <div className="flex items-center mt-2">
          <span className="w-4 h-4 bg-gray-200 rounded-full mr-2"></span>
          <span className="text-gray-700 text-sm">0%</span>
        </div>
      </div>
    </div>
  );
};

export default GridPercentageCalendar;