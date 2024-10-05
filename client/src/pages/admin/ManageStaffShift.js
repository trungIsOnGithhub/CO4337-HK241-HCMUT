import { Button, InputForm, Loading, MarkdownEditor, Select } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
// import { useForm } from 'react-hook-form'
// import { useDispatch, useSelector } from 'react-redux'
// import { toast } from 'react-toastify'
// import { validate, getBase64 } from 'ultils/helper'
import {apiGetOneStaff, apiModifyStaff} from 'apis/staff'
import { showModal } from 'store/app/appSlice'
import Swal from 'sweetalert2'
import { FaRegWindowClose } from "react-icons/fa";

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

  const handleDeleteShift = (dow, index) => {
    Swal.fire({
      title: "Confirm Shift Deletion",
      text: 'Delete This Staff Shift May Affect Customer Order That Is Waiting!',
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Not now',                
    }).then(result =>{
      if (result.isConfirmed) {
        let response = await apiDeleteStaffShift({staffId,dow})
        const newShft = {...currentStaffShifts};

        newShft[dow].splice(index, 1);
    
        setCurrentStaffShifts(newShft);
      }
    })
  }
  const handleAddShift = (dow, shiftStart, shiftEnd) => {
    const newShft = {...currentStaffShifts};

    newShft[dow].push({start:shiftStart, end:shiftEnd});

    setCurrentStaffShifts(newShft);
  }
  // { "monday": [{"start":"10:32","end":"11:33"},{"start":"06:00","end":"20:20"}], sunday:  {"start":"06:32","end":"08:33"} }
  return (
    <div className='w-full'>
        <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Manage Staff Shifts</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>setManageStaffShift(false)}>Cancel</span>
        </h1>
          <div className='p-4 flex gap-5 flex-wrap'>
          { ["monday", "tuesday", "wednesday", "thursday", "friday", "sunday"]
            .map((dow, index) => {
              return <div className='w-fit p-2 m-6 border-2 rounded-md'>
                <h3 className='pb-1 font-semibold text-center'>{ dow.charAt(0).toUpperCase() + dow.slice(1) }</h3>
                {/* <h2>{JSON.stringify(Object.values(currentStaffShifts["monday"]))}</h2> */}
                <div>
                  {currentStaffShifts && currentStaffShifts[dow] &&
                    Object.values(currentStaffShifts[dow]).map((timeslot,index) => {
                      return (
                        <span key={index}>
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
                  <div className='flex flex-col gap-3 items-center justify-center'>
                    <label htmlFor="startShift">Start:</label>
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
                    <label htmlFor="endShift">End</label>
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
                { (newShiftFormIndex !== index) && <Button
                  handleOnclick={() => {setNewShiftFormIndex(index)}}
                >Add Timeslot</Button> }
              </div>
          })}

        </div>
    </div>
  )
}
export default memo(ManageStaffShift)