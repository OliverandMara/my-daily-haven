import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";

const people = ["Mara", "Oliver", "Elias"];
const recurrenceOptions = ["none", "daily", "weekly", "monthly", "yearly"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const monthStr = format(currentMonth, "yyyy-MM");
  const { data } = useQuery({
    queryKey: ["calendar", monthStr],
    queryFn: () => api.getCalendar(`month=${monthStr}`),
  });

  const events = data?.events || data || [];
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const selectedEvents = selectedDate
    ? events.filter((e: any) => {
        const ed = new Date(e.date);
        return isSameDay(ed, selectedDate);
      })
    : [];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Calendar</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Event</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
            <EventForm onSuccess={() => { setShowCreate(false); qc.invalidateQueries({ queryKey: ["calendar"] }); }} />
          </DialogContent>
        </Dialog>
      </div>

      <DashCard>
        <div className="flex items-center justify-between mb-4">
          <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold">{format(currentMonth, "MMMM yyyy")}</span>
          <Button size="icon" variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const hasEvents = events.some((e: any) => isSameDay(new Date(e.date), day));
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex flex-col items-center rounded-lg py-1.5 text-sm transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                )}
              >
                {day.getDate()}
                {hasEvents && (
                  <span className={cn("absolute bottom-0.5 h-1 w-1 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary")} />
                )}
              </button>
            );
          })}
        </div>
      </DashCard>

      {selectedDate && (
        <DashCard title={format(selectedDate, "EEEE, MMM d")}>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e: any, i: number) => (
                <div key={i} className="rounded-lg bg-muted px-3 py-2">
                  <div className="font-semibold text-sm">{e.title}</div>
                  {e.time && <div className="text-xs text-muted-foreground">{e.time}{e.endTime ? ` - ${e.endTime}` : ""}</div>}
                  {e.who && <div className="text-xs text-primary">{Array.isArray(e.who) ? e.who.join(", ") : e.who}</div>}
                </div>
              ))}
            </div>
          )}
        </DashCard>
      )}
    </div>
  );
}

function EventForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [who, setWho] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  const mut = useMutation({
    mutationFn: (data: any) => api.createEvent(data),
    onSuccess,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ title, date, time, endTime, who, description, recurrence }); }} className="space-y-3">
      <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <div className="flex gap-2">
        <Input type="time" placeholder="Start" value={time} onChange={(e) => setTime(e.target.value)} />
        <Input type="time" placeholder="End" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Who</label>
        <div className="flex gap-2">
          {people.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setWho(who.includes(p) ? who.filter((w) => w !== p) : [...who, p])}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                who.includes(p) ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}
            >{p}</button>
          ))}
        </div>
      </div>
      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <Select value={recurrence} onValueChange={setRecurrence}>
        <SelectTrigger><SelectValue placeholder="Recurrence" /></SelectTrigger>
        <SelectContent>
          {recurrenceOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full" disabled={!title || mut.isPending}>Create Event</Button>
    </form>
  );
}
