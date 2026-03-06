import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Circle, ArrowLeft, Loader2, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ListsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["lists"], queryFn: api.getLists });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const lists = data?.lists || data || [];

  if (selectedId) {
    const list = lists.find((l: any) => l.id === selectedId);
    if (!list) return null;
    return <ListDetail list={list} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Lists</h1>
        <CreateListDialog />
      </div>
      <div className="space-y-3">
        {lists.map((l: any) => (
          <button key={l.id} onClick={() => setSelectedId(l.id)} className="w-full text-left">
            <DashCard>
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-bold text-sm">{l.title || l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.items?.length || 0} items</div>
                </div>
              </div>
            </DashCard>
          </button>
        ))}
        {lists.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No lists yet</p>}
      </div>
    </div>
  );
}

function ListDetail({ list, onBack }: { list: any; onBack: () => void }) {
  const [item, setItem] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.updateList(list.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });

  const items = list.items || [];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-extrabold">{list.title || list.name}</h1>
      </div>
      <DashCard>
        <div className="space-y-2">
          {items.map((it: any, i: number) => (
            <button
              key={i}
              onClick={() => mut.mutate({ action: "toggleItem", itemIndex: i })}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                it.done ? "bg-success/10" : "bg-muted hover:bg-muted/80"
              )}
            >
              {it.done ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
              <span className={cn("text-sm font-medium", it.done && "line-through text-muted-foreground")}>{it.text || it.name || it.title}</span>
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (item.trim()) { mut.mutate({ action: "addItem", text: item.trim() }); setItem(""); } }} className="mt-3 flex gap-2">
          <Input placeholder="Add item..." value={item} onChange={(e) => setItem(e.target.value)} className="flex-1" />
          <Button size="icon" type="submit" disabled={!item.trim()}><Plus className="h-4 w-4" /></Button>
        </form>
      </DashCard>
    </div>
  );
}

function CreateListDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: any) => api.createList(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lists"] }); setOpen(false); setTitle(""); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> New</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New List</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ title }); }} className="space-y-3">
          <Input placeholder="List name" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={!title || mut.isPending}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
