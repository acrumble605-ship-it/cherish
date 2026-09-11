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
  venueType?: 'hawker' | 'restaurant' | 'cafe';
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

export interface DualChoiceComparison {
  choiceA: string;
  choiceB: string;
  winner: 'A' | 'B';
  verdictTitle: string;
  verdictReasoning: string;
  slumpRiskA: {
    level: 'low' | 'moderate' | 'high';
    percentage: number;
    description: string;
  };
  slumpRiskB: {
    level: 'low' | 'moderate' | 'high';
    percentage: number;
    description: string;
  };
  psychologyInsight: string;
  isCoinFlip?: boolean;
}

export interface EnergyNudge {
  slumpRiskLevel: 'low' | 'moderate' | 'high';
  forecastLabel: string;
  forecastDetail: string;
  counterHack: string;
  drinkPairingHack: string;
  psychologyAngle: string;
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
  curiosityTeaser?: string;
  mischiefNote?: string;
  weatherAdvice?: string;
  travelEstimate?: {
    distanceMeters: number;
    distanceDisplay: string;
    durationMinutes: number;
    durationDisplay: string;
    transportMode: 'walking' | 'driving' | 'public_transport';
    routeTip: string;
    googleMapsUrl: string;
  };
  dualChoiceComparison?: DualChoiceComparison;
  energyNudge?: EnergyNudge;
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
  lastLat?: number;
  lastLng?: number;
  transportPreference: 'walking' | 'driving' | 'public_transport';
  venuePreference: 'cafe' | 'hawker' | 'restaurant';
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  dishName: string;
  placeName: string;
  locationArea: string;
  venueType: 'cafe' | 'hawker' | 'restaurant';
  verdict: 'recommend' | 'avoid';
  verdictTag: string;
  rating: number;
  price: string;
  walkMinutes?: number;
  honestReview: string;
  proHighlight: string;
  conHighlight: string;
  photoUrl?: string;
  timestamp: string;
  agreeCount: number;
  userAgreed?: boolean;
}

export interface QuickDecision {
  question: string;
  options: string[];
  pick: string;
  oneLiner: string;
}

export interface JournalEntry {
  id: string;
  dishName: string;
  stallName: string;
  hawkerCentre?: string;
  timestamp: string;
  dateIso: string;
  photoUrl: string;
  stickers: string[];
  rating: number;
  price?: string;
  calories?: string;
  note?: string;
  spiceLevel?: 'Mild 🌶️' | 'Medium 🌶️🌶️' | 'Extra Shiok 🌶️🌶️🌶️' | 'Non-Spicy 🥗';
  frameStyle?: 'polaroid' | 'gold' | 'neon' | 'clean';
  source?: 'solo' | 'squad' | 'cook';
}

export interface DailyChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  verdict?: string;
}

export interface DailyDecisionItem {
  id: string;
  title: string;
  verdict: string;
  date: string;
  category: 'purchase' | 'lifestyle' | 'duel' | 'general';
}

