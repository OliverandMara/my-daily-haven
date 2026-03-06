import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Loader2, FolderKanban, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  done: "bg-muted text-muted-foreground border-border",
};

const people = ["Mara", "Oliver", "Elias"];

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: api.getProjects });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const projects = data?.projects || data || [];

  if (selectedId) {
    const project = projects.find((p: any) => p.id === selectedId);
    if (!project) return null;
    return <ProjectDetail project={project} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Projects</h1>
        <CreateProjectDialog />
      </div>
      <div className="space-y-3">
        {projects.map((p: any) => (
          <button key={p.id} onClick={() => setSelectedId(p.id)} className="w-full text-left">
            <DashCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{p.title || p.name}</div>
                  {p.owner && <div className="text-xs text-muted-foreground">{p.owner}</div>}
                </div>
                <Badge variant="outline" className={cn("text-[10px]", statusColors[p.status] || "")}>{p.status}</Badge>
              </div>
            </DashCard>
          </button>
        ))}
        {projects.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No projects yet</p>}
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: any; onBack: () => void }) {
  const [task, setTask] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.updateProject(project.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setTask(""); },
  });

  const tasks = project.tasks || [];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-extrabold">{project.title || project.name}</h1>
      </div>
      <DashCard title="Tasks">
        <div className="space-y-2">
          {tasks.map((t: any, i: number) => (
            <button
              key={i}
              onClick={() => mut.mutate({ action: "toggleTask", taskIndex: i })}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                t.done ? "bg-success/10" : "bg-muted hover:bg-muted/80"
              )}
            >
              <CheckCircle2 className={cn("h-5 w-5 shrink-0", t.done ? "text-success" : "text-muted-foreground")} />
              <span className="text-sm font-medium">{t.title || t.name}</span>
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (task.trim()) mut.mutate({ action: "addTask", task: task.trim() }); }} className="mt-3 flex gap-2">
          <Input placeholder="New task..." value={task} onChange={(e) => setTask(e.target.value)} className="flex-1" />
          <Button size="icon" type="submit" disabled={!task.trim()}><Plus className="h-4 w-4" /></Button>
        </form>
      </DashCard>
    </div>
  );
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("Mara");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.createProject(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); setTitle(""); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> New</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ title, owner, status: "active" }); }} className="space-y-3">
          <Input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{people.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="submit" className="w-full" disabled={!title || mut.isPending}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
