import Swal from 'sweetalert2';
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react';
import { FaClock, FaTrashAlt } from 'react-icons/fa';
import { Button } from 'components';
import { apiGetServiceProviderById, apiUpdateCurrentServiceProvider, apiUpdateStaffShift, apiGetAllStaffs } from 'apis';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// const timeOptions = ["9:00 am", "10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm"];

const OfficeHours = ({ day, periods, isEnabled, onPeriodChange, onToggleChange, onApplyToOtherDays }) => {
  // const [newShiftStart, setNewShiftStart] = useState("00:00"); // format of html time input
  // const [newShiftEnd, setNewShiftEnd] = useState("00:00"); // format of html time input

  return (
    <div className={`p-4 rounded-md shadow-md w-full mt-4 ${isEnabled ? 'bg-white' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaClock className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-700">{day}</h2>
        </div>
        {/* Toggle button to enable/disable the day */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={() => {console.log("day::::", day); onToggleChange(day)}}
            className="hidden"
          />
          <span
            className={`relative inline-block w-10 h-5 transition bg-gray-300 rounded-full ${
              isEnabled ? 'bg-blue-500' : ''
            }`}
          >
            <span
              className={`absolute left-0 inline-block w-6 h-5 py-1 transition transform bg-white rounded-full ${
                isEnabled ? 'translate-x-full' : ''
              }`}
            ></span>
          </span>
        </label>
      </div>

      {/* Time Inputs, disabled if isEnabled is false */}
      {isEnabled &&
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col w-1/2">
            <label className="text-sm font-medium text-gray-600">Start</label>
            <div className="flex items-center px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md">
              <FaClock className="mr-2 text-gray-500" />

              <input
                name="startShift"
                type="time"
                id="startShift"
                placeholder={"..."}
                value={periods?.start || "00:00"}
                className="form-input text-gray-600 my-auto rounded-md"
                onChange={(event) => { onPeriodChange(day, 'start', event.target.value); }}
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="text-sm font-medium text-gray-600">Finish</label>
            <div className="flex items-center px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md">
              <FaClock className="mr-2 text-gray-500" />

              <input
                name="endShift"
                type="time"
                id="endShift"
                placeholder={"..."}
                value={periods?.end || "00:00"}
                className="form-input text-gray-600 my-auto rounded-md"
                onChange={(event) => { onPeriodChange(day, 'end', event.target.value); }}
              />
            </div>
          </div>

          {/* <button
            className="flex items-center justify-center w-10 h-10 mt-6 text-gray-500 transition bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => onPeriodChange(day, 'delete')}
            disabled={!isEnabled}  // Disables delete if isEnabled is false
          >
            <FaTrashAlt />
          </button> */}
        </div>
      }

      {/* {isEnabled && <div className="flex items-center mt-4">
        <button
          onClick={() => onPeriodChange(day, periods.length, 'add')}
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition bg-blue-50 rounded hover:bg-blue-100"
          disabled={!isEnabled}  // Disables add button if isEnabled is false
        >
          + Add Period
        </button>
      </div> } */}

      {isEnabled && <div className="flex justify-end mt-4">
        <button
          onClick={() => onApplyToOtherDays(day)}
          className="text-sm font-medium text-blue-600 hover:underline"
          disabled={!isEnabled}  // Disables apply if isEnabled is false
        >
          Apply to Other Days
        </button>
      </div> }
    </div>
  );
};


const WeeklyOfficeHours = () => {
  const {current} = useSelector(state => state.user);

  const fetchCurrentProviderWorkingHours = async () => {
    if (!current?.provider_id?.time) {
      Swal.fire("Error Occured!!", "Cannot Fetched Working Hours Data!", "error");
      return;
    }
    let resp = await apiGetServiceProviderById(current.provider_id?._id);

    // console.log('YYYYYYYYYYYYYYY', resp.payload);
    if (!resp.success && !resp.payload) {
      Swal.fire("Error Occured!", "Cannot fetch provider data!", 'error');
      return;
    }

    // console.log("=========", current?.provider_id?.time)
    const oh = daysOfWeek.reduce((acc, day) => {
      const respKeyIndex = day.toLowerCase();

      let periodsData = [];
      if (resp.payload.time[`start${respKeyIndex}`] &&
          resp.payload.time[`end${respKeyIndex}`] )
      {
        periodsData = {
          start: resp.payload.time[`start${respKeyIndex}`],
          end: resp.payload.time[`end${respKeyIndex}`]
        };
        acc[day] = {
          isEnabled: true,
          periods: periodsData
        };
      }
      else {
        acc[day] = {
          isEnabled: false,
          periods: { start: '00:00', end:"00:00" }
        };
      }
      // console.log('djjaksjds', acc);

      return acc;
    }, {});

    setOfficeHours(oh);
  };

  useEffect(() => {
    fetchCurrentProviderWorkingHours();
  }, [current]);

  // const [officeHours, setOfficeHours] = useState(
  //   daysOfWeek.reduce((acc, day) => {
  //     acc[day] = { isEnabled: true, periods: [{ start: '00:00', finish: '00:00' }] };
  //     return acc;
  //   }, {})
  // );

  const [officeHours, setOfficeHours] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [sourceDay, setSourceDay] = useState(null);

  const handlePeriodChange = (day, field, value) => {
    setOfficeHours((prev) => {
      if (!prev[day]) {
        prev[day] = { periods: {start: "00:00", end: "00:00" }, isEnabled: true };
      }
      const updatedDay = { ...prev[day] }; 
      console.log('=====}}}}}}', updatedDay, day);
      updatedDay.periods[field] = value;

      // if (field === 'add') {
      //   updatedDay.periods.push({ start: '9:00 am', finish: '5:00 pm' });
      // } else
      // if (field === 'delete') {
      //   updatedDay.periods.splice(index, 1);
      // // } else {
      //   updatedDay.periods[field] = value;
      // }
      return { ...prev, [day]: updatedDay };
    });
  };

  const handleToggleChange = (day) => {
    setOfficeHours((prev) => {
      if (!prev[day]) {
        prev[day] = { periods: {start: "00:00", end: "00:00" }, isEnabled: true };
      } 
      console.log(day, '--------', {
        ...prev,
        [day]: { ...prev[day], isEnabled: !prev[day].isEnabled },
      });

      return {
        ...prev,
        [day]: { ...prev[day], isEnabled: !prev[day].isEnabled },
      };
    });
  };

  const handleApplyToOtherDays = (day) => {
    setSourceDay(day);
    setShowModal(true);
  };

  const handleModalApply = (targetDays) => {
    setOfficeHours((prev) => {
      const sourceSettings = prev[sourceDay];
      const updatedOfficeHours = { ...prev };
      targetDays.forEach((day) => {
        updatedOfficeHours[day] = { ...sourceSettings };
      });
      return updatedOfficeHours;
    });
    setShowModal(false);
  };

  const transfotmOfficeHoutToWorkingTimeFormat = (oh) => {
    const wt = {};

    for (const p of Object.entries(oh)) {
      const lowerK = p[0].toLowerCase();
      const startPK = `start${lowerK}`;
      const endPK = `end${lowerK}`;

      if (!p[1]?.isEnabled || !p[1]?.periods) {
        wt[startPK] = "";
        wt[endPK] = "";
        continue;
      }

      wt[startPK] = p[1].periods?.start;
      wt[endPK] = p[1].periods?.end;

      // console.log('======', p);

      // if (!pT[endPK] || !pT[startPK] ) {
      //     return p[0];
      // }
    }
    return wt;
  }
  // const transformOfficeHoutToWorkingTimeFormat = (oh) => {
  //   const wt = {};

  //   for (const p of Object.entries(oh)) {
  //     const lowerK = p[0].toLowerCase();
  //     const startPK = `start${lowerK}`;
  //     const endPK = `end${lowerK}`;

  //     if (!p[1]?.isEnabled || !p[1]?.periods) {
  //       wt[startPK] = "";
  //       wt[endPK] = "";
  //       continue;
  //     }

  //     wt[startPK] = p[1].periods?.start;
  //     wt[endPK] = p[1].periods?.end;

  //     // console.log('======', p);

  //     // if (!pT[endPK] || !pT[startPK] ) {
  //     //     return p[0];
  //     // }
  //   }
  //   return wt;
  // }

  return (
    <div className="w-3/4 pl-8">
      {daysOfWeek.map((day) => (
        <OfficeHours
        key={day}
        day={day}
        periods={officeHours[day]?.periods || {}}
        isEnabled={typeof(officeHours[day]?.isEnabled) === 'boolean' ? officeHours[day]?.isEnabled : true}
        onPeriodChange={handlePeriodChange}
        onToggleChange={handleToggleChange}
        onApplyToOtherDays={handleApplyToOtherDays}
        />
      ))}
      {showModal && <ApplyToDaysModal sourceDay={sourceDay} onApply={handleModalApply} onClose={() => setShowModal(false)} />}
      
      <span
        className='flex justify-end'
      >
        <button
        className='bg-blue-700 p-3 rounded-md mt-4'
        onClick={async () => {
          // console.log('hhehehhehe')
          // console.log('++++++++++++++++', officeHours);
          let swalResult = await Swal.fire({
            title: "Confirm Working Hour Modified?",
            text: 'Modify Working Hour would Reset Staffs Shift and Violate Orders!',
            icon: 'warning',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Not now',                
          });

          if (swalResult.isConfirmed) {
            const workingTime = transfotmOfficeHoutToWorkingTimeFormat(officeHours);
            console.log('----><>><><><.', workingTime);
  
            let resp = await apiUpdateCurrentServiceProvider(current.provider_id?._id, { time: workingTime });


            if (resp.success) {
              const newOh = daysOfWeek.reduce((acc, day) => {
                const respKeyIndex = day.toLowerCase();

                console.log('---->', resp);
          
                let periodsData = [];
                if (resp.updatedServiceProvider.time[`start${respKeyIndex}`] &&
                    resp.updatedServiceProvider.time[`end${respKeyIndex}`] )
                {
                  periodsData = {
                    start: resp.updatedServiceProvider.time[`start${respKeyIndex}`],
                    end: resp.updatedServiceProvider.time[`end${respKeyIndex}`]
                  };
                  acc[day] = {
                    isEnabled: true,
                    periods: periodsData
                  };
                }
                else {
                  acc[day] = {
                    isEnabled: false,
                    periods: { start: '00:00', end:"00:00" }
                  };
                }
                // console.log('djjaksjds', acc);
          
                return acc;
              }, {});

              let stffs = await apiGetAllStaffs();
              if (stffs.success && stffs.staffs) {
                for (let stf of stffs.staffs) {
                  console.log('>>>>>>', stf._id);
                  let resp = await apiUpdateStaffShift({staffId: stf._id, newShifts:newOh});


                }
              }

              fetchCurrentProviderWorkingHours();

              Swal.fire('Update Successfully', resp?.mes, 'success');
            }
            else {
              Swal.fire('Error Occured', resp?.mes, 'error');
            }
          }
        }}>
          Apply Changes
        </button>
      </span>
    </div>
  );
};

const ApplyToDaysModal = ({ sourceDay, onApply, onClose }) => {
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDaySelection = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-80 transition duration-200">
        <h3 className="text-md font-semibold mb-4 text-gray-500">Apply
            <span className="border-2 border-blue-500 p-1 m-1 rounded-md">{sourceDay}</span>
          to Other Days</h3>
        <div className="space-y-2 border-2 p-2 rounded-md flex justify-center flex-wrap gap-6">
          {daysOfWeek.map((day) => (
            <label key={day} className={`flex items-center text-gray-500 font-semibold ${day === sourceDay ? 'opacity-50' : ''}`}>
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => toggleDaySelection(day)}
                disabled={day === sourceDay}
                className="mr-2"
              />
              {day}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-2 gap-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={() => onApply(selectedDays)}
            disabled={!selectedDays.length}
            className={`text-blue-600 ${selectedDays.length ? 'hover:underline' : 'opacity-50 cursor-not-allowed'}`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOfficeHours;
