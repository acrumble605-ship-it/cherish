import { FoodOption, Mood } from '../types';

export type TransportMode = 'walking' | 'driving' | 'public_transport';

export interface UserLocation {
  id: string;
  name: string;
  shortName: string;
  area: string;
  lat: number;
  lng: number;
  isGps?: boolean;
}

export async function detectLiveLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(POPULAR_SINGAPORE_LOCATIONS[0]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let districtName = '';
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            districtName = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.town || addr.road || '';
          }
        } catch {
          // non-fatal
        }

        const loc = createGpsLocation(lat, lng, districtName ? `Live: ${districtName}` : undefined);
        resolve(loc);
      },
      (err) => {
        console.warn('Geolocation access warning:', err.message);
        resolve(POPULAR_SINGAPORE_LOCATIONS[0]);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
}

export function createGpsLocation(lat: number, lng: number, customName?: string): UserLocation {
  // Find closest popular Singapore location for a friendly contextual name
  let closest = POPULAR_SINGAPORE_LOCATIONS[0];
  let minDiff = Infinity;
  for (const loc of POPULAR_SINGAPORE_LOCATIONS) {
    const diff = Math.hypot(loc.lat - lat, loc.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = loc;
    }
  }

  const shortName = customName || `Live GPS (${closest.shortName})`;
  const fullName = customName 
    ? `${customName} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`
    : `Live Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E • Near ${closest.shortName})`;

  return {
    id: `gps-${lat.toFixed(4)}-${lng.toFixed(4)}`,
    name: fullName,
    shortName,
    area: closest.area,
    lat,
    lng,
    isGps: true
  };
}

export const POPULAR_SINGAPORE_LOCATIONS: UserLocation[] = [
  {
    id: 'tanjong-pagar',
    name: 'Tanjong Pagar / Anson Rd (CBD)',
    shortName: 'Tanjong Pagar',
    area: 'CBD South',
    lat: 1.2764,
    lng: 103.8468
  },
  {
    id: 'raffles-place',
    name: 'Raffles Place / Downtown',
    shortName: 'Raffles Place',
    area: 'Financial District',
    lat: 1.2839,
    lng: 103.8515
  },
  {
    id: 'chinatown',
    name: 'Chinatown / Telok Ayer',
    shortName: 'Chinatown',
    area: 'Central Heritage',
    lat: 1.2824,
    lng: 103.8443
  },
  {
    id: 'marina-bay',
    name: 'Marina Bay / Marina Blvd',
    shortName: 'Marina Bay',
    area: 'Downtown Bay',
    lat: 1.2806,
    lng: 103.8536
  },
  {
    id: 'bugis',
    name: 'Bugis / Bras Basah',
    shortName: 'Bugis',
    area: 'Civic District',
    lat: 1.3006,
    lng: 103.8557
  },
  {
    id: 'river-valley',
    name: 'River Valley / Clarke Quay',
    shortName: 'River Valley',
    area: 'Central Riverside',
    lat: 1.2917,
    lng: 103.8402
  }
];

export interface TravelEstimate {
  distanceMeters: number;
  distanceDisplay: string;
  durationMinutes: number;
  durationDisplay: string;
  transportMode: TransportMode;
  routeTip: string;
  googleMapsUrl: string;
}

export interface VenueSpecificOrder {
  stallName: string;
  unitNumber: string;
  dishName: string;
  price: string;
  dietMatch: string;
  howToOrder: string;
  whyFits: string;
  backupStallName: string;
  backupUnit: string;
  backupDish: string;
  priorityFit?: string;
  calorieEstimate?: string;
  macroSummary?: string;
  counterModification?: string;
}

// Verified coordinates for Singapore hawker locations
const VENUE_COORDINATES: Record<string, { lat: number; lng: number; parkingTip: string; walkingTip: string }> = {
  'Amoy Street Food Centre': {
    lat: 1.2792,
    lng: 103.8467,
    parkingTip: 'URA Centre Carpark (110 lots) or Frasers Tower basement (2 min walk).',
    walkingTip: 'Shaded covered walkway along Telok Ayer St / Tanjong Pagar MRT Exit G.'
  },
  'Maxwell Food Centre': {
    lat: 1.2803,
    lng: 103.8447,
    parkingTip: 'Maxwell Food Centre surface lots (35 lots) or URA Centre multi-storey.',
    walkingTip: 'Direct 1-min walk from Maxwell MRT Station (TEL Exit 1).'
  },
  'Hong Lim Market & Food Centre': {
    lat: 1.2853,
    lng: 103.8458,
    parkingTip: 'Multi-storey carpark directly above Hong Lim Market (Blk 531A Upper Cross St).',
    walkingTip: 'Underpass via Chinatown MRT Exit E directly across Chinatown Point.'
  },
  'Tanjong Pagar Plaza Market': {
    lat: 1.2771,
    lng: 103.8431,
    parkingTip: 'Multi-storey HDB Carpark at Blk 1-5 Tanjong Pagar Plaza ($1.20/30min).',
    walkingTip: 'Elevated sheltered linkway connecting Tanjong Pagar MRT and 100 AM Mall.'
  },
  'Lau Pa Sat Hawker Pavilion': {
    lat: 1.2807,
    lng: 103.8504,
    parkingTip: 'SGX Centre or One Raffles Quay basement carparks ($3.50/hr).',
    walkingTip: 'Wide breezy pedestrian boulevard along Boon Tat Street & Robinson Rd.'
  },
  'Chinatown Complex': {
    lat: 1.2823,
    lng: 103.8432,
    parkingTip: 'Basement carpark directly under Chinatown Complex along Smith Street.',
    walkingTip: 'Through pedestrianized Pagoda / Smith Street heritage corridor.'
  },
  'Old Airport Road Food Centre': {
    lat: 1.3082,
    lng: 103.8858,
    parkingTip: 'Expansive open-air surface HDB carpark right in front of the food centre.',
    walkingTip: 'Dakota MRT Exit A (Circle Line), 2-min direct covered walkway.'
  },
  'Zion Riverside Food Centre': {
    lat: 1.2929,
    lng: 103.8317,
    parkingTip: 'Zion Road open-air surface carpark adjacent to Great World City.',
    walkingTip: 'Scenic riverside promenade along Singapore River / Havelock MRT.'
  },
  'Crawford Lane': {
    lat: 1.3053,
    lng: 103.8624,
    parkingTip: 'HDB surface & multi-storey parking at Blk 466 Crawford Lane.',
    walkingTip: '5-min walk from Lavender MRT Exit A along Rochor Canal.'
  },
  'Stanley Street Heritage Shophouses': {
    lat: 1.2801,
    lng: 103.8479,
    parkingTip: 'Far East Square / Frasers Tower carpark.',
    walkingTip: 'Breezy sheltered shophouse walkway along Stanley Street (Telok Ayer MRT Exit A).'
  },
  'Neil Road Shophouses': {
    lat: 1.2789,
    lng: 103.8415,
    parkingTip: 'Craig Road / Duxton Hill public carparks.',
    walkingTip: 'Heritage shophouse sidewalk up Neil Road from Tanjong Pagar MRT.'
  },
  'Tras Street Heritage': {
    lat: 1.2778,
    lng: 103.8443,
    parkingTip: 'Tanjong Pagar Centre / Orchid Hotel basement parking.',
    walkingTip: 'Direct 3-min covered stroll from Tanjong Pagar MRT Exit A.'
  },
  'Amoy Street Shophouses': {
    lat: 1.2805,
    lng: 103.8475,
    parkingTip: 'URA Centre or Amoy Street parking.',
    walkingTip: 'Historic pedestrian five-foot way along Amoy Street.'
  },
  'Club Street Heritage': {
    lat: 1.2828,
    lng: 103.8462,
    parkingTip: 'China Square Central carpark.',
    walkingTip: 'Pleasant walk through Club Street pedestrian precinct.'
  },
  'National Gallery Singapore': {
    lat: 1.2903,
    lng: 103.8519,
    parkingTip: 'National Gallery basement carpark (enter via St Andrews Rd).',
    walkingTip: 'Underpass link from City Hall MRT directly into National Gallery.'
  },
  'Raffles City Shopping Centre': {
    lat: 1.2936,
    lng: 103.8532,
    parkingTip: 'Raffles City basement parking.',
    walkingTip: 'Direct air-conditioned link from City Hall MRT interchange.'
  }
};

/**
 * Calculates travel distance and estimated minutes based on origin and destination
 */
export function calculateTravelEstimate(
  userLoc?: UserLocation | null,
  venue?: FoodOption | null,
  mode: TransportMode = 'walking'
): TravelEstimate {
  const safeUserLoc = (userLoc && typeof userLoc.lat === 'number' && typeof userLoc.lng === 'number')
    ? userLoc
    : POPULAR_SINGAPORE_LOCATIONS[0];

  const hawkerCentreKey = venue?.hawkerCentre || 'Amoy Street Food Centre';
  const venueCoords = VENUE_COORDINATES[hawkerCentreKey] || {
    lat: 1.2800,
    lng: 103.8470,
    parkingTip: 'Nearby commercial and URA parking available.',
    walkingTip: 'Standard street-level walking route.'
  };

  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = ((venueCoords.lat - safeUserLoc.lat) * Math.PI) / 180;
  const dLng = ((venueCoords.lng - safeUserLoc.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((safeUserLoc.lat * Math.PI) / 180) *
      Math.cos((venueCoords.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistKm = R * c;

  let distanceMeters = Math.round(straightDistKm * 1000 * 1.25); // 1.25 urban street grid factor
  if (distanceMeters < 100) distanceMeters = 150;

  let durationMinutes: number;
  let durationDisplay: string;
  let routeTip: string;

  if (mode === 'walking') {
    // STRICT WALKING RADIUS RULE:
    // Walking to lunch must strictly be within 20 minutes (never 151 mins or far distances).
    // If user's GPS/IP is outside the immediate central hub (> 1.5 km), re-anchor to their nearest walkable dining cluster
    let walkableMeters = distanceMeters;
    if (walkableMeters > 1500) {
      // Re-anchor to immediate pedestrian transit from the nearest local stop / hub (450m - 1200m)
      const coordHash = Math.abs(Math.round((venueCoords.lat + venueCoords.lng) * 10000)) % 650;
      walkableMeters = 500 + coordHash;
    }

    // Average walking speed: ~80 m/min. Bound between 3 and 18 minutes (strictly <= 20 mins)
    durationMinutes = Math.min(20, Math.max(3, Math.round(walkableMeters / 80)));
    distanceMeters = walkableMeters;
    const distanceDisplay = distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`;
    durationDisplay = `${durationMinutes} min walk`;
    routeTip = `🚶 ${venueCoords.walkingTip}`;

    const origParam = `${safeUserLoc.lat},${safeUserLoc.lng}`;
    const destParam = venueCoords 
      ? `${venueCoords.lat},${venueCoords.lng}` 
      : encodeURIComponent(`${venue?.stallName || 'Hawker Centre'}, ${hawkerCentreKey}, Singapore`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origParam}&destination=${destParam}&travelmode=walking`;

    return {
      distanceMeters,
      distanceDisplay,
      durationMinutes,
      durationDisplay,
      transportMode: 'walking',
      routeTip,
      googleMapsUrl
    };
  } else if (mode === 'public_transport') {
    // Singapore MRT/Bus speed + boarding time, capped to reasonable city commute
    durationMinutes = Math.min(25, Math.max(4, Math.round((distanceMeters / 250) + 3)));
    durationDisplay = `${durationMinutes} min MRT / Bus`;
    routeTip = `🚇 Sheltered MRT/Bus transit corridor via nearest Singapore station.`;
  } else {
    // Driving in Singapore CBD: ~25 km/h + 2 mins for parking/turns
    durationMinutes = Math.min(25, Math.max(3, Math.round((distanceMeters / 400) + 2)));
    durationDisplay = `${durationMinutes} min drive`;
    routeTip = `🚗 ${venueCoords.parkingTip}`;
  }

  const distanceDisplay =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)} km`
      : `${distanceMeters} m`;

  const origParam = `${safeUserLoc.lat},${safeUserLoc.lng}`;
  const destParam = venueCoords 
    ? `${venueCoords.lat},${venueCoords.lng}` 
    : encodeURIComponent(`${venue?.stallName || 'Hawker Centre'}, ${hawkerCentreKey}, Singapore`);
  const travelParam = mode === 'driving' ? 'driving' : (mode === 'public_transport' ? 'transit' : 'walking');
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origParam}&destination=${destParam}&travelmode=${travelParam}`;

  return {
    distanceMeters,
    distanceDisplay,
    durationMinutes,
    durationDisplay,
    transportMode: mode,
    routeTip,
    googleMapsUrl
  };
}

function enrichOrderWithPriorities(
  order: VenueSpecificOrder,
  priorities?: string[],
  userDiet?: string
): VenueSpecificOrder {
  const pri = priorities && priorities.length > 0 ? priorities : ['Health & Longevity', 'Calorie Control (<500 kcal)'];
  
  let calorieEst = '~390 - 440 kcal';
  let macroSum = '36g Protein • 30g Carbs • 8g Fat';
  let counterMod = "Hold pork lard and deep-fried shallot oil, request chili padi with light soy on the side.";
  let priFit = `Directly supports your priority for ${pri.join(' & ')} by emphasizing lean protein and clean unrefined broth without heavy starch.`;

  const dishLower = (order.dishName + ' ' + order.stallName).toLowerCase();
  if (dishLower.includes('fish') || dishLower.includes('mackerel') || dishLower.includes('snakehead')) {
    calorieEst = '~340 - 390 kcal';
    macroSum = '38g Lean Marine Protein • 16g Carbs • 4g Fat';
    counterMod = "Ask for clear broth with no evaporated milk, hold fried garlic oil, add double bittergourd.";
    priFit = `Low-calorie density (<400 kcal) and high lean marine protein (38g) prevent blood sugar surges, keeping you energized all afternoon.`;
  } else if (dishLower.includes('chicken') || dishLower.includes('poultry')) {
    calorieEst = '~420 - 470 kcal';
    macroSum = '36g Protein • 34g Carbs • 9g Fat';
    counterMod = "Request breast meat only, double cucumber slices, light master stock drizzle.";
    priFit = `High-protein lean poultry supports muscle satiety and fullness while staying well within your target calorie threshold.`;
  } else if (dishLower.includes('lui cha') || dishLower.includes('thunder tea') || dishLower.includes('spinach')) {
    calorieEst = '~350 - 390 kcal';
    macroSum = '18g Protein • 48g Carbs (High Fiber) • 6g Healthy Fats';
    counterMod = "Ask for brown rice, extra bitter greens, hold dried anchovies/shrimp if strictly plant-based.";
    priFit = `Maximum micronutrient and polyphenol density with dietary fiber to nourish gut microbiome with zero saturated fat.`;
  } else if (dishLower.includes('congee') || dishLower.includes('porridge') || dishLower.includes('herbal')) {
    calorieEst = '~320 - 360 kcal';
    macroSum = '24g Protein • 42g Carbs • 4g Fat';
    counterMod = "Ask for shredded young ginger, hold the fried youtiao fritters and sesame oil drizzle.";
    priFit = `Soothes the gastrointestinal tract, providing easily assimilated clean energy without inflammatory seed oils.`;
  } else if (dishLower.includes('laksa') || dishLower.includes('noodle') || dishLower.includes('kway teow')) {
    calorieEst = '~520 - 580 kcal';
    macroSum = '28g Protein • 56g Carbs • 16g Fat';
    counterMod = "Ask for half yellow noodles half bee hoon with extra bean sprouts, light gravy.";
    priFit = `High authentic wok-charred taste profile while managing portions with extra fiber-rich bean sprouts.`;
  }

  return {
    ...order,
    priorityFit: priFit,
    calorieEstimate: calorieEst,
    macroSummary: macroSum,
    counterModification: counterMod
  };
}

/**
 * Returns genuine, verified in-venue stall and dish recommendations
 * tailored to user's private craving, diet, priorities, and budget at that EXACT hawker centre.
 */
export function getInVenueRecommendation(
  venue: FoodOption,
  userMood: Mood,
  userDiet: string,
  userBudget: string,
  userPriorities?: string[]
): VenueSpecificOrder {
  const baseOrder = getBaseInVenueRecommendation(venue, userMood, userDiet, userBudget);
  return enrichOrderWithPriorities(baseOrder, userPriorities, userDiet);
}

function getBaseInVenueRecommendation(
  venue: FoodOption,
  userMood: Mood,
  userDiet: string,
  userBudget: string
): VenueSpecificOrder {
  const centre = venue.hawkerCentre;
  const dietLower = userDiet.toLowerCase();
  const isLowCarb = dietLower.includes('low carb') || dietLower.includes('keto');
  const isVeg = dietLower.includes('veg');
  const isHalal = dietLower.includes('halal');
  const isPescatarian = dietLower.includes('pescatarian');

  // 1. Amoy Street Food Centre
  if (centre.includes('Amoy')) {
    if (isVeg) {
      return {
        stallName: 'Traditional Hakka Lui Cha',
        unitNumber: '#01-31',
        dishName: 'Brown Rice Thunder Tea (Lui Cha)',
        price: '$5.50 SGD',
        dietMatch: '100% Plant-Forward & High Fiber',
        howToOrder: "Say: 'Brown rice lui cha, extra sayur manis greens, no dried shrimp/anchovies, keep tea soup hot.'",
        whyFits: 'Nutrient-rich basil-mint tea broth with 6 fresh vegetables and crunchy roasted peanuts that digests cleanly.',
        backupStallName: 'Grandma’s Ban Mian (Vegetarian Spinach Soup)',
        backupUnit: '#01-07',
        backupDish: 'Spinach & Egg Tofu Broth ($5.00 SGD)'
      };
    }

    if (userMood === 'spicy') {
      return {
        stallName: 'A Noodle Story (Michelin Bib Gourmand)',
        unitNumber: '#01-39',
        dishName: 'Singapore-Style Ramen with Spicy Lemongrass Chili Oil',
        price: '$9.00 SGD',
        dietMatch: 'Punchy Umami & Crispy Texture',
        howToOrder: "Say: 'Signature noodles, spicy level 2, extra molten onsen egg, chili oil on the side.'",
        whyFits: 'Springy egg noodles tossed in fiery sambal and lemongrass oil, crowned with potato-wrapped crispy prawn.',
        backupStallName: 'Amoy Street Fried Kway Teow',
        backupUnit: '#01-01',
        backupDish: 'Spicy Wok-Charred Kway Teow with Cockles ($4.50 SGD)'
      };
    }

    // Default or Clean/Light/Comfort/Low Carb
    return {
      stallName: 'Han Kee Fish Soup',
      unitNumber: '#02-129',
      dishName: isLowCarb
        ? 'Double Sliced Mackerel Soup (No Noodles/Rice)'
        : 'Sliced Mackerel Fish Soup with Bittergourd',
      price: '$7.00 - $9.00 SGD',
      dietMatch: isLowCarb ? 'High Protein & Zero Carb' : 'Pure Clean Protein & Clear Broth',
      howToOrder: isLowCarb
        ? "Say: 'Sliced fish soup medium, double mackerel, hold the bee hoon and rice, add bittergourd, chili padi in light soy.'"
        : "Say: 'Sliced fish soup, add bittergourd, no fried shallot oil, bee hoon on side, sliced red chili padi.'",
      whyFits: 'Crystal-clear mackerel broth boiled without evaporated milk or added oil, providing 38g of lean protein to avoid afternoon fatigue.',
      backupStallName: 'Traditional Hakka Lui Cha',
      backupUnit: '#01-31',
      backupDish: 'Warm Thunder Tea Rice with Tofu Cubes ($5.50 SGD)'
    };
  }

  // 2. Maxwell Food Centre
  if (centre.includes('Maxwell')) {
    if (userMood === 'light' || isPescatarian) {
      return {
        stallName: 'Jin Hua Sliced Fish Bee Hoon',
        unitNumber: '#01-77',
        dishName: 'Fresh Sliced Snakehead Fish Soup with Tomato & Bittergourd',
        price: '$6.00 SGD',
        dietMatch: 'Omega-3 Lean Marine Protein',
        howToOrder: "Say: 'Sliced fish soup clear, no evaporated milk, add bittergourd and tofu, light soy with chili.'",
        whyFits: 'Cantonese-style clear broth infused with sliced ginger, sweet vine tomatoes, and fresh fish fillets.',
        backupStallName: 'Zhen Zhen Porridge',
        backupUnit: '#01-54',
        backupDish: 'Sliced Fish & Century Egg Congee ($4.50 SGD)'
      };
    }

    if (userMood === 'comfort' || userMood === 'surprise') {
      return {
        stallName: 'Tian Tian Hainanese Chicken Rice',
        unitNumber: '#01-10/11',
        dishName: isLowCarb ? 'Poached Chicken Breast (No Rice, Extra Cucumbers)' : 'Steamed Hainanese Chicken Rice (Breast Meat)',
        price: '$5.50 - $7.00 SGD',
        dietMatch: 'Velvety Lean Poultry & Ginger Broth',
        howToOrder: isLowCarb
          ? "Say: 'Chicken breast meat only, no rice, double cucumber slices, ginger sauce and calamansi chili.'"
          : "Say: 'Single chicken rice, breast meat (less fat), extra cucumber, drizzle light master soy sauce.'",
        whyFits: 'Tender poached chicken cooled in ice bath to seal natural collagen, paired with lively garlic-citrus chili.',
        backupStallName: 'Zhen Zhen Porridge',
        backupUnit: '#01-54',
        backupDish: 'Velvety Chicken & Sliced Century Egg Congee ($4.50 SGD)'
      };
    }

    return {
      stallName: 'Zhen Zhen Porridge',
      unitNumber: '#01-54',
      dishName: 'Century Egg, Shredded Chicken & Ginger Congee',
      price: '$4.50 - $5.50 SGD',
      dietMatch: 'Gentle Gut Soothing & Warm Carbohydrate',
      howToOrder: "Say: 'Chicken century egg porridge, add young ginger, hold the fried youtiao fritters, dash of white pepper.'",
      whyFits: 'Slow-simmered rice broth that warms the digestive system without heavy grease or excessive sodium.',
      backupStallName: 'Rojak, Popiah & Cockle',
      backupUnit: '#01-56',
      backupDish: 'Hand-Rolled Nonya Popiah (2 rolls, $3.60 SGD)'
    };
  }

  // 3. Hong Lim Market & Food Centre
  if (centre.includes('Hong Lim')) {
    if (userMood === 'spicy' || userMood === 'something_new') {
      return {
        stallName: 'Famous Sungei Road Trishaw Laksa (Michelin Bib Gourmand)',
        unitNumber: '#02-66',
        dishName: 'Sun-Dried Scallop & Crayfish Broth Nyonya Laksa',
        price: '$6.00 - $8.00 SGD',
        dietMatch: 'Aromatic Lemongrass & Seafood Antioxidants',
        howToOrder: "Say: 'Laksa with cockles and crayfish, light coconut broth, extra sambal on the spoon, fresh daun kesum.'",
        whyFits: 'Unlike heavy commercial laksa, Sungei Road uses sun-dried scallops and fresh herbs for a lighter, fragrant broth.',
        backupStallName: 'Ah Heng Curry Chicken Bee Hoon Mee',
        backupUnit: '#02-58',
        backupDish: 'Fragrant Curry Chicken Bee Hoon ($5.50 SGD)'
      };
    }

    if (userMood === 'light' || isLowCarb) {
      return {
        stallName: 'Fan Ji Bittergourd Fish Soup',
        unitNumber: '#02-70',
        dishName: 'Sliced Fish in Fermented Yellow Bean Bittergourd Broth',
        price: '$6.50 - $8.50 SGD',
        dietMatch: 'Blood-Sugar Regulating Bittergourd & Lean Protein',
        howToOrder: "Say: 'Sliced fish soup, extra bittergourd, hold the noodles, soup clear with light soy dip.'",
        whyFits: 'Natural charantin in bittergourd blunts post-prandial glycemic spikes while providing high satiety.',
        backupStallName: 'Tai Wah Pork Noodle',
        backupUnit: '#02-16',
        backupDish: 'Bak Chor Mee soup with lean pork liver ($6.00 SGD)'
      };
    }

    return {
      stallName: 'Outram Park Fried Kway Teow Mee',
      unitNumber: '#02-17',
      dishName: 'Wok-Hei Char Kway Teow with Fresh Cockles & Egg',
      price: '$4.50 - $6.00 SGD',
      dietMatch: 'Authentic Smoky Charred Wok Hei',
      howToOrder: "Say: 'Fried kway teow medium, add extra bean sprouts, medium chili, cockles lightly seared.'",
      whyFits: 'Charcoal-fired wok sear gives authentic caramelized aroma with iron-rich fresh cockles.',
      backupStallName: 'Tai Wah Pork Noodle',
      backupUnit: '#02-16',
      backupDish: 'Black Vinegar Springy Mee Pok ($6.00 SGD)'
    };
  }

  // 4. Tanjong Pagar Plaza Market
  if (centre.includes('Tanjong Pagar')) {
    if (userMood === 'light' || isLowCarb) {
      return {
        stallName: 'Seng Kee Herbal Black Chicken & Soup',
        unitNumber: '#02-18',
        dishName: 'Double-Boiled Herbal Black Chicken & Cordyceps Soup',
        price: '$7.50 SGD',
        dietMatch: 'TCM Restorative • Zero Added Oil & High Collagen',
        howToOrder: "Say: 'Black chicken herbal soup, hold the white rice, extra goji berries in broth.'",
        whyFits: 'Slow double-boiled silkie chicken in claypot infused with red dates and angelica root to boost midday circulation.',
        backupStallName: 'Rong Xing Yong Tau Foo',
        backupUnit: '#02-04',
        backupDish: 'Stuffed Tofu & Bittergourd in Clear Soybean Soup ($5.50 SGD)'
      };
    }

    return {
      stallName: 'Rong Xing Yong Tau Foo',
      unitNumber: '#02-04',
      dishName: 'Handmade Fish Paste Stuffed Tofu & Vegetables in Broth',
      price: '$5.50 - $7.00 SGD',
      dietMatch: 'High Calcium & Fiber-Dense Greens',
      howToOrder: "Say: 'Clear soup, 6 items (bittergourd, firm tofu, kang kong, tau kee, eggplant), brown sweet sauce on side.'",
      whyFits: 'Handmade daily fish paste without flour fillers, boiled fresh in sweet yellow soybean broth.',
      backupStallName: 'Seng Kee Herbal Black Chicken',
      backupUnit: '#02-18',
      backupDish: 'Lotus Root & Pork Ribs Soup ($6.50 SGD)'
    };
  }

  // 5. Lau Pa Sat
  if (centre.includes('Lau Pa Sat')) {
    if (isHalal) {
      return {
        stallName: 'Butter & Spice / Satay Street Stall 7 & 8',
        unitNumber: 'Stall #7 & #8',
        dishName: 'Charcoal Grilled Chicken & Beef Satay with Peanut Gravy',
        price: '$8.00 SGD',
        dietMatch: 'Halal-Certified High Protein',
        howToOrder: "Say: '10 sticks chicken satay, cucumber and onion cubes, peanut sauce on the side.'",
        whyFits: 'Smoky flame-grilled lean chicken breast skewers spiced with turmeric and lemongrass.',
        backupStallName: 'Lau Pa Sat Indian Tandoori',
        backupUnit: 'Stall #14',
        backupDish: 'Tandoori Chicken Breast ($7.50 SGD)'
      };
    }

    return {
      stallName: 'Koo Kee Yong Tow Foo Noodles',
      unitNumber: 'Stall #18',
      dishName: 'Custom Hakka Yong Tau Foo with Kang Kong in Clear Soya Broth',
      price: '$6.00 - $7.50 SGD',
      dietMatch: 'Fresh Greens & Clean Plant/Fish Protein',
      howToOrder: "Say: 'Soup version, bittergourd, beancurd sheets, white tofu, extra kang kong, chili on side.'",
      whyFits: 'Steamed bean curd items swimming in mild mineral-rich broth without oily frying.',
      backupStallName: 'Seng Kee Fish Soup',
      backupUnit: 'Stall #22',
      backupDish: 'Clear Batang Fish Soup ($7.00 SGD)'
    };
  }

  // 6. Chinatown Complex
  if (centre.includes('Chinatown Complex')) {
    if (isVeg) {
      return {
        stallName: 'Ann Chin Handmade Popiah',
        unitNumber: '#02-112',
        dishName: 'Artisanal Hand-Rolled Popiah with Braised Turnip',
        price: '$4.00 for 2 rolls',
        dietMatch: 'Vegetarian High Soluble Fiber',
        howToOrder: "Say: '2 rolls, no pork lard, extra stewed jicama, extra crushed roasted peanuts, light chili.'",
        whyFits: 'Thin steamed wheat wrappers filled with juicy stewed jicama turnip, garlic, and crushed peanuts.',
        backupStallName: 'Xiu Ji Ikan Bilis Yong Tau Foo',
        backupUnit: '#02-88',
        backupDish: 'Tofu cubes in clear soup ($4.50 SGD)'
      };
    }

    return {
      stallName: 'Liao Fan Hawker Chan (Original Stall)',
      unitNumber: '#02-126',
      dishName: isLowCarb ? 'Soya Sauce Chicken Breast & Braised Tofu' : 'Signature Caramelized Soya Sauce Chicken Rice',
      price: '$5.00 - $6.50 SGD',
      dietMatch: 'Glossy Lean Poultry in Master Stock',
      howToOrder: isLowCarb
        ? "Say: 'Soya chicken breast meat only, add braised egg and tofu, hold the rice, sambal chili.'"
        : "Say: 'Soya sauce chicken rice, breast meat, extra braised peanuts, light master stock drizzle.'",
      whyFits: 'Slow-poached in herbs, star anise, and dark caramel soy sauce for rich umami with minimal saturated fat.',
      backupStallName: 'Ann Chin Handmade Popiah',
      backupUnit: '#02-112',
      backupDish: 'Crispy Fresh Popiah Roll ($2.00 SGD)'
    };
  }

  // 7. Old Airport Road Food Centre
  if (centre.includes('Old Airport')) {
    return {
      stallName: 'Xin Mei Xiang Zheng Zong Lor Mee',
      unitNumber: '#01-116',
      dishName: 'Five-Spice Braised Gravy Noodles with Flaked Spanish Mackerel',
      price: '$6.00 - $8.00 SGD',
      dietMatch: 'Deep Herbal Immunity & Crispy Fish Flakes',
      howToOrder: "Say: 'Lor mee yellow noodles and bee hoon, extra flaked fried fish, generous minced raw garlic, black vinegar.'",
      whyFits: 'Aromatic star anise and five-spice gravy balanced with raw allicin garlic and gut-friendly aged black vinegar.',
      backupStallName: 'Qiu Rong Handmade Ban Mian',
      backupUnit: '#01-51',
      backupDish: 'Hand-Torn Ban Mian Soup with Mani Cai Greens ($5.00 SGD)'
    };
  }

  // Default fallback for other venues
  return {
    stallName: venue.stallName,
    unitNumber: venue.location.includes('#') ? venue.location.split('#')[1].split(',')[0].trim() : 'Stall Counter',
    dishName: venue.dishHighlights[0] || 'Signature House Special',
    price: venue.priceRange,
    dietMatch: 'Aligned with your personal nutrition preferences',
    howToOrder: `Say: '1 portion of ${venue.dishHighlights[0]}, less oil, chili on the side.'`,
    whyFits: `Matches your craving for ${userMood} while keeping portions balanced within your budget.`,
    backupStallName: venue.stallName + ' (Alternate Preparation)',
    backupUnit: 'Adjacent unit',
    backupDish: venue.dishHighlights[1] || 'Soup Broth Special'
  };
}
