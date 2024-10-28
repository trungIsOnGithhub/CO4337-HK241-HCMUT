  import React, { useCallback, useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { apiGetDailyRevenueByDateRange, apiGetRevenueStatistic, apiGetUserVisitByDateRange } from 'apis'
import { useSelector } from 'react-redux';
import moment from 'moment';
import Swal from 'sweetalert2'
import { apiGetMostPurchasedServicesByYear } from 'apis'
import { FaAngleDoubleUp, FaAngleDoubleDown, FaBars } from "react-icons/fa";
import GridPercentageCalendar from './GridPercentageCalendar';
// // import './style.css';
import bgImage from '../../assets/clouds.svg'

const button_string_style = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 roundedtext-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 text-sm'

const MetricIndicator = ({ prev, current }) => {
  return (
    <span>
      {
      current > prev &&
        (<span className="flex justify-center items-center">
            <span className='text-teal-500 pr-1 text-center text-base'>{(current - prev).toFixed(2)}</span>
            <FaAngleDoubleUp style={{color: 'green' }} className='text-teal-500 rotate-45'/>
        </span>)
      }
      {
      current < prev && 
        (<span className="flex justify-center items-center">
            <span className='text-rose-700 pr-1 text-center text-base'>{(prev - current).toFixed(2)}</span>
            <FaAngleDoubleDown className='text-rose-700 rotate-105'/>
        </span>)
      }
      {current === prev && <FaBars />}
    </span>
  )  
}

const DashBoard = () => {
  const {current} = useSelector((state) => state.user);
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [monthOrders, setMonthOrders] = useState(0)
  const [monthCustomer, setMonthCustomer] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [currentMetricView, setCurrentMetricView] = useState(0);

  const metricViewOptions = [
    { value: 3, label: "Current Week" },
    { value: 2, label: "Last Week" },
    { value: 1, label: "Current Month" },
    { value: 0, label: "Last Month" },
  ];

  const revenueLast3Months = [88.8, 68.8, 39.6];// sort by time line [2w ago, 1w ago, now]
  const revenueLast3Weeks = [8.8, 6.8, 9.6];// sort by time line [2m ago, 1m ago, now]

  const actualWorkHoursThisMonth = [];// sort by time line [2m ago, 1m ago, now]
  // const actualWorkHoursThisMonth = [];

  const fetchDailyRevenue = useCallback(async () => {
    const requestBody = {
      provider_id: current.provider_id
    }
    let response = await apiGetRevenueStatistic(requestBody)


    // if (response.success && response?.success) {
    //   setTotalRevenue(response.statistic?.totalRevenue);
    //   setMonthRevenue(response.statistic?.monthRevenue);
    //   setMonthOrders(response.statistic?.monthOrders);
    //   setMonthCustomer(response.statistic?.monthCustomer);
    //   setTotalServices(response.statistic?.totalServices)
    // }
    // else {
    //   Swal.fire({
    //     title: 'Error Occured',
    //     text: 'Error Occured Reading Data',
    //     icon: 'warning',
    //     showCancelButton: true
    //   })
    // }
  }, [])
  useEffect(() => {
    fetchDailyRevenue()
  }, [])

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Dashboard</span>
        </div>
        <div className='w-[95%] h-[fit] shadow-2xl rounded-md bg-white ml-4 mb-[200px] p-6 flex flex-col gap-4'>
      <div className="flex justify-center mb-8 flex-wrap">
        {/* <div className="max-w-sm rounded overflow-hidden grow">
          <div className="px-6 py-4">
            <p className="font-bold text-xl mb-2 text-center">Total Revenue</p>
            <p className="font-bold text-blue-700 text-xl text-center">
              {totalRevenue}
            </p>
          </div>
        </div> */}

        <div className="flex gap-4">
          <section className='grid grid-cols-2 gap-2 min-w-40 bg-slate-50 p-3 text-gray-900 rounded-md grow border-2'>
            <div className='flex flex-col justify-start'>
              <h5 className='pb-2'>
                Metric
              </h5>
              <span className='text-lg font-bold text-center'>
                { currentMetricView === 3 && revenueLast3Weeks[2] }
                { currentMetricView === 2 && revenueLast3Weeks[1] }
                { currentMetricView === 1 && revenueLast3Months[2] }
                { currentMetricView === 0 && revenueLast3Months[1] }
              </span>
            </div>
            <div className='flex flex-col justify-start'>
              <select
                className="text-xs"
                onChange={(event) => { setCurrentMetricView(parseInt(event.target.value)); }}
                
              >
                {metricViewOptions.map(
                  (opt, idx) => { 
                    if (idx > 0)
                      return <option className="text-xs" value={opt?.value}>{opt?.label}</option>
                    return <option className="text-xs" selected="selected" value={opt?.value}>{opt?.label}</option>
                  }
                )}
              </select>
              <div className='mt-3'>
                  {
                    currentMetricView === 3 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[1]} current={revenueLast3Weeks[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 2 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[0]} current={revenueLast3Weeks[1]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 1 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 0 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[0]}>
                      </MetricIndicator>
                    // (<>
                    //   {(revenueLast3Months[1] > revenueLast3Months[0]) && <FaAngleDoubleUp />}
                    //   {(revenueLast3Months[1] < revenueLast3Months[0]) && <FaAngleDoubleDown />}
                    //   {(revenueLast3Months[1] === revenueLast3Months[0]) && <FaBars />}
                    // </>)
                  }
              </div>
            </div>
          </section>

          <section className='grid grid-cols-2 gap-2 min-w-40 bg-slate-50 p-3 text-gray-900 rounded-md grow border-2'>
            <div className='flex flex-col justify-start'>
              <h5 className='pb-2'>
                Metric
              </h5>
              <span className='text-lg font-bold text-center'>
                { currentMetricView === 3 && revenueLast3Weeks[2] }
                { currentMetricView === 2 && revenueLast3Weeks[1] }
                { currentMetricView === 1 && revenueLast3Months[2] }
                { currentMetricView === 0 && revenueLast3Months[1] }
              </span>
            </div>
            <div className='flex flex-col justify-start'>
              <select
                className="text-xs"
                onChange={(event) => { setCurrentMetricView(parseInt(event.target.value)); }}
                
              >
                {metricViewOptions.map(
                  (opt, idx) => { 
                    if (idx > 0)
                      return <option className="text-xs" value={opt?.value}>{opt?.label}</option>
                    return <option className="text-xs" selected="selected" value={opt?.value}>{opt?.label}</option>
                  }
                )}
              </select>
              <div className='mt-3'>
                  {
                    currentMetricView === 3 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[1]} current={revenueLast3Weeks[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 2 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[0]} current={revenueLast3Weeks[1]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 1 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 0 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[0]}>
                      </MetricIndicator>
                    // (<>
                    //   {(revenueLast3Months[1] > revenueLast3Months[0]) && <FaAngleDoubleUp />}
                    //   {(revenueLast3Months[1] < revenueLast3Months[0]) && <FaAngleDoubleDown />}
                    //   {(revenueLast3Months[1] === revenueLast3Months[0]) && <FaBars />}
                    // </>)
                  }
              </div>
            </div>
          </section>


          <section className='grid grid-cols-2 gap-2 min-w-40 bg-slate-50 p-3 text-gray-900 rounded-md grow border-2'>
            <div className='flex flex-col justify-start'>
              <h5 className='pb-2'>
                Metric
              </h5>
              <span className='text-lg font-bold text-center'>
                { currentMetricView === 3 && revenueLast3Weeks[2] }
                { currentMetricView === 2 && revenueLast3Weeks[1] }
                { currentMetricView === 1 && revenueLast3Months[2] }
                { currentMetricView === 0 && revenueLast3Months[1] }
              </span>
            </div>
            <div className='flex flex-col justify-start'>
              <select
                className="text-xs"
                onChange={(event) => { setCurrentMetricView(parseInt(event.target.value)); }}
                
              >
                {metricViewOptions.map(
                  (opt, idx) => { 
                    if (idx > 0)
                      return <option className="text-xs" value={opt?.value}>{opt?.label}</option>
                    return <option className="text-xs" selected="selected" value={opt?.value}>{opt?.label}</option>
                  }
                )}
              </select>
              <div className='mt-3'>
                  {
                    currentMetricView === 3 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[1]} current={revenueLast3Weeks[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 2 &&
                      <MetricIndicator
                        prev={revenueLast3Weeks[0]} current={revenueLast3Weeks[1]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 1 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[2]}>
                      </MetricIndicator>
                  }
                  {
                    currentMetricView === 0 &&
                      <MetricIndicator
                        prev={revenueLast3Months[1]} current={revenueLast3Months[0]}>
                      </MetricIndicator>
                    // (<>
                    //   {(revenueLast3Months[1] > revenueLast3Months[0]) && <FaAngleDoubleUp />}
                    //   {(revenueLast3Months[1] < revenueLast3Months[0]) && <FaAngleDoubleDown />}
                    //   {(revenueLast3Months[1] === revenueLast3Months[0]) && <FaBars />}
                    // </>)
                  }
              </div>
            </div>
          </section>
        </div>

        {/* <div className="max-w-sm rounded overflow-hidden grow">
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
        </div> */}
        {/* <div className="max-w-sm rounded overflow-hidden grow">
          <div className="px-6 py-4">
            <p className="font-bold text-xl mb-2 text-center">Total Services</p>
            <p className="font-bold text-blue-700 text-xl text-center">
              {totalServices}
            </p>
          </div>
        </div> */}
        {/* <div className="max-w-sm rounded overflow-hidden grow">
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-1 text-center">Total dsadsad</div>
            <p className="font-bold text-blue-700 text-xl text-center">
              sdk;alsdk
            </p>
          </div>
        </div> */}

      </div>
        <div class="grid grid-cols-10 gap-4">
          <div class="col-span-7">
            <div class="grid grid-cols-10 gap-4">
              <div class="col-span-3 grid grid-cols-2 gap-2 text-gray-900">
                <div className='flex flex-col justify-start'>
                    <h5 className='pb-2'>
                      Metric
                    </h5>
                    <span className='text-lg font-bold text-center'>
                      { currentMetricView === 3 && revenueLast3Weeks[2] }
                      { currentMetricView === 2 && revenueLast3Weeks[1] }
                      { currentMetricView === 1 && revenueLast3Months[2] }
                      { currentMetricView === 0 && revenueLast3Months[1] }
                    </span>
                  </div>
                  <div className='flex flex-col justify-start'>
                    <select
                      className="text-xs"
                      onChange={(event) => { setCurrentMetricView(parseInt(event.target.value)); }}
                      
                    >
                      {metricViewOptions.map(
                        (opt, idx) => { 
                          if (idx > 0)
                            return <option className="text-xs" value={opt?.value}>{opt?.label}</option>
                          return <option className="text-xs" selected="selected" value={opt?.value}>{opt?.label}</option>
                        }
                      )}
                    </select>
                    <div className='mt-3'>
                        {
                          currentMetricView === 3 &&
                            <MetricIndicator
                              prev={revenueLast3Weeks[1]} current={revenueLast3Weeks[2]}>
                            </MetricIndicator>
                        }
                        {
                          currentMetricView === 2 &&
                            <MetricIndicator
                              prev={revenueLast3Weeks[0]} current={revenueLast3Weeks[1]}>
                            </MetricIndicator>
                        }
                        {
                          currentMetricView === 1 &&
                            <MetricIndicator
                              prev={revenueLast3Months[1]} current={revenueLast3Months[2]}>
                            </MetricIndicator>
                        }
                        {
                          currentMetricView === 0 &&
                            <MetricIndicator
                              prev={revenueLast3Months[1]} current={revenueLast3Months[0]}>
                            </MetricIndicator>
                          // (<>
                          //   {(revenueLast3Months[1] > revenueLast3Months[0]) && <FaAngleDoubleUp />}
                          //   {(revenueLast3Months[1] < revenueLast3Months[0]) && <FaAngleDoubleDown />}
                          //   {(revenueLast3Months[1] === revenueLast3Months[0]) && <FaBars />}
                          // </>)
                        }
                    </div>
                </div>
              </div>

              <div class="col-span-7 grid grid-cols-2 gap-2 text-gray-900">
                  <div className='flex flex-col justify-start'>
                  <h5 className='pb-2'>
                    Metric
                  </h5>
                  <span className='text-lg font-bold text-center'>
                    { currentMetricView === 3 && revenueLast3Weeks[2] }
                    { currentMetricView === 2 && revenueLast3Weeks[1] }
                    { currentMetricView === 1 && revenueLast3Months[2] }
                    { currentMetricView === 0 && revenueLast3Months[1] }
                  </span>
                </div>
                <div className='flex flex-col justify-start'>
                  <select
                    className="text-xs"
                    onChange={(event) => { setCurrentMetricView(parseInt(event.target.value)); }}
                    
                  >
                    {metricViewOptions.map(
                      (opt, idx) => { 
                        if (idx > 0)
                          return <option className="text-xs" value={opt?.value}>{opt?.label}</option>
                        return <option className="text-xs" selected="selected" value={opt?.value}>{opt?.label}</option>
                      }
                    )}
                  </select>
                  <div className='mt-3'>
                      {
                        currentMetricView === 3 &&
                          <MetricIndicator
                            prev={revenueLast3Weeks[1]} current={revenueLast3Weeks[2]}>
                          </MetricIndicator>
                      }
                      {
                        currentMetricView === 2 &&
                          <MetricIndicator
                            prev={revenueLast3Weeks[0]} current={revenueLast3Weeks[1]}>
                          </MetricIndicator>
                      }
                      {
                        currentMetricView === 1 &&
                          <MetricIndicator
                            prev={revenueLast3Months[1]} current={revenueLast3Months[2]}>
                          </MetricIndicator>
                      }
                      {
                        currentMetricView === 0 &&
                          <MetricIndicator
                            prev={revenueLast3Months[1]} current={revenueLast3Months[0]}>
                          </MetricIndicator>
                        // (<>
                        //   {(revenueLast3Months[1] > revenueLast3Months[0]) && <FaAngleDoubleUp />}
                        //   {(revenueLast3Months[1] < revenueLast3Months[0]) && <FaAngleDoubleDown />}
                        //   {(revenueLast3Months[1] === revenueLast3Months[0]) && <FaBars />}
                        // </>)
                      }
                  </div>
                </div>
              </div>
            </div>

            <div class="">
              {/*

              <div className="flex">
                <ApexChart />
                <UserVisitStatChart
                  currentUser={current}
                />
              </div> */}
            </div>

            <div class="grid grid-cols-10 gap-4 text-gray-900">
              <div class="col-span-3">
                <span className='text-lg font-bold'>
                  New Customers
                </span>
                <div className='flex gap-6'>
                  <span>10</span>
                  <span>71.4%</span>
                </div>
              </div>
              <div class="col-span-7">
                <span className='text-lg font-bold'>
                  Returning Customers
                </span>
                <div className='flex gap-6'>
                  <span>4</span>
                  <span>28.6%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-3">
            <GridPercentageCalendar />
          </div>
      </div>
      {/* <div className="flex">
        <MostPurchasedServicesByYear
          currentUser={current}
        />
        <MostPurchasedServicesByYear
          currentUser={current}
        />
      </div> */}
        </div>
      </div>
    </div>
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

    // if (response.success && response?.services) {
    //   setDataSeries(response.services);
    // }
    // else {
    //   Swal.fire({
    //     title: 'Error Occured',
    //     text: 'Error Occured Fetching Data',
    //     icon: 'warning',
    //     showCancelButton: true
    //   })
    // }
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

    // if (response.success && response?.userVisit) {
    //   setDataSeries(response.userVisit)
    // }
    // else {
    //   Swal.fire({
    //     title: 'Error Occured',
    //     text: 'Error Occured Fetching Data',
    //     icon: 'warning',
    //     showCancelButton: true
    //   })
    // }
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
      <div className="grow" style={{width: '200px'}}>
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

    // if (response.success && response?.revenue) {
    //   setDailyRevenue(response.revenue)
    // }
    // else {
    //   Swal.fire({
    //     title: 'Error Occured',
    //     text: 'Error Occured Reading Data',
    //     icon: 'warning',
    //     showCancelButton: true
    //   })
    // }
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
        {/* <p className="font-bold text-xl mb-2 text-center">Recent Revenue</p>
        <div id="chart">
        
          <div id="chart-timeline">
            <ReactApexChart options={state.options} series={state.series} type="area" height={380} />
          </div>
        </div> */}
        
        {/* <div id="html-dist"></div> */}
      </div>
  );
}

export default DashBoard