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
        className={`${fullWidth ? 'w-full' : 'w-fit'} ${
          style === 'flex-auto' ? 'flex-auto' : ''
        } ${errors[id] ? 'border-red-500' : ''}`}
        {...props}
      />
      {errors[id] && (
        <small className="text-xs text-red-500">{errors[id]?.message}</small>
      )}
    </div>
  );
};

export default InputForm;