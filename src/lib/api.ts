const API_BASE = "https://household.tamygraenz.workers.dev/api";

const TOKEN_KEY = "household-api-token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function hasToken(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-token": getToken(),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Today
  getToday: () => request<any>("/today"),
  getBriefing: () => request<any>("/briefing"),
  getWeek: () => request<any>("/week"),

  // Calendar
  getCalendar: (params?: string) => request<any>(`/calendar${params ? `?${params}` : ""}`),
  createEvent: (data: any) => request<any>("/calendar", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => request<any>(`/calendar/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEvent: (id: string) => request<any>(`/calendar/${id}`, { method: "DELETE" }),

  // Habits
  getHabits: (params?: string) => request<any>(`/habits${params ? `?${params}` : ""}`),
  checkHabit: (data: any) => request<any>("/habits", { method: "POST", body: JSON.stringify(data) }),
  configHabits: (data: any) => request<any>("/habits/config", { method: "PUT", body: JSON.stringify(data) }),

  // Meals
  getMeals: (params?: string) => request<any>(`/meals${params ? `?${params}` : ""}`),
  logMeal: (data: any) => request<any>("/meals", { method: "POST", body: JSON.stringify(data) }),
  deleteMeal: (id: string) => request<any>(`/meals/${id}`, { method: "DELETE" }),

  // Water
  getWater: (params?: string) => request<any>(`/water${params ? `?${params}` : ""}`),
  logWater: (data?: any) => request<any>("/water", { method: "POST", body: JSON.stringify(data || {}) }),

  // Sleep
  getSleep: (params?: string) => request<any>(`/sleep${params ? `?${params}` : ""}`),
  logSleep: (data: any) => request<any>("/sleep", { method: "POST", body: JSON.stringify(data) }),

  // Meds
  getMeds: (params?: string) => request<any>(`/meds${params ? `?${params}` : ""}`),
  logMed: (data: any) => request<any>("/meds", { method: "POST", body: JSON.stringify(data) }),

  // Symptoms
  getSymptoms: (params?: string) => request<any>(`/symptoms${params ? `?${params}` : ""}`),
  logSymptom: (data: any) => request<any>("/symptoms", { method: "POST", body: JSON.stringify(data) }),

  // Context
  getContext: (params?: string) => request<any>(`/context${params ? `?${params}` : ""}`),
  logContext: (data: any) => request<any>("/context", { method: "POST", body: JSON.stringify(data) }),

  // Rooms
  getRooms: (params?: string) => request<any>(`/rooms${params ? `?${params}` : ""}`),
  cleanRoom: (data: any) => request<any>("/rooms", { method: "POST", body: JSON.stringify(data) }),

  // Laundry
  getLaundry: (params?: string) => request<any>(`/laundry${params ? `?${params}` : ""}`),
  logLaundry: (data: any) => request<any>("/laundry", { method: "POST", body: JSON.stringify(data) }),

  // Projects
  getProjects: () => request<any>("/projects"),
  createProject: (data: any) => request<any>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<any>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/projects/${id}`, { method: "DELETE" }),

  // Lists
  getLists: () => request<any>("/lists"),
  createList: (data: any) => request<any>("/lists", { method: "POST", body: JSON.stringify(data) }),
  updateList: (id: string, data: any) => request<any>(`/lists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteList: (id: string) => request<any>(`/lists/${id}`, { method: "DELETE" }),

  // Flags
  getFlags: () => request<any>("/flags"),
  createFlag: (data: any) => request<any>("/flags", { method: "POST", body: JSON.stringify(data) }),

  // Wins
  getWins: () => request<any>("/wins"),
  logWin: (data: any) => request<any>("/wins", { method: "POST", body: JSON.stringify(data) }),

  // BRI
  getBri: () => request<any>("/bri"),

  // Sensory
  logSensory: (data: any) => request<any>("/sensory", { method: "POST", body: JSON.stringify(data) }),

  // Cycle
  getCycle: () => request<any>("/cycle"),
  logCycle: (data: any) => request<any>("/cycle", { method: "POST", body: JSON.stringify(data) }),
};
