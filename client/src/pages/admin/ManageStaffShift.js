import { Button, InputForm, Loading, MarkdownEditor, Select } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
// import { useForm } from 'react-hook-form'
// import { useDispatch, useSelector } from 'react-redux'
// import { toast } from 'react-toastify'
// import { validate, getBase64 } from 'ultils/helper'
import {apiGetOneStaff, apiModifyStaff, apiUpdateStaffShift} from 'apis/staff'
import { showModal } from 'store/app/appSlice'
import Swal from 'sweetalert2'
import { FaRegWindowClose, FaCalendarPlus } from "react-icons/fa";

const ManageStaffShift = ({setManageStaffShift, staffId}) => {
  // const dispatch = useDispatch()
  const [currentStaff, setCurrentStaff] = useState(null);
  const [currentStaffShifts, setCurrentStaffShifts] = useState(null);
  const [newShiftFormIndex, setNewShiftFormIndex] = useState(-1);
  const [newShiftStart, setNewShiftStart] = useState("00:00"); // format of html time input
  const [newShiftEnd, setNewShiftEnd] = useState("00:00"); // format of html time input

  useEffect(() => {
    if (!staffId?.length) {
      Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
      return;
    }
    const fetchStaffData = async () => {
      let response = await apiGetOneStaff(staffId);

      if (response?.success && response?.staff) {
        setCurrentStaff(response.staff);
        setCurrentStaffShifts(response.staff?.shifts);
        console.log(Object.values(response.staff?.shifts));
      }
      else {
        Swal.fire('Error Ocurred!!', 'Cannot Get Staff Shift Data!!', 'error')
      }
    }

    fetchStaffData();
  }, [staffId]);

  const handleDeleteShift = async (dow, index) => {
    let swalResult = Swal.fire({
      title: "Confirm Shift Deletion",
      text: 'Delete This Staff Shift May Affect Customer Order That Is Waiting!',
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Not now',                
    });

    if (swalResult.isConfirmed) {
      const newShft = {...currentStaffShifts};
      newShft[dow].splice(index, 1);

      let response = await apiUpdateStaffShift({staffId, newShifts:newShft});

      if (response.success && response.staff) {
        setCurrentStaffShifts(newShft);
        Swal.fire('Success', 'Modified Staff Shift Successfully!', 'success');
        return;
      }
      Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
    }
  }
  const handleAddShift = async (dow, shiftStart, shiftEnd) => {
    const newShft = {...currentStaffShifts};

    if (!newShft[dow]?.length) {
      newShft[dow] = [];
    }
    newShft[dow].push({start:shiftStart, end:shiftEnd});

    if (!staffId?.length) {
      Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
      return;
    }

    let response = await apiUpdateStaffShift({staffId,newShifts:newShft});

    if (response.success && response.staff) {
      setCurrentStaffShifts(newShft);
      Swal.fire('Success', 'Modified Staff Shift Successfully!', 'success');
      setNewShiftStart("00:00");
      setNewShiftEnd("00:00");
      return;
    }
    Swal.fire('Error Ocurred!!', 'Cannot Update Staff Shift!!', 'error');
  }
  // { "monday": [{"start":"10:32","end":"11:33"},{"start":"06:00","end":"20:20"}], sunday:  {"start":"06:32","end":"08:33"} }
  return (
    <div className='w-full'>
        <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Manage Staff Shifts</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>setManageStaffShift(false)}>Cancel</span>
        </h1>

      {currentStaff && <table className='table-auto p-0 w-full px-4'>
        <thead className='font-bold bg-blue-500 text-[13px] text-white'>
          <tr className='border border-gray-500'>
            <th className='text-center py-2'>Avatar</th>            
            <th className='text-center py-2'>Email Address</th>
            <th className='text-center py-2'>First Name</th>
            <th className='text-center py-2'>Last Name</th>
            <th className='text-center py-2'>Phone</th>
          </tr>
        </thead>

        <tbody>
            <tr key={currentStaff._id} className='border border-gray-500'>
              <td className='text-center py-2 flex justify-center'><img src={currentStaff.avatar} alt='thumb' className='w-12 h-12 object-cover'></img></td>
              <td className='text-center py-2'>{currentStaff.email}</td>
              <td className='text-center py-2'>{currentStaff.firstName}</td>
              <td className='text-center py-2'>{currentStaff.lastName}</td>
              <td className='text-center py-2'>{currentStaff.mobile}</td>
            </tr>
        </tbody>
      </table>}

      <h4 className='text-center font-bold pt-4'>Shift Schedules</h4>

          <div className='p-4 flex flex-col justify-center items-center gap-5'>
          { ["monday", "tuesday", "wednesday", "thursday", "friday", "sunday"]
            .map((dow, index) => {
              return <div className='w-fit p-2 m-6 border-2 rounded-md'>
                <span className='flex justify-center items-center'>
                  <h3 className='pb-1 font-semibold text-center mr-5'>{ dow.charAt(0).toUpperCase() + dow.slice(1) }</h3>
                  { (newShiftFormIndex !== index) && <Button
                    handleOnclick={() => {setNewShiftFormIndex(index)}}
                  ><FaCalendarPlus /></Button> }
                </span>
                {/* <h2>{JSON.stringify(Object.values(currentStaffShifts["monday"]))}</h2> */}
                <div className='flex gap-5 flex-wrap'>
                  {currentStaffShifts && currentStaffShifts[dow] &&
                    Object.values(currentStaffShifts[dow]).map((timeslot,index) => {
                      return (
                        <span key={index} className='bg-slate-500 px-2 pt-1 pb-0 rounded-md m-2'>
                          <span className='flex gap-1 justify-center mb-3'>
                            <p className='border-2 p-1 rounded-md'>{ timeslot.start || "no data" }</p>
                            <p className='pt-2'>to</p>
                            <p className='border-2 p-1 rounded-md'>{ timeslot.end || "no data" }</p>
                            <Button
                              handleOnclick={() => {handleDeleteShift(dow, index)}}
                            ><FaRegWindowClose/></Button>
                          </span>
                        </span>
                      );
                    }) }
                </div>
                {
                  (newShiftFormIndex === index) && 
                  <div className='flex gap-3 items-center justify-center mt-4'>
                    <input
                      name="startShift"
                      type="time" 
                      id="startShift"
                      // {...register(id, validate)}
                      value={newShiftStart}
                      placeholder={"..."}
                      className="form-input text-gray-600 my-auto"
                      onChange={(event) => {setNewShiftStart(event.target.value)}}
                    />
                    <input
                      name="endShift"
                      type="time"
                      id="endShift"
                      // {...register(id, validate)}
                      placeholder={"..."}
                      value={newShiftEnd}
                      className="form-input text-gray-600 my-auto"
                      onChange={(event) => {setNewShiftEnd(event.target.value)}}
                    />
                    <Button
                      handleOnclick={(event) => {handleAddShift(dow, newShiftStart, newShiftEnd);}}
                    >Add Shift</Button>
                    <Button
                      handleOnclick={() => {setNewShiftFormIndex(prevIndex => prevIndex === index ? -1 : index)}}
                    >Close</Button>
                  </div>
                }
              </div>
          })}

        </div>
    </div>
  )
}
export default memo(ManageStaffShift)