// frontend/src/components/OnboardingStepper.jsx
export default function OnboardingStepper({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              i < currentStep
                ? 'bg-green-500 text-white'
                : i === currentStep
                ? 'bg-purple-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-16 h-1 ${
                i < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}