import React from 'react';

export type Step = {
  label: string;
  status: 'done' | 'active' | 'pending';
};

export default function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-4 items-start">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span
            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all duration-200
              ${step.status === 'done' ? 'bg-green-500 text-white' : step.status === 'active' ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-300 text-gray-500'}`}
          >
            {idx + 1}
          </span>
          <span className="text-lg font-semibold text-gray-700">{step.label}</span>
          <span className="ml-2">
            {step.status === 'done' ? (
              <span className="text-green-500 font-bold">✓</span>
            ) : step.status === 'active' ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block align-middle"></span>
            ) : (
              <span className="text-gray-400 font-bold">...</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
