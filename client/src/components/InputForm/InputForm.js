import React from 'react';

const InputForm = ({
  label,
  disabled,
  register,
  errors,
  id,
  validate,
  type = 'text',
  placeholder,
  defaultValue,
  style,
  fullWidth,
  styleInput,
  ...props
}) => {
  return (
    <div className={style ? style : ''}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        id={id}
        {...register(id, validate)}
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`${styleInput ? styleInput : ''} ${errors[id] ? 'border-red-500' : ''}`}
        {...props}
      />
      {errors[id] && (
        <small className="text-xs text-red-500">{errors[id]?.message}</small>
      )}
    </div>
  );
};

export default InputForm;