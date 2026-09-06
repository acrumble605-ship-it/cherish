export type Mood = 'spicy' | 'comfort' | 'light' | 'surprise' | 'something_new';

export type RejectionReason = 
  | 'too_heavy' 
  | 'had_recently' 
  | 'too_far' 
  | 'want_punchier' 
  | 'not_feeling_it';

export interface FoodOption {
  id: string;
  stallName: string;
  hawkerCentre: string;
  location: string;
  neighborhood: string;
  cuisine: string;
  dishHighlights: string[];
  priceRange: string;
  healthScore: string;
  walkTimeMinutes: number;
  tags: string[];
  imageUrl?: string;
  googleMapsUrl?: string;
}

export interface PersonalizedNote {
  whyFits: string;
  whatToOrder: string;
  budgetMatch: string;
  priorityAlignment?: {
    priority: string;
    details: string;
  };
  calorieEstimate?: string;
  macroBreakdown?: {
    protein: string;
    carbs: string;
    fats: string;
  };
  counterModification?: string;
}

export interface KaleRecommendation {
  option: FoodOption;
  pro: string;
  con: string;
  opinion: string;
  personalNote: PersonalizedNote;
  rejectionCount: number;
  sourceType: 'mood' | 'fast_lane' | 'banked' | 'mystery';
  sourceQuery?: string;
  decisionPriority?: string;
  travelEstimate?: {
    distanceMeters: number;
    distanceDisplay: string;
    durationMinutes: number;
    durationDisplay: string;
    transportMode: 'walking' | 'driving';
    routeTip: string;
    googleMapsUrl: string;
  };
}

export interface SquadMember {
  id: string;
  name: string;
  avatarColor: string;
  avatarInitials: string;
  hasRespondedLive: boolean;
  usualPreference: string;
  dietRestriction: string;
  budget: string;
  currentMood?: Mood;
  isCurrentUser?: boolean;
  hasPostRejected?: boolean;
}

export interface BoardTile {
  id: string;
  memberId: string;
  memberName: string;
  mood: Mood;
  tileTheme: {
    bg: string;
    border: string;
    text: string;
    shimmer: string;
  };
  moodLabel: string;
  timestamp: string;
  isProxy: boolean;
}

export interface Squad {
  id: string;
  name: string;
  tagline: string;
  activeWindow: {
    title: string;
    countdownMinutes: number;
    isOpen: boolean;
  };
  members: SquadMember[];
  boardTiles: BoardTile[];
  settledPick?: FoodOption;
  settledVerdict?: {
    pro: string;
    con: string;
    opinion: string;
  };
  memberPrivateNotes?: Record<string, PersonalizedNote>;
}

export interface CookItem {
  id: string;
  name: string;
  category: 'produce' | 'protein' | 'dairy_pantry' | 'staple';
  daysLeft: number;
  isTagged: boolean;
}

export interface CookRecipe {
  id: string;
  title: string;
  cookTime: string;
  expiringItemsUsed: string[];
  estimatedSavings: number;
  description: string;
  steps: string[];
  nutritionHighlight: string;
}

export interface BankedCraving {
  id: string;
  dishOrCraving: string;
  origin: 'group_compromise' | 'solo_saved';
  originDetails: string;
  savedDate: string;
  fallbackStallName?: string;
  fallbackDish?: string;
}

export interface UserProfile {
  name: string;
  diet: string;
  budgetTier: string;
  priorities: string[];
  totalSavedDollars: number;
  mealsDecidedCount: number;
  homeCookedCount: number;
}
