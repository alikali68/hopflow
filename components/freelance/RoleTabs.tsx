import React from 'react';

export default function RoleTabs({
  role,
  onChange,
}: {
  role: 'client' | 'freelancer';
  onChange: (r: 'client' | 'freelancer') => void;
}) {
  const tab = (value: 'client' | 'freelancer', label: string) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`h-[36px] rounded-lg px-4 text-[13.5px] font-semibold transition-all ${
        role === value
          ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
          : 'text-[#9A9AB0] hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="glass-panel inline-flex gap-1 rounded-xl p-1">
      {tab('client', 'I am the Client')}
      {tab('freelancer', 'I am the Freelancer')}
    </div>
  );
}
