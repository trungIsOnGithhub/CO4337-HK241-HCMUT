import React, { useCallback, useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { apiGetDailyRevenueByDateRange } from 'apis'
// // import './style.css';

const button_string_style = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 roundedtext-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 text-sm'

const DashBoard = () => {
  const [dailyRevenue, setDailyRevenue] = useState([])
  const {current} = useSelector((state) => state.user);

  const fetchDailyRevenue = useCallback(async () => {
    const requestBody = {
      provider_id: current.provider_id,
      start_date: Date.parse("2024-05-01"),
      end_date: new Date()
    }
    let response = await apiGetDailyRevenueByDateRange(requestBody)

    if (response.success) {
      setDailyRevenue(response.revenue)
    }
  }, [])
  useEffect(() => {
    fetchDailyRevenue()
  }, [current])

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
    <div class="flex justify-center mb-8 flex-wrap">
      <div class="max-w-sm rounded overflow-hidden grow">
        <div class="px-6 py-4">
          <p class="font-bold text-xl mb-2 text-center">Total dsadsad</p>
          <p class="font-bold text-blue-700 text-xl text-center">
            dákdjla
          </p>
        </div>
      </div>
      <div class="max-w-sm rounded overflow-hidden grow">
        <div class="px-6 py-4">
          <p class="font-bold text-xl mb-2 text-center">Total dsadsad</p>
          <p class="font-bold text-blue-700 text-xl text-center">
            dákdjla
          </p>
        </div>
      </div>
      <div class="max-w-sm rounded overflow-hidden grow">
        <div class="px-6 py-4">
          <p class="font-bold text-xl mb-2 text-center">Total dsadsad</p>
          <p class="font-bold text-blue-700 text-xl text-center">
            dákdjla
          </p>
        </div>
      </div>
      <div class="max-w-sm rounded overflow-hidden grow">
        <div class="px-6 py-4">
          <p class="font-bold text-xl mb-2 text-center">Total dsadsad</p>
          <p class="font-bold text-blue-700 text-xl text-center">
            sdk;alsdk
          </p>
        </div>
      </div>
      <div class="max-w-sm rounded overflow-hidden grow">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-1 text-center">Total dsadsad</div>
          <p class="font-bold text-blue-700 text-xl text-center">
            sdk;alsdk
          </p>
        </div>
      </div>

    </div>
    <div class="flex">

      <ApexChart/>
      <UserVisitStatChart />
    </div>
    </>
  );
}


const UserVisitStatChart = () => {
    const state = {
      series: [{
        name: "sales",
        data: [{
          x: '2019/01/01',
          y: 400
        }, {
          x: '2019/04/01',
          y: 430
        }, {
          x: '2019/07/01',
          y: 448
        }, {
          x: '2019/10/01',
          y: 470
        }, {
          x: '2020/01/01',
          y: 540
        }, {
          x: '2020/04/01',
          y: 580
        }, {
          x: '2020/07/01',
          y: 690
        }, {
          x: '2020/10/01',
          y: 690
        }]
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
          group: {
            style: {
              fontSize: '10px',
              fontWeight: 700
            },
            groups: [
              { title: '2019', cols: 4 },
              { title: '2020', cols: 4 }
            ]
          },
          borderColor: '#999',
          labels: {
            show: true,
            style: {
              colors: "white",
              background: '#00E396'
            }
          }
        },
        title: {
          text: 'Users Visits',
          colors: "white",
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
      <div class="grow" style={{width: '45%'}}>
        <div id="chart">
          <ReactApexChart options={state.options} series={state.series} type="bar" height={400} />
        </div>
        {/* <div id="html-dist"></div> */}
      </div>
    );
}


function ApexChart() {
  const [chartSelection, setChartSelection] = useState("one_year")

  const state = {   
    series: [{
      data: [
        [1327359600000,30.95],
        [1327446000000,31.34],
        [1327532400000,31.18],
        [1361833200000,38.59],
        [1361919600000,39.60],
      ]
    }],
    options: {
      chart: {
        id: 'area-datetime',
        type: 'area',
        zoom: {
          autoScaleYaxis: true
        },
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
          min: new Date('01 Mar 2012').getTime(),
          tickAmount: 6,
          x: new Date('14 Nov 2012').getTime(),
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
      <div class="grow" style={{width: '55%'}}>
        <div id="chart">
          <div class="toolbar flex gap-3 ml-4">
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
          </div>
        
          <div id="chart-timeline">
            <ReactApexChart options={state.options} series={state.series} type="area" height={380} />
          </div>
        </div>
        {/* <div id="html-dist"></div> */}
      </div>
  );
}

export default DashBoard