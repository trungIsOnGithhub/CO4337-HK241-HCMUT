import Swal from 'sweetalert2';
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react';
import { FaClock, FaTrashAlt } from 'react-icons/fa';
import { apiGetOneStaff, apiUpdateStaffShift } from 'apis/staff';
import bgImage from '../../assets/clouds.svg'
import clsx from 'clsx';

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
            onChange={() => { onToggleChange(day)}}
            className="hidden"
          />
          <span
            className={`relative inline-block w-10 h-5 transition rounded-full ${
              isEnabled ? 'bg-blue-500' : 'bg-gray-300'
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
              <FaClock className="mr-2 text-[#00143c]" />

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
              <FaClock className="mr-2 text-[#00143c]" />

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
            className="flex items-center justify-center w-10 h-10 mt-6 text-[#00143c] transition bg-gray-100 rounded hover:bg-gray-200"
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

const ManageStaffShift = ({ staffId, setManageStaffShift, parentHandleSubmitStaffShift }) => {  
  const [currentStaff, setCurrentStaff] = useState(null);
  // const [currentStaffShifts, setCurrentStaffShifts] = useState(null);

  useEffect(() => {
    // console.log('_++++_+_+_+_+_+_+_+__+');

    if (!staffId?.length) {
      // Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
      return;
    }
    const fetchStaffData = async () => {
      // console.log(staffId, '_______|||||');

      let response = await apiGetOneStaff(staffId);

      if (response?.success && response?.staff) {
        console.log(response)
        setCurrentStaff(response.staff);
        setOfficeHours(response.staff?.shifts || {});
        // console.log(Object.values(response.staff?.shifts));
      }
      else {
        Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
      }
    }

    fetchStaffData();
  }, [staffId]);


  // };

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

  const handleSubmitStaffShift = async () => {
    if (parentHandleSubmitStaffShift) {
      parentHandleSubmitStaffShift(officeHours);
      setManageStaffShift(false);
      return;
    }
    if (!staffId?.length) {
     //  Swal.fire('Error Ocurred!!', 'Data Unavailable To Update Staff!', 'error');
      return;
    }
    let swalResult = await Swal.fire({
      title: "Confirm Shift Modified?",
      text: 'Modify Staff Shift May Affect Customer Order That Is Waiting!',
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Not now',                
    });

    console.log("++++", officeHours);

    if (swalResult.isConfirmed) {
      let resp = await apiUpdateStaffShift({staffId, newShifts:officeHours});

      if (resp.success && resp?.staff?.shifts) {
        setOfficeHours(resp.staff.shifts);
        Swal.fire('Success', 'Modified Staff Shift Successfully!', 'success');
        return;
      }

      Swal.fire('Error Ocurred!!', `${resp?.msg || 'Cannot Update Staff Shift!'}`, 'error');
    }
  };

  return (
    <div className={clsx(!staffId ? 'mt-[-68px]' : '')}>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative flex-col justify-center items-center"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='flex justify-start gap-5 p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Staff Shift</span>
          <span className='text-white text-md cursor-pointer p-2 bg-red-600 hover:bg-red-400 rounded-md'
            onClick={()=>setManageStaffShift(false)}>
            Go Back
          </span>
          <span className='text-white text-md cursor-pointer p-2 bg-green-600 hover:bg-green-400 rounded-md'
            onClick={handleSubmitStaffShift}>
            Submit Changes
          </span>
        </div>

        { staffId && <div className='m-3'>
            <div className='w-full flex gap-1 border text-slate-700'>
              <span className='w-[30%] text-center'>Email Address</span>
              <span className='w-[30%] text-center'>Full Name</span>
              <span className='w-[30%] text-center'>Phone</span>
            </div>
            <div className='w-full flex gap-1 border-b p-[8px]'>
                <div className='w-full flex border-2 gap-1 h-[56px] px-[8px] py-[12px] bg-white'>
                  {/* <span className='w-[25%] py-2 text-[#00143c]'><img src={currentStaff?.avatar} alt='thumb' className='w-12 h-12 object-cover'></img></span> */}
                  <span className='w-[30%] py-2 text-[#00143c] text-sm line-clamp-1 text-center font-semibold'>{  currentStaff?.email}</span>
                  <span className='w-[30%] py-2 text-[#00143c] text-sm line-clamp-1 text-center font-semibold'>{`${currentStaff?.firstName} ${currentStaff?.lastName}`}</span>
                  <span className='w-[30%] px-2 py-2 text-[#00143c] text-sm line-clamp-1 text-center font-semibold'>{`${currentStaff?.mobile}`}</span>
                </div>
            </div>
        </div> }

          <div className="w-1/2 flex-col justify-center mx-auto">
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
          </div>
        </div>
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
        <h3 className="text-md font-semibold mb-4 text-[#00143c]">Apply
            <span className="border-2 border-blue-500 p-1 m-1 rounded-md">{sourceDay}</span>
          to Other Days</h3>
        <div className="space-y-2 border-2 p-2 rounded-md flex justify-center flex-wrap gap-6">
          {daysOfWeek.map((day) => (
            <label key={day} className={`flex items-center text-[#00143c] font-semibold ${day === sourceDay ? 'opacity-50' : ''}`}>
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
          <button onClick={onClose} className="text-[#00143c] hover:text-gray-700">Cancel</button>
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

export default ManageStaffShift;





// const ManageStaffShift = ({setManageStaffShift, staffId}) => {
//   // const dispatch = useDispatch()
//   const [currentStaff, setCurrentStaff] = useState(null);
//   const [currentStaffShifts, setCurrentStaffShifts] = useState(null);
//   const [newShiftFormIndex, setNewShiftFormIndex] = useState(-1);
//   const [newShiftStart, setNewShiftStart] = useState("00:00"); // format of html time input
//   const [newShiftEnd, setNewShiftEnd] = useState("00:00"); // format of html time input

//   useEffect(() => {
//     if (!staffId?.length) {
//       Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
//       return;
//     }
//     const fetchStaffData = async () => {
//       let response = await apiGetOneStaff(staffId);

//       if (response?.success && response?.staff) {
//         console.log(response)
//         setCurrentStaff(response.staff);
//         setCurrentStaffShifts(response.staff?.shifts);
//         // console.log(Object.values(response.staff?.shifts));
//       }
//       else {
//         Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
//       }
//     }

//     fetchStaffData();
//   }, [staffId]);

//   const handleDeleteShift = async (dow, index) => {
//     let swalResult = Swal.fire({
//       title: "Confirm Shift Deletion",
//       text: 'Delete This Staff Shift May Affect Customer Order That Is Waiting!',
//       icon: 'warning',
//       showConfirmButton: true,
//       showCancelButton: true,
//       confirmButtonText: 'Delete',
//       cancelButtonText: 'Not now',                
//     });

//     if (swalResult.isConfirmed) {
//       const newShft = {...currentStaffShifts};
//       newShft[dow].splice(index, 1);

//       let response = await apiUpdateStaffShift({staffId, newShifts:newShft});

//       if (response.success && response.staff) {
//         setCurrentStaffShifts(newShft);
//         Swal.fire('Success', 'Modified Staff Shift Successfully!', 'success');
//         return;
//       }
//       Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
//     }
//   }
//   const handleAddShift = async (dow, shiftStart, shiftEnd) => {
//     const newShft = {...currentStaffShifts};

//     if (!newShft[dow]?.length) {
//       newShft[dow] = [];
//     }
//     newShft[dow].push({start:shiftStart, end:shiftEnd});

//     if (!staffId?.length) {
//       Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
//       return;
//     }

//     let response = await apiUpdateStaffShift({staffId,newShifts:newShft});

//     if (response.success && response.staff) {
//       setCurrentStaffShifts(newShft);
//       Swal.fire('Success', 'Modified Staff Shift Successfully!', 'success');
//       setNewShiftStart("00:00");
//       setNewShiftEnd("00:00");
//       return;
//     }
//     Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
//   }
//   // { "monday": [{"start":"10:32","end":"11:33"},{"start":"06:00","end":"20:20"}], sunday:  {"start":"06:32","end":"08:33"} }
//   return (
//     <div className='w-full'>
//         <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
//           <span>Manage Staff Shifts</span>
//           <span className='text-[#0a66c2] text-lg hover:underline cursor-pointer' onClick={()=>setManageStaffShift(false)}>Cancel</span>
//         </h1>

//       {currentStaff && <table className='table-auto p-0 w-full px-4'>
//         <thead className='font-bold bg-blue-500 text-[13px] text-white'>
//           <tr className='border border-gray-500'>
//             <th className='text-center py-2'>Avatar</th>            
//             <th className='text-center py-2'>Email Address</th>
//             <th className='text-center py-2'>First Name</th>
//             <th className='text-center py-2'>Last Name</th>
//             <th className='text-center py-2'>Phone</th>
//           </tr>
//         </thead>

//         <tbody>
//             <tr key={currentStaff._id} className='border border-gray-500'>
//               <td className='text-center py-2 flex justify-center'><img src={currentStaff.avatar} alt='thumb' className='w-12 h-12 object-cover'></img></td>
//               <td className='text-center py-2'>{currentStaff.email}</td>
//               <td className='text-center py-2'>{currentStaff.firstName}</td>
//               <td className='text-center py-2'>{currentStaff.lastName}</td>
//               <td className='text-center py-2'>{currentStaff.mobile}</td>
//             </tr>
//         </tbody>
//       </table>}

//       <h4 className='text-center font-bold pt-4'>Shift Schedules</h4>

//           <div className='p-4 flex flex-col justify-center items-center gap-5'>
//           { ["monday", "tuesday", "wednesday", "thursday", "friday", "sunday"]
//             .map((dow, index) => {
//               return <div className='w-fit p-2 m-6 border-2 rounded-md'>
//                 <span className='flex justify-center items-center'>
//                   <h3 className='pb-1 font-semibold text-center mr-5'>{ dow.charAt(0).toUpperCase() + dow.slice(1) }</h3>
//                   { (newShiftFormIndex !== index) && <Button
//                     handleOnclick={() => {setNewShiftFormIndex(index)}}
//                   ><FaCalendarPlus /></Button> }
//                 </span>
//                 {/* <h2>{JSON.stringify(Object.values(currentStaffShifts["monday"]))}</h2> */}
//                 <div className='flex gap-5 flex-wrap'>
//                   {currentStaffShifts && currentStaffShifts[dow] &&
//                     Object.values(currentStaffShifts[dow]).map((timeslot,index) => {
//                       return (
//                         <span key={index} className='bg-slate-500 px-2 pt-1 pb-0 rounded-md m-2'>
//                           <span className='flex gap-1 justify-center mb-3'>
//                             <p className='border-2 p-1 rounded-md'>{ timeslot.start || "no data" }</p>
//                             <p className='pt-2'>to</p>
//                             <p className='border-2 p-1 rounded-md'>{ timeslot.end || "no data" }</p>
//                             <Button
//                               handleOnclick={() => {handleDeleteShift(dow, index)}}
//                             ><FaRegWindowClose/></Button>
//                           </span>
//                         </span>
//                       );
//                     }) }
//                 </div>
//                 {
//                   (newShiftFormIndex === index) && 
//                   <div className='flex gap-3 items-center justify-center mt-4'>
//                     <input
//                       name="startShift"
//                       type="time" 
//                       id="startShift"
//                       // {...register(id, validate)}
//                       value={newShiftStart}
//                       placeholder={"..."}
//                       className="form-input text-gray-600 my-auto"
//                       onChange={(event) => {setNewShiftStart(event.target.value)}}
//                     />
//                     <input
//                       name="endShift"
//                       type="time"
//                       id="endShift"
//                       // {...register(id, validate)}
//                       placeholder={"..."}
//                       value={newShiftEnd}
//                       className="form-input text-gray-600 my-auto"
//                       onChange={(event) => {setNewShiftEnd(event.target.value)}}
//                     />
//                     <Button
//                       handleOnclick={(event) => {handleAddShift(dow, newShiftStart, newShiftEnd);}}
//                     >Add Shift</Button>
//                     <Button
//                       handleOnclick={() => {setNewShiftFormIndex(prevIndex => prevIndex === index ? -1 : index)}}
//                     >Close</Button>
//                   </div>
//                 }
//               </div>
//           })}

//         </div>
//     </div>
//   )
// }
// export default memo(ManageStaffShift)