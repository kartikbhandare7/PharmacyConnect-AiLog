import { User, Mail, Phone, Building2, Stethoscope } from "lucide-react";

export default function HCPCard({ hcp, onLogInteraction }) {
  const initials = hcp.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="glass-card rounded-2xl p-5 border border-navy-700 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full neural-gradient flex items-center justify-center text-white font-bold text-lg">
          {initials}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{hcp.name}</h3>

          <div className="flex items-center gap-2 text-sm text-indigo-300 mt-1">
            <Stethoscope size={14} />
            {hcp.specialty}
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Active
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3">

        <div className="flex items-center gap-3 text-slate-300">
          <Building2 size={16} className="text-indigo-400" />
          <span className="text-sm">{hcp.hospital}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <Mail size={16} className="text-indigo-400" />
          <span className="text-sm break-all">
            {hcp.email || "Not Available"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <Phone size={16} className="text-indigo-400" />
          <span className="text-sm">
            {hcp.phone || "Not Available"}
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 flex gap-3">

        <button
          className="flex-1 py-2 rounded-lg border border-indigo-500 text-indigo-300 hover:bg-indigo-500/10 transition"
        >
          View
        </button>

        <button
          onClick={() => onLogInteraction(hcp)}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white"
        >
          Log Visit
        </button>

      </div>
    </div>
  );
}