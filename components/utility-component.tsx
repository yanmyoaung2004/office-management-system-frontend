import { LucideIcon } from "lucide-react";

export const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) => (
  <div className="group flex flex-col gap-1.5 transition-all">
    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
    <span className="text-sm font-medium leading-none pl-5.5">
      {value || "—"}
    </span>
  </div>
);
