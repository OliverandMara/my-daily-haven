import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Moon, Shirt, Droplets, Pill, AlertCircle, Minus, Plus, Star, Home } from "lucide-react";

const rooms = ["living room", "kitchen", "dining room", "guest bath", "library", "bathroom", "bedroom"];

export default function DailyLogPage() {
  const qc = useQueryClient();
  const { data: ctx } = useQuery({ queryKey: ["context"], queryFn: () => api.getContext() });
  const { data: roomData } = useQuery({ queryKey: ["rooms"], queryFn: () => api.getRooms() });

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-extrabold">Daily Log 📝</h1>
      <SleepSection />
      <ContextSection ctx={ctx} />
      <RoomsSection rooms={roomData} />
      <MedicationSection />
      <SymptomSection />
    </div>
  );
}

function SleepSection() {
  const qc = useQueryClient();
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState(3);
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: (data: any) => api.logSleep(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today"] }); },
  });

  return (
    <DashCard title="Sleep">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Moon className="h-5 w-5 text-primary" />
          <Input type="number" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} className="w-20" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setQuality(s)}>
                <Star className={cn("h-5 w-5", s <= quality ? "fill-accent text-accent" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input type="time" placeholder="Bedtime" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
          <Input type="time" placeholder="Wake" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
        </div>
        <Textarea placeholder="Sleep notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <Button size="sm" onClick={() => mut.mutate({ hours: Number(hours), quality, bedtime, wakeTime, notes })} disabled={mut.isPending}>
          Save Sleep
        </Button>
      </div>
    </DashCard>
  );
}

function ContextSection({ ctx }: { ctx?: any }) {
  const qc = useQueryClient();
  const [shower, setShower] = useState(ctx?.shower ?? false);
  const [wearing, setWearing] = useState(ctx?.wearing ?? "");
  const [perfume, setPerfume] = useState(ctx?.perfume ?? "");
  const [breaks, setBreaks] = useState(ctx?.breaks ?? 0);
  const [laundry, setLaundry] = useState(ctx?.laundry ?? false);

  const contextMut = useMutation({
    mutationFn: (data: any) => api.logContext(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["context"] }),
  });
  const laundryMut = useMutation({
    mutationFn: (data: any) => api.logLaundry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["context"] }),
  });

  const save = () => {
    contextMut.mutate({ shower, wearing, perfume, breaks });
    laundryMut.mutate({ done: laundry });
  };

  return (
    <DashCard title="Daily Context">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /> Shower</Label>
          <Switch checked={shower} onCheckedChange={setShower} />
        </div>
        <div>
          <Label className="flex items-center gap-2 mb-1"><Shirt className="h-4 w-4 text-primary" /> Wearing</Label>
          <Input placeholder="What are you wearing?" value={wearing} onChange={(e) => setWearing(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1">Perfume</Label>
          <Input placeholder="Perfume" value={perfume} onChange={(e) => setPerfume(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Breaks taken</Label>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => setBreaks(Math.max(0, breaks - 1))}><Minus className="h-4 w-4" /></Button>
            <span className="w-8 text-center font-bold">{breaks}</span>
            <Button size="icon" variant="outline" onClick={() => setBreaks(breaks + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Laundry</Label>
          <Switch checked={laundry} onCheckedChange={setLaundry} />
        </div>
        <Button size="sm" onClick={save} disabled={contextMut.isPending}>Save Context</Button>
      </div>
    </DashCard>
  );
}

function RoomsSection({ rooms: roomData }: { rooms?: any }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (room: string) => api.cleanRoom({ room }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });

  const cleaned = roomData?.cleaned || [];

  return (
    <DashCard title="Rooms">
      <div className="grid grid-cols-2 gap-2">
        {rooms.map((room) => {
          const done = cleaned.includes(room);
          return (
            <button
              key={room}
              onClick={() => !done && mut.mutate(room)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors",
                done ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted/50 hover:bg-muted"
              )}
            >
              <Home className="h-4 w-4" />
              {room}
            </button>
          );
        })}
      </div>
    </DashCard>
  );
}

function MedicationSection() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const mut = useMutation({
    mutationFn: (data: any) => api.logMed(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today"] }); setName(""); setDosage(""); setTime(""); },
  });

  return (
    <DashCard title="Medication">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Input placeholder="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-24" />
        </div>
        <div className="flex gap-2">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={() => mut.mutate({ name, dosage, time })} disabled={!name || mut.isPending}>
            <Pill className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </DashCard>
  );
}

function SymptomSection() {
  const qc = useQueryClient();
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: (data: any) => api.logSymptom(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today"] }); setSymptom(""); setSeverity(3); setNotes(""); },
  });

  return (
    <DashCard title="Symptoms">
      <div className="space-y-2">
        <Input placeholder="Symptom" value={symptom} onChange={(e) => setSymptom(e.target.value)} />
        <div className="flex items-center gap-2">
          <Label className="text-xs">Severity</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={cn(
                  "h-8 w-8 rounded-full text-xs font-bold transition-colors",
                  s <= severity ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >{s}</button>
            ))}
          </div>
        </div>
        <Textarea placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <Button size="sm" onClick={() => mut.mutate({ symptom, severity, notes })} disabled={!symptom || mut.isPending}>
          <AlertCircle className="mr-1 h-4 w-4" /> Log Symptom
        </Button>
      </div>
    </DashCard>
  );
}
