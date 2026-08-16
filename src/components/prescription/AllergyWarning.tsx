interface AllergyWarningProps {
  message?: string | null;
}

export default function AllergyWarning({ message }: AllergyWarningProps) {
  if (!message) return null;

  return (
    <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[16px] p-[16px_20px] mb-[20px] flex items-start gap-[14px]">
      <i className="ti ti-alert-triangle text-[#d97706] text-[22px] shrink-0 mt-[2px]" />
      <div>
        <div className="text-[14px] font-bold text-[#92400e] mb-[2px]">
          Allergy Warning
        </div>
        <div className="text-[13px] text-[#92400e] leading-[1.55]">
          {message}
        </div>
      </div>
    </div>
  );
}
