import React, { useCallback, useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { apiGetDailyRevenueByDateRange, apiGetRevenueStatistic, apiGetUserVisitByDateRange } from 'apis'
import { useSelector } from 'react-redux';
import moment from 'moment';
import Swal from 'sweetalert2'
import { apiGetMostPurchasedServicesByYear } from 'apis'
// // import './style.css';

const button_string_style = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 roundedtext-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 text-sm'

const DashBoard = () => {
  const {current} = useSelector((state) => state.user);
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [monthOrders, setMonthOrders] = useState(0)
  const [monthCustomer, setMonthCustomer] = useState(0)
  const [totalServices, setTotalServices] = useState(0)

  const fetchDailyRevenue = useCallback(async () => {
    const requestBody = {
      provider_id: current.provider_id
    }
    let response = await apiGetRevenueStatistic(requestBody)


    if (response.success && response?.success) {
      setTotalRevenue(response.statistic?.totalRevenue);
      setMonthRevenue(response.statistic?.monthRevenue);
      setMonthOrders(response.statistic?.monthOrders);
      setMonthCustomer(response.statistic?.monthCustomer);
      setTotalServices(response.statistic?.totalServices)
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
        showCancelButton: true
      })
    }
  }, [])
  useEffect(() => {
    fetchDailyRevenue()
  }, [])

  return (
    // <div style={{width:'60%'}}>
    //   <ReactApexChart
    //     options={options}
    //     series={series}
    //     type="line"
    //     height={350}
    //   />
    // </div>
    <>
    <div className="flex justify-center mb-8 flex-wrap">
      <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <p className="font-bold text-xl mb-2 text-center">Total Revenue</p>
          <p className="font-bold text-blue-700 text-xl text-center">
            {totalRevenue}
          </p>
        </div>
      </div>
      <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <p className="font-bold text-xl mb-2 text-center">This Month Revenue</p>
          <p className="font-bold text-blue-700 text-xl text-center">
            {monthRevenue}
          </p>
        </div>
      </div>
      <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <p className="font-bold text-xl mb-2 text-center">This Month Orders</p>
          <p className="font-bold text-blue-700 text-xl text-center">
            {monthOrders}
          </p>
        </div>
      </div>
      <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <p className="font-bold text-xl mb-2 text-center">This Month Customers</p>
          <p className="font-bold text-blue-700 text-xl text-center">
            {monthCustomer}
          </p>
        </div>
      </div>
      <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <p className="font-bold text-xl mb-2 text-center">Total Services</p>
          <p className="font-bold text-blue-700 text-xl text-center">
            {totalServices}
          </p>
        </div>
      </div>
      {/* <div className="max-w-sm rounded overflow-hidden grow">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-1 text-center">Total dsadsad</div>
          <p className="font-bold text-blue-700 text-xl text-center">
            sdk;alsdk
          </p>
        </div>
      </div> */}

    </div>
    <div className="flex">
      <MostPurchasedServicesByYear
        currentUser={current}
      />
      <MostPurchasedServicesByYear
        currentUser={current}
      />
    </div>
    <div className="flex">

      <ApexChart />
      <UserVisitStatChart
        currentUser={current}
      />
    </div>
    </>
  );
}

const MostPurchasedServicesByYear = ({currentUser}) => {
  const [dataSeries, setDataSeries] = useState([]);
  const [currentYear, setCurrentYear] = useState([]);

  const fetchMostPurchasedServicesByYear = useCallback(async () => {
    let response = await apiGetMostPurchasedServicesByYear({
      provider_id: currentUser.provider_id,
      year: (new Date()).getFullYear()
    });

    if (response.success && response?.services) {
      setDataSeries(response.services);
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Fetching Data',
        icon: 'warning',
        showCancelButton: true
      })
    }
  }, []);
  useEffect(() => {
    fetchMostPurchasedServicesByYear()
  }, [])

  const state = {
    series: [44, 55, 13, 43, 22],
    options: {
    // theme: {
    //   monochrome: {
    //     enabled: true,
    //   },
    // },
    chart: {
      // height: 220,
      type: 'pie',
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
        },
      },
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    dataLabels: {
      formatter(val, opts) {
        const name = opts.w.globals.labels[opts.seriesIndex]
        return [name, val.toFixed(1) + '%']
      },
    },
    legend: {
      show: false,
    },
    // responsive: [{
    //   breakpoint: 480,
    //   options: {
    //     chart: {
    //       width: 200
    //     },
    //     legend: {
    //       position: 'bottom'
    //     }
    //   }
    // }]
    },
  };

  return (
    <div className="grow" style={{width: '45%'}}>
      <p className="font-bold text-xl mb-2 text-center">Top Services</p>
      <div id="chart">
        <ReactApexChart options={state.options} series={state.series} type='pie' height={300} />
      </div>
      {/* <div id="html-dist"></div> */}
    </div>
  );
}

const UserVisitStatChart = ({currentUser}) => {
  const [dataSeries, setDataSeries] = useState([])
  const minDate = moment().subtract(2, 'months').startOf('month').toDate()
  const maxDate = moment().add(2, 'months').startOf('month').toDate()

  const fetchUserVisit = useCallback(async () => {
    const requestBody = {
      provider_id: currentUser.provider_id,
      start_date: minDate,
      end_date: maxDate
    }
    let response = await apiGetUserVisitByDateRange(requestBody)

    if (response.success && response?.userVisit) {
      setDataSeries(response.userVisit)
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Fetching Data',
        icon: 'warning',
        showCancelButton: true
      })
    }
  }, [])
  useEffect(() => {
    fetchUserVisit()
  }, [])

  const state = {
    series: [{
      name: "user visit",
      data: dataSeries
    }],
    options: {
      chart: {
        type: 'bar',
        height: 380
      },
      xaxis: {
        type: 'category',
        // labels: {
        //   formatter: function(val) {
        //     return "Q" + dayjs(val).quarter()
        //   }
        // },
        // group: {
        //   style: {
        //     fontSize: '10px',
        //     fontWeight: 700
        //   },
        //   groups: [
        //     { title: '2019', cols: 4 },
        //     { title: '2020', cols: 4 }
        //   ]
        // },
        borderColor: '#999',
        labels: {
          show: true,
          style: {
            colors: "white",
            background: '#00E396'
          }
        }
      },
      yaxis: {
        borderColor: '#999',
        labels: {
          show: true,
          style: {
            colors: "white",
            background: '#00E396'
          }
        }
      }
      // tooltip: {
      //   x: {
      //     formatter: function(val) {
      //       return "Q" + dayjs(val).quarter() + " " + dayjs(val).format("YYYY")
      //     }  
      //   }
      // },
    },
  
  };

    return (
      <div className="grow" style={{width: '45%'}}>
        <p className="font-bold text-xl mb-2 text-center">Monthly Visit</p>
        <div id="chart">
          <ReactApexChart options={state.options} series={state.series} type="bar" height={400} />
        </div>
        {/* <div id="html-dist"></div> */}
      </div>
    );
}


function ApexChart() {
  const [chartSelection, setChartSelection] = useState("one_year")
  const {current} = useSelector((state) => state.user);

  const [dailyRevenue, setDailyRevenue] = useState([])
  const minDate = moment().subtract(2, 'months').startOf('month').toDate()
  const maxDate = moment().add(2, 'months').startOf('month').toDate()

  const fetchDailyRevenue = useCallback(async () => {
    const requestBody = {
      provider_id: current.provider_id,
      start_date: minDate,
      end_date: maxDate
    }
    let response = await apiGetDailyRevenueByDateRange(requestBody)

    if (response.success && response?.revenue) {
      setDailyRevenue(response.revenue)
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
        showCancelButton: true
      })
    }
  }, [])
  useEffect(() => {
    fetchDailyRevenue()
  }, [])

  const state = {   
    series: [{
      data: dailyRevenue
    }],
    options: {
      chart: {
        id: 'area-datetime',
        type: 'area',
        // zoom: {
        //   autoScaleYaxis: true
        // },
      },
      // annotations: {
        yaxis:{
          y: 30,
          borderColor: '#999',
          labels: {
            show: true,
            style: {
              colors: "white",
              background: '#00E396'
            }
          }
        },
        xaxis: {
          type: 'datetime',
          min: minDate.getTime(),
          tickAmount: 6,
          max: maxDate.getTime(),
          borderColor: '#999',
          yAxisIndex: 0,
          labels: {
            show: true,
            style: {
              colors: "white",
              background: '#775DD0'
            }
          }
        },
      // },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
        style: 'hollow',
        strokeWidth: 2,
      },
      tooltip: {
        x: {
          format: 'dd MMMM yyyy'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
    },
    selection: chartSelection,
  };

  const updateData = useCallback((timeline) => {
    setChartSelection(timeline)
  
    switch (timeline) {
      case 'one_month':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date('28 Jan 2013').getTime(),
          new Date('27 Feb 2013').getTime()
        )
        break
      case 'six_months':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date('27 Sep 2012').getTime(),
          new Date('27 Feb 2013').getTime()
        )
        break
      case 'one_year':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date('27 Feb 2012').getTime(),
          new Date('27 Feb 2013').getTime()
        )
        break
      case 'ytd':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date('01 Jan 2013').getTime(),
          new Date('27 Feb 2013').getTime()
        )
        break
      case 'all':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date('23 Jan 2012').getTime(),
          new Date('27 Feb 2013').getTime()
        )
        break
      default:
    }
  }, [])


    return (
      <div className="grow" style={{width: '55%'}}>
        <p className="font-bold text-xl mb-2 text-center">Recent Revenue</p>
        <div id="chart">
          {/* <div className="toolbar flex gap-3 ml-4">
            <button id="one_month" style={{border: '1px solid white', padding: '3px', borderRadius: '5px'}}
                onClick={()=>updateData('one_month')} className={ (state.selection==='one_month' ? 'active' : '') }>
              1M
            </button>
             
            <button id="six_months" style={{border: '1px solid white', padding: '3px', borderRadius: '5px'}}
                onClick={()=>updateData('six_months')} className={ (state.selection==='six_months' ? 'active' : '') }>
              6M
            </button>
             
            <button id="one_year" style={{border: '1px solid white', padding: '3px', borderRadius: '5px'}}
                onClick={()=>updateData('one_year')} className={ (state.selection==='one_year' ? 'active' : '') }>
              1Y
            </button>

            <button id="ytd" style={{border: '1px solid white', padding: '3px', borderRadius: '5px'}}
                onClick={()=>updateData('ytd')} className={ (state.selection==='ytd' ? 'active' : '') }>
              YTD
            </button>
             
            <button id="all" style={{border: '1px solid white', padding: '3px', borderRadius: '5px'}}
                onClick={()=>updateData('all')} className={ (state.selection==='all' ? 'active' : '') }>
              ALL
            </button>
          </div> */}
        
          <div id="chart-timeline">
            <ReactApexChart options={state.options} series={state.series} type="area" height={380} />
          </div>
        </div>
        {/* <div id="html-dist"></div> */}
      </div>
  );
}

export default DashBoard