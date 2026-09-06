import { 
  FoodOption, 
  KaleRecommendation, 
  Mood, 
  RejectionReason, 
  PersonalizedNote,
  CookRecipe,
  Squad,
  SquadMember
} from '../types';
import { SINGAPORE_HAWKER_DATABASE } from '../data/hawkerData';
import { 
  calculateTravelEstimate, 
  UserLocation, 
  TransportMode, 
  POPULAR_SINGAPORE_LOCATIONS 
} from '../data/locationService';

export class KaleService {
  /**
   * Generates a single thoughtful recommendation based on mood, location, and user priorities
   * Ultra-fast execution (sub-250ms) to completely eliminate decision fatigue and waiting anxiety.
   */
  static async getRecommendation(params: {
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
  }): Promise<KaleRecommendation> {
    const rejectionCount = params.rejectionCount || 0;
    const previousRejected = new Set(params.previousRejectedIds || []);
    const diet = params.userDiet || 'Balanced, High-Protein';
    const budget = params.userBudget || '$';
    const priorities = params.userPriorities || ['Health & Longevity', 'Calorie Control (<500 kcal)'];
    const userLoc = params.userLocation || POPULAR_SINGAPORE_LOCATIONS[0];
    const transportMode = params.transportMode || 'walking';

    // Tactile micro-pause (~200ms) for silky UI transition without any perceived lag
    await new Promise(resolve => setTimeout(resolve, 200));

    // Intelligent local rule-based matching engine
    let candidateOptions = SINGAPORE_HAWKER_DATABASE.filter(opt => !previousRejected.has(opt.id));
    if (candidateOptions.length === 0) {
      candidateOptions = [...SINGAPORE_HAWKER_DATABASE];
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

    // If walking mode and no specific far search, prioritize venues within walking distance (<14 mins)
    if (transportMode === 'walking' && !params.fastLaneQuery) {
      const walkable = candidateOptions.filter(opt => {
        const est = calculateTravelEstimate(userLoc, opt, 'walking');
        return est.durationMinutes <= 15;
      });
      if (walkable.length > 0) {
        candidateOptions = walkable;
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

    const selectedOption = candidateOptions[0] || SINGAPORE_HAWKER_DATABASE[0];

    // Compute live travel estimate for the selected option from user location
    const travelEstimate = calculateTravelEstimate(userLoc, selectedOption, transportMode);

    // Build the locked 3-line Pro/Con/Opinion
    const proConOpinion = this.synthesizeProConOpinion(selectedOption, params.lastRejectionReason, rejectionCount);

    // Build deeply personalized private note strictly tailored to user's priorities, diet, and budget
    const personalNote = this.synthesizePersonalNote(selectedOption, diet, budget, priorities, params.mood);

    return {
      option: selectedOption,
      pro: proConOpinion.pro,
      con: proConOpinion.con,
      opinion: proConOpinion.opinion,
      personalNote,
      rejectionCount,
      sourceType: params.fastLaneQuery ? 'fast_lane' : (params.mood ? 'mood' : 'mystery'),
      sourceQuery: params.fastLaneQuery,
      decisionPriority: priorities.join(' > '),
      travelEstimate
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
}
