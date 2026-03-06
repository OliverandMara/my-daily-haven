import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import BriScore from "@/components/BriScore";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, UtensilsCrossed, Flag, Sparkles, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const mealSlots = ["breakfast", "lunch", "dinner", "snack"] as const;
const mealIcons: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍪" };

export default function TodayPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["today"], queryFn: api.getToday, retry: 1 });
  const waterMut = useMutation({ mutationFn: () => api.logWater({}), onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }) });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <div className="py-20 text-center text-destructive">Failed to load. Check your API token.</div>;

  const today = data || {};

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-extrabold">Good morning ☀️</h1>

      {/* BRI Score */}
      <DashCard className="flex items-center justify-center">
        <BriScore score={today.bri?.score ?? 0} />
      </DashCard>

      {/* Meals */}
      <DashCard title="Meals">
        <div className="grid grid-cols-4 gap-2">
          {mealSlots.map((slot) => {
            const meal = today.meals?.find((m: any) => m.type === slot);
            return (
              <MealSlot key={slot} slot={slot} meal={meal} />
            );
          })}
        </div>
      </DashCard>

      {/* Water */}
      <DashCard title="Water" action={
        <Button size="sm" variant="ghost" onClick={() => waterMut.mutate()} disabled={waterMut.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      }>
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{today.water?.count ?? 0}</span>
          <span className="text-sm text-muted-foreground">glasses</span>
        </div>
      </DashCard>

      {/* Habits */}
      {today.habits && today.habits.length > 0 && (
        <DashCard title="Habits">
          <div className="space-y-2">
            {today.habits.map((h: any, i: number) => (
              <HabitItem key={i} habit={h} />
            ))}
          </div>
        </DashCard>
      )}

      {/* Calendar */}
      {today.events && today.events.length > 0 && (
        <DashCard title="Events">
          <div className="space-y-2">
            {today.events.map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-semibold">{e.title}</div>
                  {e.time && <div className="text-xs text-muted-foreground">{e.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {/* Flags */}
      {today.flags && today.flags.length > 0 && (
        <DashCard title="Flags">
          <div className="space-y-2">
            {today.flags.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2">
                <Flag className="h-4 w-4 text-accent" />
                <div className="text-sm">{f.message || f.content}</div>
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {/* Quick Wins */}
      <QuickWinCard />
    </div>
  );
}

function MealSlot({ slot, meal }: { slot: string; meal?: any }) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.logMeal(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today"] }); setOpen(false); setDesc(""); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={cn(
          "flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors",
          meal ? "border-success/40 bg-success/10" : "border-border bg-muted/50 hover:bg-muted"
        )}>
          <span className="text-xl">{mealIcons[slot]}</span>
          <span className="text-[10px] font-semibold capitalize">{slot}</span>
          {meal && <CheckCircle2 className="h-3 w-3 text-success" />}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="capitalize">Log {slot}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ type: slot, description: desc }); }} className="space-y-3">
          <Input placeholder="What did you have?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button type="submit" className="w-full" disabled={mut.isPending}>Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HabitItem({ habit }: { habit: any }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => api.checkHabit({ habitId: habit.id, person: habit.person }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }),
  });

  return (
    <button
      onClick={() => !habit.done && mut.mutate()}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        habit.done ? "bg-success/10" : "bg-muted hover:bg-muted/80"
      )}
    >
      <CheckCircle2 className={cn("h-5 w-5", habit.done ? "text-success" : "text-muted-foreground")} />
      <span className="text-sm font-medium">{habit.name}</span>
    </button>
  );
}

function QuickWinCard() {
  const [win, setWin] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.logWin(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today"] }); setWin(""); },
  });

  return (
    <DashCard title="Quick Win">
      <form onSubmit={(e) => { e.preventDefault(); if (win.trim()) mut.mutate({ content: win }); }} className="flex gap-2">
        <Input placeholder="Something great that happened..." value={win} onChange={(e) => setWin(e.target.value)} className="flex-1" />
        <Button size="icon" type="submit" disabled={!win.trim() || mut.isPending}>
          <Sparkles className="h-4 w-4" />
        </Button>
      </form>
    </DashCard>
  );
}
