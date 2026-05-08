import { formatTenge } from "@/lib/money";

export function Price({ value, className = "" }: { value: number; className?: string }) {
  return <span className={className}>{formatTenge(value)}</span>;
}
