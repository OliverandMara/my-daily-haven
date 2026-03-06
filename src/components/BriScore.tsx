import { cn } from "@/lib/utils";

function getBriColor(score: number) {
  if (score >= 75) return "bri-bg-green";
  if (score >= 50) return "bri-bg-yellow";
  if (score >= 25) return "bri-bg-orange";
  return "bri-bg-red";
}

function getBriTextColor(score: number) {
  if (score >= 75) return "bri-green";
  if (score >= 50) return "bri-yellow";
  if (score >= 25) return "bri-orange";
  return "bri-red";
}

export default function BriScore({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "h-28 w-28" : "h-16 w-16";
  const textSize = size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          dim,
          "flex items-center justify-center rounded-full border-4",
          getBriColor(score),
          "border-current bg-opacity-15"
        )}
        style={{
          backgroundColor: "transparent",
          borderColor: "currentColor",
        }}
      >
        <span className={cn(textSize, "font-extrabold", getBriTextColor(score))}>{score}</span>
      </div>
      {size === "lg" && <span className="text-xs font-semibold text-muted-foreground">BRI Score</span>}
    </div>
  );
}
