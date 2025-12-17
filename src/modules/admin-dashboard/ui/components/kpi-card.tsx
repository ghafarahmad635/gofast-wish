'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  BadgeCheck,
  Ban,
  Activity,
  Puzzle,
  CreditCard,
  Hourglass,
  DollarSign,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface Kpi {
  label: string;
  value: string;
  href: string;
  subLabel?: string;
  icon: LucideIcon;
  gradient: string; // tailwind gradient classes
}

export const KpiCard = ({ kpi }: { kpi: Kpi }) => {
  return (
    <Link href={kpi.href} className="block">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        className={[
          "group relative overflow-hidden rounded-2xl p-6 shadow-sm transition",
          "border border-black/10 bg-gradient-to-br",
          kpi.gradient,
        ].join(" ")}
      >
        {/* soft animated glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -left-1/2 -top-1/2 h-[220%] w-[220%] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35)_0%,transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.18)_0%,transparent_60%)]" />
        </div>

        {/* icon bubble */}
        <div className="absolute right-5 top-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm ring-1 ring-white/30">
            <kpi.icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* content */}
        <div className="relative z-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/90">
            {kpi.label}
          </div>

          <div className="mt-3 text-4xl font-bold leading-none text-white drop-shadow-sm">
            {kpi.value}
          </div>

          {kpi.subLabel ? (
            <div className="mt-2 text-sm font-medium text-white/85">
              {kpi.subLabel}
            </div>
          ) : (
            <div className="mt-2 text-sm font-medium text-white/70">
              Quick view
            </div>
          )}
        </div>

        {/* bottom accent line */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full bg-white/25" />
      </motion.div>
    </Link>
  );
};

/**
 * Optional helper so your KPI mapping stays clean.
 * Import and use these in your KPI list.
 */
export const kpiPresets = {
  totalUsers: { icon: Users, gradient: "from-sky-500 to-indigo-600" },
  newUsers: { icon: UserPlus, gradient: "from-emerald-500 to-teal-600" },
  verified: { icon: BadgeCheck, gradient: "from-violet-500 to-fuchsia-600" },
  banned: { icon: Ban, gradient: "from-rose-500 to-red-600" },
  sessions: { icon: Activity, gradient: "from-amber-500 to-orange-600" },
  addons: { icon: Puzzle, gradient: "from-cyan-500 to-blue-600" },
  subsActive: { icon: CreditCard, gradient: "from-slate-600 to-zinc-800" },
  subsTrial: { icon: Hourglass, gradient: "from-purple-500 to-indigo-600" },
  revenue: { icon: DollarSign, gradient: "from-lime-500 to-emerald-700" },
  failedOrders: { icon: AlertTriangle, gradient: "from-yellow-500 to-rose-600" },
};
