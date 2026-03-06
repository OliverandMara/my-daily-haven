import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, Plus, Loader2, Settings, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const people = ["Mara", "Oliver", "Elias"];

export default function HabitsPage() {
  const [tab, setTab] = useState("Mara");
  const { data, isLoading } = useQuery({
    queryKey: ["habits", tab],
    queryFn: () => api.getHabits(`person=${tab}`),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const habits = data?.habits || data || [];
  const trend = data?.trend || [];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Habits</h1>
        <AddHabitDialog person={tab} />
      </div>

      {/* Person tabs */}
      <div className="flex gap-2">
        {people.map((p) => (
          <button
            key={p}
            onClick={() => setTab(p)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === p ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            )}
          >{p}</button>
        ))}
      </div>

      {/* Today's checklist */}
      <DashCard title="Today">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habits configured for {tab}</p>
        ) : (
          <div className="space-y-2">
            {habits.map((h: any, i: number) => (
              <HabitCheckItem key={i} habit={h} person={tab} />
            ))}
          </div>
        )}
      </DashCard>

      {/* 7-day trend */}
      {trend.length > 0 && (
        <DashCard title="7-Day Trend">
          <div className="overflow-x-auto">
            <div className="flex gap-1">
              {trend.map((day: any, di: number) => (
                <div key={di} className="flex flex-col gap-1 items-center">
                  <span className="text-[9px] text-muted-foreground">{day.label}</span>
                  {(day.habits || []).map((h: any, hi: number) => (
                    <div
                      key={hi}
                      className={cn(
                        "h-4 w-4 rounded-sm",
                        h.done ? "bg-success" : "bg-muted"
                      )}
                      title={h.name}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DashCard>
      )}
    </div>
  );
}

function HabitCheckItem({ habit, person }: { habit: any; person: string }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => api.checkHabit({ habitId: habit.id, person }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  return (
    <button
      onClick={() => !habit.done && mut.mutate()}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        habit.done ? "bg-success/10" : "bg-muted hover:bg-muted/80"
      )}
    >
      <CheckCircle2 className={cn("h-5 w-5 shrink-0", habit.done ? "text-success" : "text-muted-foreground")} />
      <span className="text-sm font-medium">{habit.name}</span>
    </button>
  );
}

function AddHabitDialog({ person }: { person: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.configHabits(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["habits"] }); setOpen(false); setName(""); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Habit for {person}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ action: "add", person, name }); }} className="space-y-3">
          <Input placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={!name || mut.isPending}>Add Habit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
