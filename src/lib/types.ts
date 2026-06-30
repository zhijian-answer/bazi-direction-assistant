export type Gender = "male" | "female" | "other";
export type CalendarType = "solar" | "lunar";

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export type ElementBalance = Record<ElementKey, number>;

export type ChartPosition = "year" | "month" | "day" | "time";

export type EarthlyRelation = {
  type: "六合" | "三合" | "半合" | "冲" | "刑" | "害" | "破";
  branches: string;
  positions: ChartPosition[];
  note: string;
};

export type LuckCycle = {
  ganZhi: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
};

export type AnnualLuck = {
  year: number;
  age: number;
  ganZhi: string;
};

export type BaziChart = {
  solarText: string;
  lunarText: string;
  pillars: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  stems: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  branches: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  wuxing: {
    year: string;
    month: string;
    day: string;
    time: string;
    balance: ElementBalance;
    strongest: ElementKey[];
    weakest: ElementKey[];
  };
  tenGods: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  hiddenStems?: Record<ChartPosition, string[]>;
  hiddenTenGods?: Record<ChartPosition, string[]>;
  relations?: EarthlyRelation[];
  luckCycles?: LuckCycle[];
  annualLuck?: AnnualLuck[];
  engine?: {
    primary: "lunar-javascript";
    validator?: "bazi-calculator-by-alvamind";
    validationStatus?: "matched" | "different" | "unavailable";
    matchedPillars?: number;
    weightedBalance?: ElementBalance;
  };
  nayin: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  dayMaster: {
    stem: string;
    element: ElementKey;
    elementLabel: string;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  dailyQuestionLimit: number;
};

export type PublicUser = Omit<User, "passwordHash" | "salt">;

export type Session = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type BirthProfile = {
  id: string;
  userId: string;
  name: string;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth?: boolean;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone?: string;
  timeUnknown: boolean;
  createdAt: string;
  chart: BaziChart;
};

export type QuestionCategory =
  | "direction"
  | "career"
  | "relationship"
  | "study"
  | "wealth"
  | "timing"
  | "emotion"
  | "custom";

export type GuidanceQuestion = {
  id: string;
  userId: string;
  profileId: string;
  category: QuestionCategory;
  question: string;
  answer: string;
  createdAt: string;
  usage: {
    source: "openai" | "local" | "fallback";
    model?: string;
    estimatedTokens: number;
    error?: string;
  };
};

export type ActionCheckin = {
  id: string;
  userId: string;
  profileId: string;
  date: string;
  action: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type ActionCheckinStats = {
  total: number;
  currentStreak: number;
  checkedToday: boolean;
  lastCheckinDate: string | null;
  last7Days: Array<{
    date: string;
    checked: boolean;
  }>;
};

export type DailyGuidance = {
  profileId: string;
  date: string;
  focusElement: ElementKey;
  focusElementLabel: string;
  theme: string;
  summary: string;
  suitable: string[];
  avoid: string[];
  actionSteps: string[];
};

export type ReportSection = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
};

export type BirthReport = {
  profileId: string;
  generatedAt: string;
  title: string;
  summary: string;
  highlights: string[];
  wuxing: {
    strongest: ElementKey[];
    weakest: ElementKey[];
    balanceText: string;
    suggestions: string[];
  };
  sections: ReportSection[];
  actionPlan: string[];
  disclaimers: string[];
};

export type ForecastMonth = {
  month: number;
  focusElement: ElementKey;
  focusElementLabel: string;
  theme: string;
  summary: string;
  suitable: string[];
  avoid: string[];
  action: string;
};

export type YearForecast = {
  profileId: string;
  year: number;
  generatedAt: string;
  title: string;
  overview: string;
  yearlyKeywords: string[];
  currentMonth: ForecastMonth;
  months: ForecastMonth[];
  disclaimers: string[];
};

export type ActionCard = {
  profileId: string;
  date: string;
  title: string;
  focusElement: ElementKey;
  focusElementLabel: string;
  supportNote: string;
  groundingSteps: string[];
  tinyActions: string[];
  avoid: string[];
  reflectionPrompts: string[];
  disclaimer: string;
};

export type AppDb = {
  users: User[];
  sessions: Session[];
  profiles: BirthProfile[];
  questions: GuidanceQuestion[];
  checkins: ActionCheckin[];
};
