import React, { useState } from 'react';
import { FaClock, FaTrashAlt } from 'react-icons/fa';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeOptions = ["9:00 am", "10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm"];

const OfficeHours = ({ day, periods, isEnabled, onPeriodChange, onToggleChange, onApplyToOtherDays }) => {
  return (
    <div className={`p-4 rounded-md shadow-md w-full max-w-xl mt-4 ${isEnabled ? 'bg-white' : 'bg-gray-100'}`}>
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
            onChange={() => onToggleChange(day)}
            className="hidden"
          />
          <span
            className={`relative inline-block w-10 h-6 transition bg-gray-300 rounded-full ${
              isEnabled ? 'bg-blue-500' : ''
            }`}
          >
            <span
              className={`absolute left-0 inline-block w-4 h-4 transition transform bg-white rounded-full ${
                isEnabled ? 'translate-x-full' : ''
              }`}
            ></span>
          </span>
        </label>
      </div>

      {/* Time Inputs, disabled if isEnabled is false */}
      {periods.map((period, index) => (
        <div className="flex gap-4 mt-4" key={index}>
          <div className="flex flex-col w-1/2">
            <label className="text-sm font-medium text-gray-600">Start</label>
            <div className="flex items-center px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md">
              <FaClock className="mr-2 text-gray-500" />
              <select
                value={period.start}
                onChange={(e) => onPeriodChange(day, index, 'start', e.target.value)}
                className="flex-1 bg-transparent outline-none"
                disabled={!isEnabled}  // Disables if isEnabled is false
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="text-sm font-medium text-gray-600">Finish</label>
            <div className="flex items-center px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md">
              <FaClock className="mr-2 text-gray-500" />
              <select
                value={period.finish}
                onChange={(e) => onPeriodChange(day, index, 'finish', e.target.value)}
                className="flex-1 bg-transparent outline-none"
                disabled={!isEnabled}  // Disables if isEnabled is false
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 mt-6 text-gray-500 transition bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => onPeriodChange(day, index, 'delete')}
            disabled={!isEnabled}  // Disables delete if isEnabled is false
          >
            <FaTrashAlt />
          </button>
        </div>
      ))}

      {/* Add Period Button */}
      <div className="flex items-center mt-4">
        <button
          onClick={() => onPeriodChange(day, periods.length, 'add')}
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition bg-blue-50 rounded hover:bg-blue-100"
          disabled={!isEnabled}  // Disables add button if isEnabled is false
        >
          + Add Period
        </button>
      </div>

      {/* Apply to Other Days Link */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => onApplyToOtherDays(day)}
          className="text-sm font-medium text-blue-600 hover:underline"
          disabled={!isEnabled}  // Disables apply if isEnabled is false
        >
          Apply to Other Days
        </button>
      </div>
    </div>
  );
};

const WeeklyOfficeHours = () => {
  const [officeHours, setOfficeHours] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { isEnabled: true, periods: [{ start: '9:00 am', finish: '5:00 pm' }] };
      return acc;
    }, {})
  );
  const [showModal, setShowModal] = useState(false);
  const [sourceDay, setSourceDay] = useState(null);

  const handlePeriodChange = (day, index, field, value) => {
    setOfficeHours((prev) => {
      const updatedDay = { ...prev[day] };
      if (field === 'add') {
        updatedDay.periods.push({ start: '9:00 am', finish: '5:00 pm' });
      } else if (field === 'delete') {
        updatedDay.periods.splice(index, 1);
      } else {
        updatedDay.periods[index][field] = value;
      }
      return { ...prev, [day]: updatedDay };
    });
  };

  const handleToggleChange = (day) => {
    setOfficeHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], isEnabled: !prev[day].isEnabled },
    }));
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

  return (
    <div className="space-y-4">
      {daysOfWeek.map((day) => (
        <OfficeHours
          key={day}
          day={day}
          periods={officeHours[day].periods}
          isEnabled={officeHours[day].isEnabled}
          onPeriodChange={handlePeriodChange}
          onToggleChange={handleToggleChange}
          onApplyToOtherDays={handleApplyToOtherDays}
        />
      ))}
      {showModal && <ApplyToDaysModal sourceDay={sourceDay} onApply={handleModalApply} onClose={() => setShowModal(false)} />}
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
        <h3 className="text-lg font-semibold mb-4">Apply {sourceDay} Settings to Other Days</h3>
        <div className="space-y-2">
          {daysOfWeek.map((day) => (
            <label key={day} className={`flex items-center ${day === sourceDay ? 'opacity-50' : ''}`}>
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
        <div className="mt-4 flex justify-end space-x-2">
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
