import React from 'react';
import { Card } from '@tremor/react';

const FormStep = ({ title, description, children, isActive }) => {
  return (
    <div className={`${isActive ? 'block' : 'hidden'}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default FormStep;
