import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import TokenGate from "@/components/TokenGate";
import TodayPage from "./pages/TodayPage";
import DailyLogPage from "./pages/DailyLogPage";
import CalendarPage from "./pages/CalendarPage";
import HabitsPage from "./pages/HabitsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ListsPage from "./pages/ListsPage";
import HealthPage from "./pages/HealthPage";
import WinsPage from "./pages/WinsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TokenGate>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<TodayPage />} />
              <Route path="/log" element={<DailyLogPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/wins" element={<WinsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TokenGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
