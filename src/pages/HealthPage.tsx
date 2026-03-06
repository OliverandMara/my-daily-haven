import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, Heart, Brain, Zap, Pill, AlertCircle } from "lucide-react";
import BriScore from "@/components/BriScore";

const cyclePhases = ["menstrual", "follicular", "ovulatory", "luteal"];
const phaseEmoji: Record<string, string> = { menstrual: "🌑", follicular: "🌒", ovulatory: "🌕", luteal: "🌖" };

export default function HealthPage() {
  const { data: bri, isLoading } = useQuery({ queryKey: ["bri"], queryFn: api.getBri });
  const { data: cycle } = useQuery({ queryKey: ["cycle"], queryFn: api.getCycle });
  const { data: meds } = useQuery({ queryKey: ["meds"], queryFn: () => api.getMeds() });
  const { data: symptoms } = useQuery({ queryKey: ["symptoms"], queryFn: () => api.getSymptoms() });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const briHistory = bri?.history || [];
  const currentBri = bri?.score ?? bri?.current ?? 0;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-extrabold">Health</h1>

      {/* BRI */}
      <DashCard title="BRI" className="flex flex-col items-center">
        <BriScore score={currentBri} />
        {briHistory.length > 0 && (
          <div className="mt-4 flex items-end gap-1 h-16 w-full">
            {briHistory.slice(-7).map((v: any, i: number) => {
              const score = typeof v === "number" ? v : v.score ?? 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={cn("w-full rounded-t-sm", score >= 75 ? "bri-bg-green" : score >= 50 ? "bri-bg-yellow" : score >= 25 ? "bri-bg-orange" : "bri-bg-red")}
                    style={{ height: `${Math.max(4, score * 0.6)}px` }}
                  />
                  <span className="text-[8px] text-muted-foreground">{typeof v === "object" && v.label ? v.label : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </DashCard>

      {/* Cycle */}
      <CycleCard currentPhase={cycle?.phase} />

      {/* Sensory */}
      <SensoryCard />

      {/* Recent symptoms */}
      {symptoms && (symptoms.symptoms || symptoms || []).length > 0 && (
        <DashCard title="Recent Symptoms">
          <div className="space-y-2">
            {(symptoms.symptoms || symptoms || []).slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.symptom || s.name}</div>
                  {s.severity && <div className="text-[10px] text-muted-foreground">Severity: {s.severity}/5</div>}
                </div>
                {s.date && <span className="text-[10px] text-muted-foreground">{s.date}</span>}
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {/* Recent meds */}
      {meds && (meds.medications || meds || []).length > 0 && (
        <DashCard title="Recent Medications">
          <div className="space-y-2">
            {(meds.medications || meds || []).slice(0, 5).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Pill className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  {m.dosage && <div className="text-[10px] text-muted-foreground">{m.dosage}</div>}
                </div>
                {m.time && <span className="text-[10px] text-muted-foreground">{m.time}</span>}
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </div>
  );
}

function CycleCard({ currentPhase }: { currentPhase?: string }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (phase: string) => api.logCycle({ phase }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycle"] }),
  });

  return (
    <DashCard title="Cycle Phase">
      <div className="grid grid-cols-4 gap-2">
        {cyclePhases.map((phase) => (
          <button
            key={phase}
            onClick={() => mut.mutate(phase)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[10px] font-semibold capitalize transition-colors",
              currentPhase === phase ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
            )}
          >
            <span className="text-lg">{phaseEmoji[phase]}</span>
            {phase}
          </button>
        ))}
      </div>
    </DashCard>
  );
}

function SensoryCard() {
  const [tolerance, setTolerance] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [irritability, setIrritability] = useState(5);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (data: any) => api.logSensory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bri"] }),
  });

  return (
    <DashCard title="Sensory Log">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium flex items-center gap-1"><Zap className="h-3 w-3" /> Sensory Tolerance</label>
            <span className="text-xs font-bold">{tolerance}</span>
          </div>
          <Slider value={[tolerance]} onValueChange={([v]) => setTolerance(v)} max={10} step={1} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium flex items-center gap-1"><Brain className="h-3 w-3" /> Cognitive Clarity</label>
            <span className="text-xs font-bold">{clarity}</span>
          </div>
          <Slider value={[clarity]} onValueChange={([v]) => setClarity(v)} max={10} step={1} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium flex items-center gap-1"><Heart className="h-3 w-3" /> Irritability</label>
            <span className="text-xs font-bold">{irritability}</span>
          </div>
          <Slider value={[irritability]} onValueChange={([v]) => setIrritability(v)} max={10} step={1} />
        </div>
        <Button size="sm" onClick={() => mut.mutate({ sensoryTolerance: tolerance, cognitiveClarity: clarity, irritability })} disabled={mut.isPending}>
          Save
        </Button>
      </div>
    </DashCard>
  );
}
