type Props = { currentStep: number };

export default function StepSelector({ currentStep }: Props) {
  const steps = ["Room & Dates", "Guest Info", "Review"];
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        return (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNum}
            </div>
            <span
              className={`ml-2 font-medium transition ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
