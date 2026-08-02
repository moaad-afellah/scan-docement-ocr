import { Typography } from "@mui/material";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="text-white text-lg font-semibold">Verascan</span>
        </div>

        <div className="bg-[#12121a] border border-[#232330] rounded-2xl p-8">
          <Typography variant="h5" sx={{ color: "#f5f5f7", fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </div>
      </div>
    </div>
  );
}
