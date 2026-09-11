import { 
  FoodOption, 
  KaleRecommendation, 
  Mood, 
  RejectionReason, 
  PersonalizedNote,
  CookRecipe,
  Squad,
  SquadMember,
  DualChoiceComparison,
  EnergyNudge,
  QuickDecision
} from '../types';
import { SINGAPORE_HAWKER_DATABASE } from '../data/hawkerData';
import { 
  calculateTravelEstimate, 
  UserLocation, 
  TransportMode, 
  POPULAR_SINGAPORE_LOCATIONS 
} from '../data/locationService';

export interface RecommendParams {
  mood?: Mood;
  fastLaneQuery?: string;
  previousRejectedIds?: string[];
  lastRejectionReason?: RejectionReason;
  rejectionCount?: number;
  userDiet?: string;
  userBudget?: string;
  userPriorities?: string[];
  userLocation?: UserLocation;
  transportMode?: TransportMode;
  timeOfDay?: string;
  venueTypePreference?: 'cafe' | 'hawker' | 'restaurant';
  lat?: number;
  lng?: number;
  weatherSummary?: string;
}

export class KaleService {
  /**
   * Generates a single thoughtful recommendation based on mood, location, and user priorities
   * Ultra-fast execution with server Gemini AI or local curated fallback.
   */
  static async getRecommendation(params: RecommendParams): Promise<KaleRecommendation> {
    let weatherSummary: string | undefined = params.weatherSummary;
    if (!weatherSummary && params.lat != null && params.lng != null) {
      try {
        const w = await fetch(`/api/weather?lat=${params.lat}&lng=${params.lng}`);
        const wd = await w.json();
        weatherSummary = wd.summary;
      } catch { /* non-fatal */ }
    }

    try {
      const res = await fetch('/api/kale/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, weatherSummary }),
      });
      const data = await res.json();

      if (data && data.status !== 'fallback_to_local_curated' && data.recommendation) {
        return data.recommendation as KaleRecommendation;
      }
    } catch {
      // non-fatal fallback
    }

    return this.localFallback(params);
  }

  static async getQuickDecision(question: string): Promise<QuickDecision> {
    const res = await fetch('/api/decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return res.json();
  }

  static getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  private static async localFallback(params: RecommendParams): Promise<KaleRecommendation> {
    const rejectionCount = params.rejectionCount || 0;
    const previousRejected = new Set(params.previousRejectedIds || []);
    const diet = params.userDiet || 'Balanced, High-Protein';
    const budget = params.userBudget || '$';
    const priorities = params.userPriorities || ['Health & Longevity', 'Calorie Control (<500 kcal)'];
    const userLoc = params.userLocation || POPULAR_SINGAPORE_LOCATIONS[0];
    const transportMode = params.transportMode || 'walking';
    const venueTypePref = params.venueTypePreference || 'all';

    // Tactile micro-pause (~200ms) for silky UI transition without any perceived lag
    await new Promise(resolve => setTimeout(resolve, 200));

    // Intelligent local rule-based matching engine
    let candidateOptions = SINGAPORE_HAWKER_DATABASE.filter(opt => !previousRejected.has(opt.id));
    if (candidateOptions.length === 0) {
      candidateOptions = [...SINGAPORE_HAWKER_DATABASE];
    }

    // Filter by Venue Type Preference (Hawker vs Restaurant)
    if (venueTypePref === 'restaurant') {
      const restaurants = candidateOptions.filter(opt => opt.venueType === 'restaurant');
      if (restaurants.length > 0) candidateOptions = restaurants;
    } else if (venueTypePref === 'hawker') {
      const hawkers = candidateOptions.filter(opt => opt.venueType !== 'restaurant');
      if (hawkers.length > 0) candidateOptions = hawkers;
    }

    // Fast-lane specific search
    if (params.fastLaneQuery && params.fastLaneQuery.trim().length > 0) {
      const q = params.fastLaneQuery.toLowerCase().trim();
      const matched = candidateOptions.filter(opt => 
        opt.stallName.toLowerCase().includes(q) ||
        opt.cuisine.toLowerCase().includes(q) ||
        opt.dishHighlights.some(d => d.toLowerCase().includes(q)) ||
        opt.tags.some(t => t.toLowerCase().includes(q)) ||
        opt.hawkerCentre.toLowerCase().includes(q) ||
        opt.neighborhood.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        candidateOptions = matched;
      }
    } else if (params.mood) {
      // Mood-based weighting
      if (params.mood === 'surprise') {
        // Shuffle or pick unexpected high-rated spot
        candidateOptions = [...candidateOptions].sort(() => Math.random() - 0.5);
      } else {
        const moodCandidates = candidateOptions.filter(opt => opt.tags.includes(params.mood!));
        if (moodCandidates.length > 0) {
          candidateOptions = moodCandidates;
        }
      }
    }

    // Venue preference filtering: cafe vs hawker vs restaurant
    if (params.venueTypePreference === 'cafe') {
      const cafes = candidateOptions.filter(opt => opt.venueType === 'cafe');
      if (cafes.length > 0) candidateOptions = cafes;
    } else if (params.venueTypePreference === 'restaurant') {
      const restaurants = candidateOptions.filter(opt => opt.venueType === 'restaurant');
      if (restaurants.length > 0) candidateOptions = restaurants;
    } else if (params.venueTypePreference === 'hawker') {
      const hawkers = candidateOptions.filter(opt => opt.venueType === 'hawker' || !opt.venueType);
      if (hawkers.length > 0) candidateOptions = hawkers;
    }

    // Budget filtering (including new $$$$ $20 - $30+ tier)
    if (budget === '$$$$') {
      const premiumTiers = candidateOptions.filter(opt => 
        opt.priceRange.includes('$$$$') || 
        opt.priceRange.includes('$20') || 
        opt.priceRange.includes('$22') ||
        opt.priceRange.includes('$25')
      );
      if (premiumTiers.length > 0) candidateOptions = premiumTiers;
    }

    // STRICT WALKING DISTANCE REQUIREMENT:
    // Must be within 10 to 20 min walking distance, strictly nowhere further than 20 minutes!
    if (transportMode === 'walking') {
      // 1. Hard ceiling: eliminate any spot further than 20 mins walk
      const within20Mins = candidateOptions.filter(opt => {
        const est = calculateTravelEstimate(userLoc, opt, 'walking');
        return est.durationMinutes <= 20;
      });
      if (within20Mins.length > 0) {
        candidateOptions = within20Mins;
      }

      // 2. Sweet spot: prioritize spots strictly between 10 to 20 minutes walk
      const tenToTwentyMin = candidateOptions.filter(opt => {
        const est = calculateTravelEstimate(userLoc, opt, 'walking');
        return est.durationMinutes >= 10 && est.durationMinutes <= 20;
      });
      if (tenToTwentyMin.length > 0) {
        candidateOptions = tenToTwentyMin;
      }
    }

    // Filter and sort by rejection reason adjustment
    if (params.lastRejectionReason === 'too_heavy') {
      const lighterOptions = candidateOptions.filter(opt => 
        opt.tags.includes('light') || 
        opt.tags.includes('clean') || 
        opt.healthScore.includes('Clean') || 
        opt.healthScore.includes('Fiber') ||
        opt.id.includes('han-kee') ||
        opt.id.includes('popiah') ||
        opt.id.includes('thunder-tea')
      );
      if (lighterOptions.length > 0) candidateOptions = lighterOptions;
    } else if (params.lastRejectionReason === 'too_far') {
      // Sort strictly by travel time from user location
      candidateOptions = [...candidateOptions].sort((a, b) => {
        const estA = calculateTravelEstimate(userLoc, a, transportMode);
        const estB = calculateTravelEstimate(userLoc, b, transportMode);
        return estA.durationMinutes - estB.durationMinutes;
      });
    } else if (params.lastRejectionReason === 'want_punchier') {
      const punchyOptions = candidateOptions.filter(opt => 
        opt.tags.includes('spicy') || 
        opt.tags.includes('something_new') ||
        opt.cuisine.toLowerCase().includes('sambal') ||
        opt.cuisine.toLowerCase().includes('laksa') ||
        opt.cuisine.toLowerCase().includes('vinegar')
      );
      if (punchyOptions.length > 0) candidateOptions = punchyOptions;
    } else if (params.lastRejectionReason === 'had_recently') {
      // Pick an option with a distinctly different cuisine and neighborhood
      candidateOptions = [...candidateOptions].reverse();
    }

    // Dietary filtering if vegetarian or halal requested
    if (diet.toLowerCase().includes('vegetarian')) {
      const vegFriendly = candidateOptions.filter(opt => 
        opt.tags.includes('vegetarian') || 
        opt.id.includes('thunder-tea') || 
        opt.id.includes('popiah') || 
        opt.id.includes('yong-tow-foo')
      );
      if (vegFriendly.length > 0) candidateOptions = vegFriendly;
    } else if (diet.toLowerCase().includes('halal')) {
      const halalFriendly = candidateOptions.filter(opt => 
        opt.tags.includes('halal') || opt.id.includes('pariaman')
      );
      if (halalFriendly.length > 0) candidateOptions = halalFriendly;
    }

    // Weather sensitivity: if rain, bias towards comfort soups & broths
    const isRain = params.weatherSummary?.toLowerCase().includes('rain');
    if (isRain) {
      const soupComforts = candidateOptions.filter(opt => 
        opt.tags.includes('comfort') || opt.dishHighlights.some(d => d.toLowerCase().includes('soup') || d.toLowerCase().includes('broth'))
      );
      if (soupComforts.length > 0) {
        candidateOptions = soupComforts;
      }
    }

    const selectedOption = candidateOptions[0] || SINGAPORE_HAWKER_DATABASE[0];

    // Compute live travel estimate for the selected option from user location
    const travelEstimate = calculateTravelEstimate(userLoc, selectedOption, transportMode);

    // Build the locked 3-line Pro/Con/Opinion
    const proConOpinion = this.synthesizeProConOpinion(selectedOption, params.lastRejectionReason, rejectionCount);

    // Build deeply personalized private note strictly tailored to user's priorities, diet, and budget
    const personalNote = this.synthesizePersonalNote(selectedOption, diet, budget, priorities, params.mood);

    // Synthesize subtle behavioral psychology energy nudge
    const energyNudge = this.synthesizeEnergyNudge(selectedOption);

    // Generate mischievous curiosity teaser
    const curiosityTeasers = [
      "Kale whispers: You might have planned a plain salad, but your soul deserves this Michelin-worthy bowl.",
      "Warning: The hawker uncle never smiles, but this dish will cure your afternoon lethargy in three spoonfuls.",
      "Kale's cheeky take: Pure discipline with a rebellious touch of wok hei. Zero food coma guaranteed.",
      "Mischievous verdict: Skip the second-guessing—the aroma alone will validate this choice."
    ];
    const curiosityTeaser = curiosityTeasers[Math.floor(Math.random() * curiosityTeasers.length)];

    return {
      option: selectedOption,
      pro: proConOpinion.pro,
      con: proConOpinion.con,
      opinion: proConOpinion.opinion,
      personalNote,
      curiosityTeaser,
      mischiefNote: curiosityTeaser,
      weatherAdvice: isRain ? 'Rainy weather comfort pick: warm sheltered broth' : undefined,
      rejectionCount,
      sourceType: params.fastLaneQuery ? 'fast_lane' : (params.mood ? 'mood' : 'mystery'),
      sourceQuery: params.fastLaneQuery,
      decisionPriority: priorities.join(' > '),
      travelEstimate,
      energyNudge
    };
  }

  private static synthesizePersonalNote(
    option: FoodOption,
    diet: string,
    budget: string,
    priorities?: string[],
    mood?: Mood
  ): PersonalizedNote {
    const dietLower = diet.toLowerCase();
    const priList = priorities && priorities.length > 0 ? priorities : ['Health & Longevity', 'Calorie Control (<500 kcal)'];
    const priString = priList.join(' & ');

    let whyFits = `Directly aligned with your priority for ${priString}. Crafted to eliminate afternoon brain fog and maintain sustained cognitive alertness.`;
    let whatToOrder = `Order: ${option.dishHighlights[0]} (${option.priceRange.split('-')[0].trim()}).`;
    let calorieEstimate = '~380 - 430 kcal';
    let macroBreakdown = { protein: '36g', carbs: '28g', fats: '7g' };
    let counterModification = "Hold fried shallot oil and pork lard; request fresh chili padi in light soy on the side.";

    const optId = option.id.toLowerCase();
    const optName = (option.stallName + ' ' + option.dishHighlights[0]).toLowerCase();

    if (optName.includes('fish') || optName.includes('mackerel') || optId.includes('han-kee')) {
      calorieEstimate = '~340 - 380 kcal';
      macroBreakdown = { protein: '38g', carbs: '14g', fats: '4g' };
      counterModification = "Say: 'Sliced fish soup with extra bittergourd, hold the fried garlic oil and vermicelli' — shaves 140 calories and lowers glycemic impact.";
      whyFits = `Directly satisfies your ${priString} focus: Lean marine protein (38g) with zero saturated fat keeps insulin flat, avoiding the post-lunch slump.`;
    } else if (optName.includes('chicken') || optId.includes('tian-tian') || optId.includes('liao-fan')) {
      calorieEstimate = '~420 - 470 kcal';
      macroBreakdown = { protein: '35g', carbs: '38g', fats: '9g' };
      counterModification = "Say: 'Chicken breast meat only, double cucumber slices, light master stock drizzle' — reduces excess fat by 40%.";
      whyFits = `High-satiety poultry breast provides dense essential amino acids to fuel afternoon meetings while respecting your daily macro limits.`;
    } else if (optName.includes('lui cha') || optName.includes('thunder') || optId.includes('thunder-tea')) {
      calorieEstimate = '~350 - 390 kcal';
      macroBreakdown = { protein: '18g', carbs: '48g (High Fiber)', fats: '6g' };
      counterModification = "Say: 'Brown rice lui cha, extra bitter greens, hold the dried shrimp' — maximizes micronutrients with zero cholesterol.";
      whyFits = `Concentrated phytonutrients and green tea polyphenols that optimize digestion and gut motility while keeping calories controlled.`;
    } else if (optName.includes('porridge') || optName.includes('congee') || optId.includes('zhen-zhen')) {
      calorieEstimate = '~320 - 360 kcal';
      macroBreakdown = { protein: '24g', carbs: '44g', fats: '4g' };
      counterModification = "Say: 'Century egg chicken congee, extra young ginger, hold the fried dough fritters (youtiao) and sesame oil.'";
      whyFits = `Gentle, soothing nourishment that is easy on the gut microbiome while keeping calories well under your 500 kcal target.`;
    } else if (optName.includes('laksa') || optName.includes('noodle') || optId.includes('sungei-road')) {
      calorieEstimate = '~510 - 560 kcal';
      macroBreakdown = { protein: '28g', carbs: '56g', fats: '15g' };
      counterModification = "Say: 'Extra bean sprouts and cockles, light gravy' — maximizes fiber and protein density.";
      whyFits = `Satisfies your craving for authentic heritage flavor while balancing portions to prevent afternoon fatigue.`;
    }

    if (dietLower.includes('vegetarian') || dietLower.includes('vegan')) {
      whyFits = `Plant-forward nutrition that fully respects your vegetarian diet with zero compromises on traditional hawker depth.`;
      if (option.id.includes('thunder-tea')) {
        whatToOrder = `Order: Brown rice Lui Cha with extra bitter greens, tofu cubes, and hold the dried shrimp if strictly vegan.`;
      } else if (option.id.includes('popiah')) {
        whatToOrder = `Order: 2 hand-rolled Popiah rolls with extra stewed jicama and crushed peanuts, no pork lard.`;
      } else {
        whatToOrder = `Order: Braised beancurd skin and wok-tossed greens with steamed rice or clear broth.`;
      }
    } else if (dietLower.includes('low carb') || dietLower.includes('keto')) {
      whatToOrder = `Order: ${option.dishHighlights[0]} — hold the noodles/rice, ask for double sliced protein and extra cabbage/greens.`;
    } else if (dietLower.includes('halal')) {
      whatToOrder = `Order: ${option.dishHighlights[0]} with house sambal and spiced bergedil.`;
    } else if (dietLower.includes('pescatarian')) {
      whatToOrder = `Order: Sliced mackerel in bittergourd broth with brown rice on the side.`;
    }

    let budgetMatch = `Comfortably within your target ${budget} tier.`;
    if (budget === '$') {
      budgetMatch = `Gentle on your wallet (${option.priceRange}), safely under your $ budget tier.`;
    } else if (budget === '$$') {
      budgetMatch = `Optimal value sweet-spot (${option.priceRange}) for Michelin-pedigree hawker craft.`;
    } else if (budget === '$$$') {
      budgetMatch = `Easily accommodated within your generous lunch allowance.`;
    }

    return { 
      whyFits, 
      whatToOrder, 
      budgetMatch,
      priorityAlignment: {
        priority: priString,
        details: `Selected because it delivers high satiety with ${calorieEstimate} and ${macroBreakdown.protein} protein without heavy saturated fats.`
      },
      calorieEstimate,
      macroBreakdown,
      counterModification
    };
  }

  private static synthesizeProConOpinion(
    option: FoodOption, 
    reason?: RejectionReason, 
    rejectionCount: number = 0
  ): { pro: string; con: string; opinion: string } {
    let pro = `Pro: ${option.healthScore} prepared fresh at ${option.hawkerCentre}.`;
    let con = `Con: Peak lunch queue averages 8 to 12 minutes between 12:15 and 1:00 PM.`;
    let opinion = `Opinion: This is today's definitive pick — comforting, authentic, and leaves you feeling revitalized.`;

    if (option.id === 'amoy-han-kee') {
      pro = 'Pro: Thick-cut, crystal-fresh Spanish mackerel in a light bittergourd broth with zero oil.';
      con = 'Con: Peak lunch queue averages 15 minutes; best to grab a seat by 11:45 AM.';
      opinion = 'Opinion: The gold standard for a revitalizing CBD lunch that never causes an afternoon slump.';
    } else if (option.id === 'maxwell-zhen-zhen') {
      pro = 'Pro: Silky, double-boiled Cantonese congee packed with sliced fish and fresh ginger slivers.';
      con = 'Con: Steaming hot bowl requires a few minutes to cool down before savoring.';
      opinion = 'Opinion: True soothing comfort food when your gut needs gentle, warm nourishment.';
    } else if (option.id === 'amoy-thunder-tea') {
      pro = 'Pro: Nutrient-dense Hakka tea broth with bitter greens, tofu cubes, and nutty brown rice.';
      con = 'Con: Distinctive herbal basil-mint broth profile is bold and unashamedly green.';
      opinion = 'Opinion: An unbeatable vitality bowl that digests smoothly and resets your palate.';
    } else if (option.id === 'hong-lim-sungei-road') {
      pro = 'Pro: Fragrant lemongrass and dried shrimp aroma with generous plump cockles and tofu puffs.';
      con = 'Con: Rich spiced gravy is meant as a satisfying indulgence rather than everyday diet food.';
      opinion = 'Opinion: The most rewarding spicy lunch in Singapore when you want vibrant, unapologetic flavor.';
    } else if (option.id === 'maxwell-tian-tian') {
      pro = 'Pro: Velvety poached chicken with aromatic ginger-pandan rice and lively citrus chili dip.';
      con = 'Con: International tourist recognition means lines form promptly at noon.';
      opinion = 'Opinion: Unquestionable classic that reminds you why Singapore hawker cuisine is celebrated worldwide.';
    } else if (option.id === 'outram-ya-hua-bkt') {
      pro = 'Pro: Clear Sarawak white pepper broth infused with crushed garlic cloves and tender prime ribs.';
      con = 'Con: Pungent peppery broth warms you up quickly — sit near an outdoor ceiling fan.';
      opinion = 'Opinion: Restorative comfort that cleanses the sinuses and gives deep, lasting afternoon stamina.';
    } else if (option.id === 'rochor-qiu-rong-ban-mian') {
      pro = 'Pro: Hand-torn noodles with chewy elasticity swimming in rich anchovy broth and iron-rich mani cai.';
      con = 'Con: Made-to-order bowls take 5–7 minutes per batch at peak hours.';
      opinion = 'Opinion: An honest, soulful hawker bowl that hits the exact sweet spot between comfort and nourishment.';
    } else if (option.id === 'kampong-glam-nasi-pariaman') {
      pro = 'Pro: Authentic slow-simmered beef rendang with aromatic turmeric leaves and coconut gravy.';
      con = 'Con: Generous spiced dishes sell out quickly by 1:30 PM.';
      opinion = 'Opinion: Heritage Halal cooking at its finest — deeply savory, satisfying, and memorable.';
    } else if (option.id === 'crawford-tai-hwa-bcm') {
      pro = 'Pro: Michelin-starred springy noodles coated in sharp aged black vinegar, crispy sole fish, and fresh minced pork.';
      con = 'Con: Dedicated queue can reach 20–30 minutes during midday rush.';
      opinion = 'Opinion: If you crave unforgettable acidic tang and savory punch, nothing rivals Tai Hwa.';
    } else if (option.id === 'chinatown-ann-chin-popiah') {
      pro = 'Pro: Translucent handmade wrappers packed with braised jicama, crushed peanuts, and fresh cilantro.';
      con = 'Con: Best eaten immediately at the table to preserve the delicate crispy bits.';
      opinion = 'Opinion: The perfect light, vegetable-forward meal that leaves you energized for the rest of your day.';
    }

    if (rejectionCount >= 2) {
      opinion = 'Opinion: Alright, locking this in — you deserve a satisfying meal and you have to eat sometime.';
    }

    return { pro, con, opinion };
  }

  /**
   * Generates Cook Mode recipes based on expiring items (FIFO)
   */
  static generateCookRecipes(taggedItems: string[]): CookRecipe[] {
    const itemsText = taggedItems.join(', ');
    return [
      {
        id: 'recipe-1',
        title: `Wilted ${taggedItems[0] || 'Greens'} & Golden Pan-Seared Bowl`,
        cookTime: '12 mins',
        expiringItemsUsed: taggedItems.slice(0, 3),
        estimatedSavings: 13.50,
        description: `A fast, restorative home bowl that uses up ${itemsText} before they spoil.`,
        steps: [
          `Heat a dash of sesame oil in a skillet over medium heat.`,
          `Quickly sear ${taggedItems[1] || 'protein'} until golden and fragrant (4 mins).`,
          `Toss in ${taggedItems[0] || 'greens'} with a splash of soy sauce or broth until lightly wilted (2 mins).`,
          `Garnish with toasted sesame seeds and serve warm over rice or grain.`
        ],
        nutritionHighlight: 'Rich in antioxidants, plant protein, and fresh vitamins.'
      },
      {
        id: 'recipe-2',
        title: `10-Minute Comfort Egg & ${taggedItems[1] || 'Tofu'} Simmered Broth`,
        cookTime: '10 mins',
        expiringItemsUsed: taggedItems.slice(0, 2),
        estimatedSavings: 11.00,
        description: `Delicate Japanese dashi or vegetable broth poaching your expiring ingredients effortlessly.`,
        steps: [
          `Bring 350ml of dashi or clean water with a dash of light soy sauce to a gentle boil.`,
          `Drop in ${taggedItems.join(' and ')} in order of cooking time.`,
          `Swirl in a beaten egg to create silky ribbons, then turn off the heat immediately.`,
          `Top with scallions and white pepper.`
        ],
        nutritionHighlight: 'Ultra-gentle on digestion, hydrating, and zero food waste.'
      }
    ];
  }

  /**
   * Evaluates a Squad's collective mood board and decides ONE hawker spot
   * Strictly NO public reasoning or attribution of members' personal constraints!
   */
  static resolveSquadPick(squad: Squad): {
    settledPick: FoodOption;
    verdict: { pro: string; con: string; opinion: string };
    memberNotes: Record<string, PersonalizedNote>;
  } {
    // Determine prominent mood from live votes & proxies
    const moods = squad.boardTiles.map(t => t.mood);
    const moodCounts: Record<string, number> = {};
    moods.forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1; });

    let dominantMood: Mood = 'comfort';
    let highestCount = 0;
    Object.entries(moodCounts).forEach(([m, count]) => {
      if (count > highestCount) {
        highestCount = count;
        dominantMood = m as Mood;
      }
    });

    // Select candidate matching the group vibe
    let candidates = SINGAPORE_HAWKER_DATABASE.filter(opt => opt.tags.includes(dominantMood));
    if (candidates.length === 0) candidates = SINGAPORE_HAWKER_DATABASE;
    const settledPick = candidates[0];

    const verdict = {
      pro: `Pro: Ample group seating at ${settledPick.hawkerCentre} with versatile options across multiple dietary preferences.`,
      con: `Con: Recommend having one person reserve table space while others pick up orders.`,
      opinion: `Opinion: The optimal shared compromise that balances convenience, speed, and vibrant flavor.`
    };

    // Synthesize private personalized notes for each member
    const memberNotes: Record<string, PersonalizedNote> = {};
    squad.members.forEach(member => {
      let orderRecommendation = `${settledPick.dishHighlights[0]}`;
      if (member.dietRestriction.toLowerCase().includes('vegetarian')) {
        orderRecommendation = `Stall #01-31 Vegetarian braised tofu and greens with brown rice ($5.50).`;
      } else if (member.dietRestriction.toLowerCase().includes('low carb')) {
        orderRecommendation = `Double protein sliced fish or chicken, hold the noodles, extra soup greens ($7.00).`;
      } else if (member.dietRestriction.toLowerCase().includes('halal')) {
        orderRecommendation = `Nearby Halal-certified corner stall for fragrant chicken herbal soup ($6.50).`;
      }

      memberNotes[member.id] = {
        whyFits: `Accommodates your ${member.dietRestriction} preference while letting the squad enjoy ${settledPick.cuisine}.`,
        whatToOrder: `Your dish: ${orderRecommendation}`,
        budgetMatch: `Aligned with your ${member.budget} budget expectations.`
      };
    });

    return { settledPick, verdict, memberNotes };
  }

  /**
   * Generates a subtle, non-nagging behavioral psychology energy forecast
   * Focuses on immediate afternoon vitality & effortless micro-upgrades instead of guilt.
   */
  static synthesizeEnergyNudge(option: FoodOption): EnergyNudge {
    const text = `${option.dishHighlights.join(' ')} ${option.cuisine} ${option.tags.join(' ')} ${option.healthScore}`.toLowerCase();

    // Clean / broth / low-GI
    if (text.includes('fish soup') || text.includes('clean') || text.includes('tea') || text.includes('popiah') || text.includes('yong tau foo') || text.includes('salad')) {
      return {
        slumpRiskLevel: 'low',
        forecastLabel: '🟢 3 PM High Alertness Zone',
        forecastDetail: 'Lean protein with gentle broth. Steady glucose release protects clear cognitive focus during afternoon meetings.',
        counterHack: 'Ask for extra choy sum or bittergourd for micronutrient hydration.',
        drinkPairingHack: 'Pair with warm water or Kopi-O Kosong (0g added sugar) for peak mental clarity.',
        psychologyAngle: 'Immediate vitality dividend: your 3 PM self will thank your 12 PM self.'
      };
    }

    // Heavy carbs / high oil / coconut milk
    if (text.includes('laksa') || text.includes('char kway') || text.includes('hokkien mee') || text.includes('nasi lemak') || text.includes('biryani') || text.includes('fried')) {
      return {
        slumpRiskLevel: 'high',
        forecastLabel: '🔴 3 PM Food Coma Advisory',
        forecastDetail: 'Rich saturated fat and fast carbs induce post-prandial serotonin relaxation. Expect heavy eyelids by 2:45 PM.',
        counterHack: 'Ask for "mai zhi" (sauce on the side) and do a brisk 5-min walk back to office to clear sluggishness.',
        drinkPairingHack: 'Swap sugary drink for Teh-C Siew Dai or Sugar-Free Iced Oolong (-18g sugar, softens insulin spike).',
        psychologyAngle: 'Effortless micro-hack: Keep 100% of the wok hei comfort while halving the afternoon crash.'
      };
    }

    // Moderate / balanced
    return {
      slumpRiskLevel: 'moderate',
      forecastLabel: '🟡 3 PM Balanced Vitality',
      forecastDetail: 'Wholesome fuel with moderate digestive load. Keeps steady energy if paired with good hydration.',
      counterHack: 'Ask for extra cucumber/greens and avoid drinking every drop of heavy salty broth.',
      drinkPairingHack: 'Pair with Lime Juice or Green Tea Siew Dai for refreshing antioxidant balance.',
      psychologyAngle: 'Balanced comfort without guilt—just pace your carbs and enjoy.'
    };
  }

  /**
   * Fast Lane: 2-Choice Deadlock Breaker
   * Resolves dilemma between Choice A & Choice B using decision psychology, slump forecasting, and location heuristics.
   */
  static async resolveDualChoice(params: {
    choiceA: string;
    choiceB: string;
    isCoinFlip?: boolean;
    userLocation?: UserLocation;
    transportMode?: TransportMode;
    userDiet?: string;
    userBudget?: string;
    userPriorities?: string[];
    venueTypePreference?: 'all' | 'hawker' | 'restaurant';
  }): Promise<KaleRecommendation> {
    const { choiceA, choiceB, isCoinFlip } = params;
    const userLoc = params.userLocation || POPULAR_SINGAPORE_LOCATIONS[0];
    const transportMode = params.transportMode || 'walking';
    const diet = params.userDiet || 'No Restrictions';
    const budget = params.userBudget || '$';
    const priorities = params.userPriorities || ['Health & Longevity', 'Calorie Control (<500 kcal)'];
    const venueType = params.venueTypePreference || 'all';

    // Tactile micro-pause for smooth UI transition
    await new Promise(resolve => setTimeout(resolve, 260));

    const findOptionForQuery = (query: string): FoodOption => {
      const q = query.toLowerCase().trim();
      const pool = venueType === 'all' 
        ? SINGAPORE_HAWKER_DATABASE 
        : SINGAPORE_HAWKER_DATABASE.filter(o => o.venueType === venueType);
      const activePool = pool.length > 0 ? pool : SINGAPORE_HAWKER_DATABASE;

      const match = activePool.find(opt => 
        opt.dishHighlights.some(d => d.toLowerCase().includes(q)) ||
        opt.cuisine.toLowerCase().includes(q) ||
        opt.stallName.toLowerCase().includes(q) ||
        opt.tags.some(t => t.toLowerCase().includes(q))
      );
      return match || activePool[Math.floor(Math.random() * activePool.length)];
    };

    const optA = findOptionForQuery(choiceA);
    const optB = findOptionForQuery(choiceB);

    // Compute slump risk for both
    const textA = `${choiceA} ${optA.dishHighlights.join(' ')} ${optA.tags.join(' ')}`.toLowerCase();
    const textB = `${choiceB} ${optB.dishHighlights.join(' ')} ${optB.tags.join(' ')}`.toLowerCase();

    const calcRisk = (txt: string) => {
      if (txt.includes('fish soup') || txt.includes('clean') || txt.includes('popiah') || txt.includes('tea') || txt.includes('salad') || txt.includes('yong tau foo')) {
        return { level: 'low' as const, percentage: 15, description: '15% slump risk: Light broth, clean protein, sustained 3 PM focus.' };
      }
      if (txt.includes('laksa') || txt.includes('char kway') || txt.includes('hokkien') || txt.includes('nasi lemak') || txt.includes('fried')) {
        return { level: 'high' as const, percentage: 78, description: '78% slump risk: High carb/coconut spike triggering 2:45 PM food coma.' };
      }
      return { level: 'moderate' as const, percentage: 42, description: '42% slump risk: Wholesome comfort, steady energy burn.' };
    };

    const slumpRiskA = calcRisk(textA);
    const slumpRiskB = calcRisk(textB);

    let winner: 'A' | 'B' = 'A';
    let verdictTitle = '';
    let verdictReasoning = '';
    let psychologyInsight = '';

    if (isCoinFlip) {
      const flip = Math.random() >= 0.5;
      winner = flip ? 'A' : 'B';
      const winnerName = winner === 'A' ? choiceA : choiceB;
      const loserName = winner === 'A' ? choiceB : choiceA;
      verdictTitle = `🪙 Coin Landed on ${winnerName}!`;
      verdictReasoning = `Decision paralysis broken! The universe has spoken: go with ${winnerName}. Notice if you felt a secret twinge of relief or disappointment—that reveals your true subconscious craving.`;
      psychologyInsight = `Psychological Coin Toss: Sigmund Freud observed that tossing a coin reveals what you actually desire the moment it is in the air.`;
    } else {
      // Intelligent Decision Psychology evaluation
      // Rule 1: Slump risk comparison
      if (slumpRiskA.percentage !== slumpRiskB.percentage) {
        if (slumpRiskA.percentage < slumpRiskB.percentage) {
          winner = 'A';
          verdictTitle = `🏆 ${choiceA} Wins: Clean Afternoon Focus`;
          verdictReasoning = `${choiceA} gives you the exact savory satisfaction you crave while saving you from the 2:45 PM carb slump that ${choiceB} would trigger.`;
          psychologyInsight = `Decision Framing: By choosing ${choiceA}, you earn an immediate 3 PM productivity dividend with zero mealtime regret.`;
        } else {
          winner = 'B';
          verdictTitle = `🏆 ${choiceB} Wins: Clean Afternoon Focus`;
          verdictReasoning = `${choiceB} satisfies your hunger without the heavy carb lethargy of ${choiceA}, keeping you sharp and alert for the rest of the day.`;
          psychologyInsight = `Choice Architecture: Protecting your afternoon energy momentum without feeling like you made a sacrifice.`;
        }
      } else {
        // Tie breaker by travel distance
        const estA = calculateTravelEstimate(userLoc, optA, transportMode);
        const estB = calculateTravelEstimate(userLoc, optB, transportMode);
        if (estA.durationMinutes <= estB.durationMinutes) {
          winner = 'A';
          verdictTitle = `🏆 ${choiceA} Wins: Quickest Arrival`;
          verdictReasoning = `Both are great picks, but ${choiceA} is ${estA.durationMinutes} mins away at ${optA.hawkerCentre} (faster walk, less queue stress).`;
          psychologyInsight = `Friction Reduction: Minimizing transition time maximizes your break relaxation.`;
        } else {
          winner = 'B';
          verdictTitle = `🏆 ${choiceB} Wins: Quickest Arrival`;
          verdictReasoning = `Both are tempting, but ${choiceB} is just ${estB.durationMinutes} mins away at ${optB.hawkerCentre}, saving you time.`;
          psychologyInsight = `Friction Reduction: Minimizing transition time maximizes your break relaxation.`;
        }
      }
    }

    const winningOption = winner === 'A' ? optA : optB;
    const winningChoiceName = winner === 'A' ? choiceA : choiceB;

    const dualComparison: DualChoiceComparison = {
      choiceA,
      choiceB,
      winner,
      verdictTitle,
      verdictReasoning,
      slumpRiskA,
      slumpRiskB,
      psychologyInsight,
      isCoinFlip
    };

    const travelEstimate = calculateTravelEstimate(userLoc, winningOption, transportMode);
    const personalNote = this.synthesizePersonalNote(winningOption, diet, budget, priorities);
    const energyNudge = this.synthesizeEnergyNudge(winningOption);

    return {
      option: winningOption,
      pro: `Pro: Deadlock resolved! ${winningChoiceName} is chosen for maximum satisfaction with zero afternoon slump.`,
      con: `Con: If you felt an instant secret twinge for ${winner === 'A' ? choiceB : choiceA}, your subconscious revealed your true craving!`,
      opinion: `Opinion: Between ${choiceA} and ${choiceB}, ${winningChoiceName} wins today. ${verdictReasoning}`,
      personalNote,
      rejectionCount: 0,
      sourceType: 'fast_lane',
      sourceQuery: `${choiceA} vs ${choiceB}`,
      decisionPriority: priorities.join(' > '),
      travelEstimate,
      energyNudge
    };
  }
}
