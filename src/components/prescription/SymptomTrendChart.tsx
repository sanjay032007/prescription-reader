"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", fever: 101.5, pain: 8, adherence: 100, dose: "Dolo 650 (1-1-1)" },
  { day: "Tue", fever: 100.2, pain: 7, adherence: 100, dose: "Dolo + Augmentin" },
  { day: "Wed", fever: 99.1, pain: 5, adherence: 100, dose: "Augmentin + Pan 40" },
  { day: "Thu", fever: 98.6, pain: 3, adherence: 100, dose: "Augmentin + Pan 40" },
  { day: "Fri", fever: 98.4, pain: 2, adherence: 100, dose: "Augmentin (Final Day)" },
  { day: "Sat", fever: 98.4, pain: 1, adherence: 100, dose: "Recovery Stage" },
  { day: "Sun", fever: 98.4, pain: 0, adherence: 100, dose: "Vitals Normal" },
];

export default function SymptomTrendChart() {
  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10.5px] font-bold text-[#094cb2] uppercase tracking-widest block">
            Clinical Telemetry
          </span>
          <h4 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1b1c1d]">
            7-Day Symptom &amp; Recovery Curve
          </h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-[#094cb2]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#094cb2]" />
            Temperature (°F)
          </span>
          <span className="flex items-center gap-1.5 text-[#2D6A4F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            Pain Index (0-10)
          </span>
        </div>
      </div>

      <div className="h-[220px] sm:h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="feverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#094cb2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#094cb2" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[97, 103]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#1b1c1d] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1">
                      <p className="font-bold text-sky-400">{label} &bull; {item.dose}</p>
                      <p className="text-white/90">Body Temp: <span className="font-bold text-white">{item.fever}°F</span></p>
                      <p className="text-white/90">Pain Severity: <span className="font-bold text-emerald-400">{item.pain}/10</span></p>
                      <p className="text-white/60 text-[10.5px]">Medication Adherence: {item.adherence}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="fever"
              stroke="#094cb2"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#feverGrad)"
            />
            <Area
              type="monotone"
              dataKey="pain"
              stroke="#2D6A4F"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#painGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11.5px] text-slate-500 font-medium text-center mt-2">
        🟢 Telemetry indicates 94% therapeutic resolution over standard 5-day antibiotic regimen.
      </p>
    </div>
  );
}
