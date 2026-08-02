const stepLabels = ["Upload & configure", "Process", "Review & compare"];

interface StepIndicatorProps {
  activeStep: 1 | 2 | 3;
}

export function StepIndicator({ activeStep }: StepIndicatorProps) {
  return (
    <div className="rounded-2xl border border-[#222334] bg-[#10111a] p-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const active = activeStep === stepNumber;
          const done = activeStep > stepNumber;

          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 border ${
                active
                  ? "border-[#2d2d44] bg-[#171722]"
                  : done
                    ? "border-[#1f2d28] bg-[#101a14]"
                    : "border-transparent bg-transparent"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-[#3b82f6] text-white"
                    : done
                      ? "bg-[#10b981] text-white"
                      : "bg-[#1a1a28] text-[#9ca3af]"
                }`}
              >
                {stepNumber}
              </div>
              <div className="text-sm font-medium text-white">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
