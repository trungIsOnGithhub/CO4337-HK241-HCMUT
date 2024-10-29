import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CenterChart = () => {
  const [newCustomers, setNewCustomers] = useState(30);
  const [returningCustomers, setReturningCustomers] = useState(70);
  const [appointmentsBooked, setAppointmentsBooked] = useState(0);
  const [appointmentsBookedChange, setAppointmentsBookedChange] = useState(0);
  const [canceledAppointments, setCanceledAppointments] = useState(0);
  const [canceledAppointmentsChange, setCanceledAppointmentsChange] = useState(0);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2024);

  const fetchCustomerData = async (month, year) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.example.com/customer-trends?month=${month + 1}&year=${year}`);
      const data = await response.json();

      setNewCustomers(data.newCustomers);
      setReturningCustomers(data.returningCustomers);
      setAppointmentsBooked(data.appointmentsBooked);
      setAppointmentsBookedChange(data.appointmentsBookedChange);
      setCanceledAppointments(data.canceledAppointments);
      setCanceledAppointmentsChange(data.canceledAppointmentsChange);
      setDailyTrends(data.dailyTrends);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const totalCustomers = newCustomers + returningCustomers;
  const newCustomerPercentage = totalCustomers ? ((newCustomers / totalCustomers) * 100).toFixed(1) : 0;
  const returningCustomerPercentage = totalCustomers ? ((returningCustomers / totalCustomers) * 100).toFixed(1) : 0;

  const lineData = {
    labels: ['F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        label: 'Customer Trends',
        data: dailyTrends,
        borderColor: '#2563EB',
        fill: {
          target: 'origin',
          above: 'rgba(37, 99, 235, 0.1)',
        },
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
          beginAtZero: true,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  // Pie chart data for customer distribution
  const pieData = {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [newCustomers, returningCustomers],
        backgroundColor: ['#2563EB', '#10B981'], // Blue for New, Green for Returning
        hoverBackgroundColor: ['#1D4ED8', '#059669'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
  };

  if (loading) {
    return <div className="text-center p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-lg border-2 grow">
      {/* Header with appointment statistics and month/year selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-8">
          <div>
            <div className="text-gray-500 text-sm">Appointments booked</div>
            <div className="text-2xl font-bold text-blue-500">{appointmentsBooked}</div>
            <div className={`text-sm ${appointmentsBookedChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(appointmentsBookedChange)}% {appointmentsBookedChange >= 0 ? 'Increase' : 'Decrease'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Canceled appointments</div>
            <div className="text-2xl font-bold text-red-500">{canceledAppointments}</div>
            <div className={`text-sm ${canceledAppointmentsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(canceledAppointmentsChange)}% {canceledAppointmentsChange < 0 ? 'Decrease' : 'Increase'}
            </div>
          </div>
        </div>
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
      </div>

      {/* Line Chart */}
      <div className="mb-6">
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* Customer Statistics Summary */}
      <div className="flex justify-around items-center border-t border-gray-200 pt-4">
        {/* Pie Chart */}
        <div className="w-1/3">
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Legend and percentages */}
        <div className="flex flex-col items-center w-2/3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-500">{newCustomers}</span>
            </div>
            <div>
            <p className="text-gray-500 text-sm text-center pt-1">New Customers</p>
            <p className="text-green-500 font-semibold text-center pt-1">{newCustomerPercentage}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <div className="w-6 h-6 border-4 border-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-green-500">{returningCustomers}</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm text-center pt-1">Returning Customers</p>
              <p className="text-green-500 font-semibold text-center pt-1">{returningCustomerPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterChart;