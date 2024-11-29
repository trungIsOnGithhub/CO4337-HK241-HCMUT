import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from 'chart.js';
import { apiGetCustomerDataByMonth, apiGet3ChartInfoByMonth } from 'apis'
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CenterChart = ({ providerId }) => {
  // const currentUser = useSelector(state => state.user.current);

  const [newCustomers, setNewCustomers] = useState(0);
  const [returningCustomers, setReturningCustomers] = useState(0);
  const [newCustomerRatio, setNewCustomerRatio] = useState(0.0);
  const [returningCustomerRatio, setReturningCustomerRatio] = useState(0.0);

  const [appointmentsBooked, setAppointmentsBooked] = useState(0);
  const [appointmentsBookedChange, setAppointmentsBookedChange] = useState(0);
  const [canceledAppointments, setCanceledAppointments] = useState(0);
  const [canceledAppointmentsChange, setCanceledAppointmentsChange] = useState(0);
  // const [dailyTrends, setDailyTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lineData, setLineData] = useState({});

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2024);

  const getDaysArray = (month, year) => {
    var numDaysInMonth, daysInWeek, daysIndex, index, i, l, daysArray;

    numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysIndex = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    index = daysIndex[(new Date(year, month - 1, 1)).toString().split(' ')[0]];
    daysArray = [];

    for (i = 0, l = numDaysInMonth[month - 1]; i < l; i++) {
        daysArray.push( ((i + 1) + '. ' + daysInWeek[index++]).substring(0,3) );
        if (index === 7) index = 0;
    }

    return daysArray;
}

  useEffect(() => {
    const fetchCustomerData = async (month, year) => {
      if (!providerId) {
        Swal.fire('Error Ocurred!!', 'Cannot Find User Session!', 'error');
        return;
      }
      setLoading(true);

    const chartData = await apiGet3ChartInfoByMonth({ currMonth: selectedMonth+1, currYear: selectedYear, spid: providerId });
    const customerData = await apiGetCustomerDataByMonth({ currMonth: selectedMonth+1, currYear: selectedYear, spid: providerId });

    if (!chartData.success || !customerData.success) {
      Swal.fire('Error Ocurred!!', 'Cannot Update Chart Data!', 'error');
      return;
    }

    console.log("------", chartData);

    setNewCustomers(customerData.newCustomers);
    setReturningCustomers(customerData.returningCustomers);

    const sumNumCustomerMonth = (customerData.newCustomers + customerData.returningCustomers) || 1;
    const newCustomerRatio = (+customerData.newCustomers / sumNumCustomerMonth * 100)?.toFixed(2);
    setNewCustomerRatio(newCustomerRatio);
    // console.log("---", +customerData.returningCustomers);
    const returningCustomerRatio = (+customerData.returningCustomers / sumNumCustomerMonth * 100)?.toFixed(2);
    setReturningCustomerRatio(returningCustomerRatio);

    setAppointmentsBooked(chartData.finished);
    setCanceledAppointments(chartData.canceled);

    const sumOrdersChartData = chartData.total || (chartData.finished + chartData.canceled);
    // console.log(sumOrdersChartData, "------");
    const ratioFinish = (chartData.finished * 100 / sumOrdersChartData)?.toFixed(1);
    const ratioCanceled = (chartData.canceled * 100 / sumOrdersChartData)?.toFixed(1);

    setAppointmentsBookedChange(ratioFinish);
    setCanceledAppointmentsChange(ratioCanceled);

    const dayLabelArray = [...Array(new Date(selectedYear, selectedMonth+1, 0).getDate()).keys().map(e => (e+1).toString())];
    setLineData({
      labels: dayLabelArray,
      datasets: [
        {
          label: 'Customer Trends',
          data: chartData.revenueSeries,
          borderColor: '#2563EB',
          fill: {
            target: 'origin',
            above: 'rgba(37, 99, 235, 0.1)',
          },
          tension: 0.3,
        },
      ],
    });
    // setDailyTrends();

    setLoading(false);
  };

    fetchCustomerData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);


  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // Customize the tooltip content if needed
          label: function(tooltipItem) {
            return `Value: ${tooltipItem.raw}`;  // Display the value of the point
          },
        },
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
          beginAtZero: true,
        },
        ticks: {
          display: true,
        },
        min: 0
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
    return <div className="text-center p-6 text-gray-500 w-2/3 grow">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border-2 w-full">
      {/* Header with appointment statistics and month/year selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-8">
          <div>
            <div className="text-gray-500 text-sm">Orders Booked</div>
            <div className="text-2xl font-bold text-blue-500">{appointmentsBooked}</div>
            <div className='text-sm text-green-500'>
              {Math.abs(appointmentsBookedChange)}% in total
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Canceled Orders</div>
            <div className="text-2xl font-bold text-red-500">{canceledAppointments}</div>
            <div className='text-sm text-red-500'>
              {Math.abs(canceledAppointmentsChange)}% in total
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
        <div className="flex justify-center w-1/4">
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Legend and percentages */}
        <div className="flex flex-col items-center w-3/4">
          <div className="flex items-center justify-center">
            <div>
            <div className="text-gray-500 text-sm text-center pt-1 flex">
              New Customers
              <div className="ml-1 w-4 h-4 border-4 border-blue-500 rounded-full flex items-center justify-center inline-block">
                <span className="text-xs font-bold text-blue-500"></span>
              </div>
            </div>
            <p className="font-semibold text-center pt-1 text-gray-600">{newCustomerRatio}%</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mt-4">
            <div>
              <div className="text-gray-500 text-sm text-center pt-1 flex">
                Returning Customers
                <div className="ml-1 w-4 h-4 border-4 border-green-500 rounded-full flex items-center justify-center inline-block">
                  <span className="text-xs font-bold text-green-500"></span>
                </div>
              </div>
              <p className="font-semibold text-center pt-1 text-gray-600">
                {returningCustomerRatio}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterChart;