interface ErrorCardProps {
  message?: string;
}

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[16px] p-[16px_20px] mb-[20px] flex items-start gap-[12px]">
      <i className="ti ti-circle-x text-[#dc2626] text-[22px] shrink-0 mt-[2px]" />
      <div>
        <div className="text-[15px] font-bold text-[#dc2626] mb-[2px]">
          Could not read prescription
        </div>
        <div className="text-[13px] text-[#dc2626] leading-[1.5]">
          {message || "Try a clearer photo with good lighting."}
        </div>
      </div>
    </div>
  );
}
