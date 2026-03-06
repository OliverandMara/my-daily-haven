import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashCard from "@/components/DashCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Trophy, Plus, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const people = ["Mara", "Oliver", "Elias"];

export default function WinsPage() {
  const [content, setContent] = useState("");
  const [who, setWho] = useState("Mara");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["wins"], queryFn: api.getWins });

  const mut = useMutation({
    mutationFn: (data: any) => api.logWin(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wins"] }); setContent(""); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const wins = data?.wins || data || [];

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-extrabold">Wins 🏆</h1>

      <DashCard>
        <form onSubmit={(e) => { e.preventDefault(); if (content.trim()) mut.mutate({ content, who }); }} className="space-y-3">
          <Input placeholder="What's the win?" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex gap-2">
            <Select value={who} onValueChange={setWho}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{people.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" className="flex-1" disabled={!content.trim() || mut.isPending}>
              <Sparkles className="mr-1 h-4 w-4" /> Log Win
            </Button>
          </div>
        </form>
      </DashCard>

      <div className="space-y-3">
        {wins.map((w: any, i: number) => (
          <DashCard key={i}>
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{w.content}</p>
                <div className="mt-1 flex items-center gap-2">
                  {w.who && <span className="text-[10px] font-semibold text-primary">{w.who}</span>}
                  {w.date && <span className="text-[10px] text-muted-foreground">{w.date}</span>}
                </div>
              </div>
            </div>
          </DashCard>
        ))}
        {wins.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No wins yet — go make some! ✨</p>}
      </div>
    </div>
  );
}
