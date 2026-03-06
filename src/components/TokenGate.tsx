import { useState } from "react";
import { hasToken, setToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export default function TokenGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasToken());
  const [value, setValue] = useState("");

  if (authenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome Home</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your API token to continue</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) {
              setToken(value.trim());
              setAuthenticated(true);
            }
          }}
          className="space-y-3"
        >
          <Input
            type="password"
            placeholder="API token"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-center"
          />
          <Button type="submit" className="w-full" disabled={!value.trim()}>
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
