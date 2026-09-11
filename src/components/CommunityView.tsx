import React, { useState } from 'react';
import { 
  CommunityPost, 
  UserProfile, 
  FoodOption 
} from '../types';
import { 
  ThumbsUp, 
  BookmarkCheck, 
  MapPin, 
  PlusCircle, 
  X, 
  Filter, 
  Check, 
  Flame, 
  AlertTriangle, 
  Coffee, 
  UtensilsCrossed, 
  Store, 
  Footprints, 
  Search,
  ExternalLink
} from 'lucide-react';

interface CommunityViewProps {
  userProfile: UserProfile;
  onBankCraving?: (option: FoodOption) => void;
  bankedIds?: string[];
}

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Sarah K.',
    authorHandle: '@sarah_eats_sg',
    authorAvatar: '👩🏻‍💻',
    dishName: 'Grilled Miso Salmon Grain Bowl',
    placeName: 'Common Man Stan',
    locationArea: 'Stanley St, Telok Ayer',
    venueType: 'cafe',
    verdict: 'recommend',
    verdictTag: 'Hidden Gem 💎',
    rating: 5,
    price: '$26.00',
    walkMinutes: 11,
    honestReview: 'Actually legitimate salmon with crispy skin and balanced miso glaze. Quinoa and avocado are fresh, not soggy. Coffee is 10/10.',
    proHighlight: 'Rich omega-3s & top-tier single-origin coffee',
    conHighlight: 'Seats fill up by 12:15 PM, walk in at 11:45 AM',
    timestamp: '2 hours ago',
    agreeCount: 42,
    photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'post-2',
    authorName: 'Darren Teo',
    authorHandle: '@darren_foodie',
    authorAvatar: '👨🏻‍🍳',
    dishName: 'Mixed Satay Platter (15 Sticks)',
    placeName: 'Tourist Satay Street (Lau Pa Sat)',
    locationArea: 'Boon Tat Street, CBD',
    venueType: 'hawker',
    verdict: 'avoid',
    verdictTag: 'Skip the Hype 🚫',
    rating: 2,
    price: '$28.00',
    walkMinutes: 14,
    honestReview: 'Over-charred and dry chicken. Peanut sauce is way too sugary with zero spice depth. Aggressive touting. Save your money and go to Amoy or Maxwell.',
    proHighlight: 'Breezy open-air atmosphere at night',
    conHighlight: 'Heavily overpriced tourist trap, poor meat quality',
    timestamp: '5 hours ago',
    agreeCount: 89,
    photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'post-3',
    authorName: 'Mei Ling',
    authorHandle: '@meiling_cbdeats',
    authorAvatar: '👩🏻',
    dishName: 'Smoked Duck & Shitake Dumplings',
    placeName: 'Dumpling Darlings',
    locationArea: '44 Amoy St, CBD',
    venueType: 'restaurant',
    verdict: 'recommend',
    verdictTag: 'Must Visit 🔥',
    rating: 5,
    price: '$22.00',
    walkMinutes: 10,
    honestReview: 'Thin, handmade wrappers that pack crazy smokiness without grease. Pair with their Sichuan spiced egg noodles for complete satisfaction.',
    proHighlight: 'Incredible handmade dough & rich duck umami',
    conHighlight: 'Small cozy space, 15 min wait if you walk in late',
    timestamp: 'Yesterday',
    agreeCount: 65,
    photoUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'post-4',
    authorName: 'Marcus Lim',
    authorHandle: '@marcus_sg',
    authorAvatar: '🏃‍♂️',
    dishName: 'Sliced Batang Mackerel Fish Soup',
    placeName: 'Han Kee Fish Soup (Amoy)',
    locationArea: 'Amoy St Food Centre, #02-129',
    venueType: 'hawker',
    verdict: 'recommend',
    verdictTag: 'Michelin Standard 💎',
    rating: 5,
    price: '$7.00',
    walkMinutes: 12,
    honestReview: 'The real deal. Slices of mackerel are thick as steaks, naturally sweet broth with boiled coriander and bittergourd. Zero fishiness.',
    proHighlight: 'Cleanest protein fuel in CBD under $8',
    conHighlight: 'Long queue (30 mins at 12:30), go at 10:45 AM or 1:45 PM',
    timestamp: 'Yesterday',
    agreeCount: 114,
    photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'post-5',
    authorName: 'Chloe Tan',
    authorHandle: '@chloe_tastes',
    authorAvatar: '☕',
    dishName: 'Iced Ceremonial Matcha & Croffle',
    placeName: 'Trendy Aesthetic Shophouse Cafe',
    locationArea: 'Telok Ayer Street',
    venueType: 'cafe',
    verdict: 'avoid',
    verdictTag: 'Overrated & Pricey ❌',
    rating: 2,
    price: '$19.50',
    walkMinutes: 13,
    honestReview: 'Built solely for Instagram photos. Matcha tasted like sweetened milk powder, and the croffle was lukewarm and dense. Not worth $20.',
    proHighlight: 'Pretty neon interior and good lighting for photos',
    conHighlight: 'Subpar drinks, expensive service charge for self-pickup',
    timestamp: '2 days ago',
    agreeCount: 76,
    photoUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'post-6',
    authorName: 'Uncle Raymond',
    authorHandle: '@taxi_uncle_food',
    authorAvatar: '🚖',
    dishName: 'Traditional Mee Pok Dry (Vinegar)',
    placeName: 'Hill Street Tai Hwa Pork Noodle',
    locationArea: '466 Crawford Lane',
    venueType: 'hawker',
    verdict: 'recommend',
    verdictTag: 'Legendary Pick 🔥',
    rating: 5,
    price: '$8.00',
    walkMinutes: 15,
    honestReview: 'That aged black vinegar and crispy sole fish crusting cannot be imitated. Tender pork liver cooked to absolute pink perfection.',
    proHighlight: 'Authentic 1-Star Michelin flavor that stays consistent',
    conHighlight: 'Queue is always minimum 35 minutes rain or shine',
    timestamp: '3 days ago',
    agreeCount: 152,
    photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&auto=format&fit=crop&q=80'
  }
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  userProfile,
  onBankCraving,
  bankedIds = []
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('cherish_community_posts_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_COMMUNITY_POSTS;
      }
    }
    return INITIAL_COMMUNITY_POSTS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'recommend' | 'avoid' | 'cafe' | 'hawker' | 'walkable'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // New Post Form State
  const [newDish, setNewDish] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newVenueType, setNewVenueType] = useState<'cafe' | 'hawker' | 'restaurant'>('cafe');
  const [newVerdict, setNewVerdict] = useState<'recommend' | 'avoid'>('recommend');
  const [newPrice, setNewPrice] = useState('');
  const [newReview, setNewReview] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const handleAgreeToggle = (postId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const isAgreed = !p.userAgreed;
          return {
            ...p,
            userAgreed: isAgreed,
            agreeCount: isAgreed ? p.agreeCount + 1 : p.agreeCount - 1
          };
        }
        return p;
      });
      localStorage.setItem('cherish_community_posts_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.trim() || !newPlace.trim() || !newReview.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: 'You (Local Foodie)',
      authorHandle: '@you_eats',
      authorAvatar: '🙋‍♂️',
      dishName: newDish.trim(),
      placeName: newPlace.trim(),
      locationArea: newArea.trim() || 'Central Singapore',
      venueType: newVenueType,
      verdict: newVerdict,
      verdictTag: newVerdict === 'recommend' ? 'Honest Gem 💎' : 'Place to Avoid 🚫',
      rating: newVerdict === 'recommend' ? 5 : 2,
      price: newPrice.trim() || (newVenueType === 'cafe' ? '$18.00' : '$6.50'),
      walkMinutes: 12,
      honestReview: newReview.trim(),
      proHighlight: newPro.trim() || (newVerdict === 'recommend' ? 'Authentic taste & freshness' : 'Good location only'),
      conHighlight: newCon.trim() || (newVerdict === 'recommend' ? 'Expect peak lunch queue' : 'Not worth the money'),
      timestamp: 'Just now',
      agreeCount: 1,
      userAgreed: true,
      photoUrl: newVenueType === 'cafe' 
        ? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=700&auto=format&fit=crop&q=80'
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('cherish_community_posts_v1', JSON.stringify(updated));

    // Reset Form
    setNewDish('');
    setNewPlace('');
    setNewArea('');
    setNewReview('');
    setNewPro('');
    setNewCon('');
    setNewPrice('');
    setIsShareModalOpen(false);
  };

  // Filter & Search Logic
  const filteredPosts = posts.filter(post => {
    // 1. Tag filter
    if (activeFilter === 'recommend' && post.verdict !== 'recommend') return false;
    if (activeFilter === 'avoid' && post.verdict !== 'avoid') return false;
    if (activeFilter === 'cafe' && post.venueType !== 'cafe') return false;
    if (activeFilter === 'hawker' && post.venueType !== 'hawker') return false;
    if (activeFilter === 'walkable' && (post.walkMinutes || 15) > 20) return false;

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.dishName.toLowerCase().includes(q) ||
        post.placeName.toLowerCase().includes(q) ||
        post.locationArea.toLowerCase().includes(q) ||
        post.honestReview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4 font-sans space-y-4" id="community-feed-section">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#2a0618] to-[#1a0410] border border-[#c5a059]/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed]">
              Honest Bites Feed 🗣️
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#edd49a] font-medium">
              Real Opinions
            </span>
          </div>
          <p className="text-xs text-[#f5f2ed]/70 mt-0.5">
            What Singaporeans genuinely recommend & places to avoid.
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(197,160,89,0.4)] hover:shadow-[0_0_20px_rgba(197,160,89,0.6)] cursor-pointer active:scale-98 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          <span>Post Review</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'recommend', label: '🟢 Must Visit' },
          { id: 'avoid', label: '🔴 Places to Avoid' },
          { id: 'cafe', label: '☕ Cafes' },
          { id: 'hawker', label: '🍜 Hawkers' },
          { id: 'walkable', label: '🚶 <20m Walk' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap border text-xs font-medium transition-all cursor-pointer ${
              activeFilter === filter.id
                ? 'bg-[#3b0b23] border-[#c5a059] text-white shadow-sm'
                : 'bg-white/5 border-white/10 text-[#f5f2ed]/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by stall, cafe, dish, or area..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e0514] border border-white/10 text-xs text-[#f5f2ed] placeholder:text-[#f5f2ed]/40 focus:outline-none focus:border-[#c5a059]/60"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f2ed]/40 hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1e0413] border border-white/10 space-y-2">
            <p className="text-sm text-[#f5f2ed]/70">No reviews found matching your filter.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="text-xs text-[#c5a059] underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isAvoid = post.verdict === 'avoid';
            return (
              <div
                key={post.id}
                className={`p-4 rounded-2xl border transition-all text-left space-y-3 ${
                  isAvoid
                    ? 'bg-[#220713] border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-[#1e0514] border-[#c5a059]/35 hover:border-[#c5a059]/60'
                }`}
              >
                {/* Author & Verdict Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1 rounded-lg bg-black/20">{post.authorAvatar}</span>
                    <div>
                      <div className="text-xs font-semibold text-[#f5f2ed]">{post.authorName}</div>
                      <div className="text-[10px] text-[#f5f2ed]/50">{post.authorHandle} &bull; {post.timestamp}</div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                    isAvoid 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isAvoid ? '🔴 AVOID' : '🟢 RECOMMEND'}
                  </span>
                </div>

                {/* Dish & Place Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {post.dishName}
                      </h3>
                      <div className="text-xs text-[#edd49a] font-medium flex items-center gap-1.5 mt-0.5">
                        {post.venueType === 'cafe' ? <Coffee className="w-3.5 h-3.5" /> : <UtensilsCrossed className="w-3.5 h-3.5" />}
                        <span>{post.placeName}</span>
                        <span className="text-white/30">&bull;</span>
                        <span className="text-white/70">{post.locationArea}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-white block">{post.price}</span>
                      {post.walkMinutes && (
                        <span className="text-[10px] text-[#8ce2ad] font-medium flex items-center justify-end gap-0.5 mt-0.5">
                          <Footprints className="w-2.5 h-2.5" />
                          {post.walkMinutes}m walk
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Paragraph */}
                <p className="text-xs text-[#f5f2ed]/90 leading-relaxed italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                  &ldquo;{post.honestReview}&rdquo;
                </p>

                {/* Honest Pro & Con Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200">
                    <span className="font-semibold block text-emerald-400">👍 What’s Great:</span>
                    {post.proHighlight}
                  </div>
                  <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-200">
                    <span className="font-semibold block text-rose-400">⚠️ Honest Catch:</span>
                    {post.conHighlight}
                  </div>
                </div>

                {/* Interaction Footer: Agree button & Bank craving */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <button
                    onClick={() => handleAgreeToggle(post.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      post.userAgreed
                        ? 'bg-[#c5a059] text-black font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-[#f5f2ed]/70 hover:text-white border border-white/10'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${post.userAgreed ? 'text-black fill-black' : ''}`} />
                    <span>Helpful / Agree ({post.agreeCount})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${post.placeName} ${post.locationArea} Singapore`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#c5a059] hover:underline cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Directions</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    {onBankCraving && (
                      <button
                        onClick={() => {
                          onBankCraving({
                            id: post.id,
                            stallName: post.placeName,
                            hawkerCentre: post.locationArea,
                            location: post.locationArea,
                            neighborhood: post.locationArea,
                            cuisine: post.dishName,
                            dishHighlights: [post.dishName],
                            priceRange: post.price,
                            healthScore: post.proHighlight,
                            walkTimeMinutes: post.walkMinutes || 12,
                            tags: [post.venueType, post.verdict],
                            venueType: post.venueType
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-[#edd49a] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                        title="Save to Banked Cravings"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Bank Craving</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* SHARE REVIEW MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#1a0510] border border-[#c5a059]/60 rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="font-serif-lux text-xl font-light italic text-[#f5f2ed]">
                  Share Honest Verdict
                </h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              {/* Recommendation vs Avoid toggle */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059] block mb-1">
                  Your Overall Verdict
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVerdict('recommend')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      newVerdict === 'recommend'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>🟢 Recommend (Must Try)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVerdict('avoid')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      newVerdict === 'avoid'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>🔴 Avoid (Overrated / Skip)</span>
                  </button>
                </div>
              </div>

              {/* Venue Type */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059] block mb-1">
                  Venue Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cafe', label: 'Cafe ☕' },
                    { id: 'hawker', label: 'Hawker 🍜' },
                    { id: 'restaurant', label: 'Restaurant 🍽️' }
                  ].map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setNewVenueType(v.id as any)}
                      className={`py-2 px-2.5 rounded-xl border font-medium cursor-pointer ${
                        newVenueType === v.id
                          ? 'bg-[#3b0b23] text-[#f5f2ed] border-[#c5a059]'
                          : 'bg-white/5 text-white/60 border-white/10'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Name & Stall Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/70 block mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={newDish}
                    onChange={e => setNewDish(e.target.value)}
                    placeholder="e.g. Tonkatsu Sando, Ban Mian"
                    className="w-full p-2.5 rounded-xl bg-[#220716] border border-white/10 text-white placeholder:text-white/30 focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/70 block mb-1">Stall or Place Name *</label>
                  <input
                    type="text"
                    required
                    value={newPlace}
                    onChange={e => setNewPlace(e.target.value)}
                    placeholder="e.g. Baristart Coffee, Han Kee"
                    className="w-full p-2.5 rounded-xl bg-[#220716] border border-white/10 text-white placeholder:text-white/30 focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Area & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/70 block mb-1">Location / Area</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    placeholder="e.g. Tras St, Tanjong Pagar"
                    className="w-full p-2.5 rounded-xl bg-[#220716] border border-white/10 text-white placeholder:text-white/30 focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/70 block mb-1">Price (SGD)</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="e.g. $7.50 or $24.00"
                    className="w-full p-2.5 rounded-xl bg-[#220716] border border-white/10 text-white placeholder:text-white/30 focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Honest Review */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/70 block mb-1">Honest Review * (Short & Punchy)</label>
                <textarea
                  required
                  rows={3}
                  value={newReview}
                  onChange={e => setNewReview(e.target.value)}
                  placeholder="Tell it like it is: flavor, texture, portion, whether it lives up to the hype..."
                  className="w-full p-2.5 rounded-xl bg-[#220716] border border-white/10 text-white placeholder:text-white/30 focus:border-[#c5a059]"
                />
              </div>

              {/* Pro & Con */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">What&apos;s Great</label>
                  <input
                    type="text"
                    value={newPro}
                    onChange={e => setNewPro(e.target.value)}
                    placeholder="e.g. Flaky crust, rich broth"
                    className="w-full p-2 rounded-xl bg-[#220716] border border-emerald-500/30 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-rose-400 block mb-1">The Catch / Flaw</label>
                  <input
                    type="text"
                    value={newCon}
                    onChange={e => setNewCon(e.target.value)}
                    placeholder="e.g. 25 min queue, pricey drinks"
                    className="w-full p-2 rounded-xl bg-[#220716] border border-rose-500/30 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-bold shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  Publish Honest Review
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
