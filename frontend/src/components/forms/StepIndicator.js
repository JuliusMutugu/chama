import React from 'react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${
                  index < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : index === currentStep
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-300 text-gray-300'
                }`}
            >
              {index + 1}
            </div>
            <div className="text-xs mt-2 absolute -bottom-6 w-20 text-center" style={{ marginLeft: '-20px' }}>
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 ${
                index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
