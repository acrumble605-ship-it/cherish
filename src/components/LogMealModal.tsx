import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Star, 
  Flame,
  BookmarkCheck,
  Send
} from 'lucide-react';
import { JournalEntry, FoodOption } from '../types';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: JournalEntry) => void;
  initialOption?: FoodOption | null;
  calorieEstimate?: string;
}

const AVAILABLE_STICKERS = [
  '🇸🇬 Shiok!',
  '🔥 Wok Hei 10/10',
  '🥗 Clean & Lean',
  '🏆 Hawker Legend',
  '😋 Sedap Giler',
  '🤤 Cheat Meal',
  '💸 Value King',
  '✨ Cherish Pick'
];

export const LogMealModal: React.FC<LogMealModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  initialOption,
  calorieEstimate = '~420 kcal'
}) => {
  const [dishName, setDishName] = useState(
    initialOption?.dishHighlights?.[0] || initialOption?.stallName || 'Hawker Feast'
  );
  const [stallName, setStallName] = useState(initialOption?.stallName || 'Local Hawker');
  const [hawkerCentre, setHawkerCentre] = useState(initialOption?.hawkerCentre || 'Hawker Centre');
  const [price, setPrice] = useState(initialOption?.priceRange || '$6.00');
  const [calories, setCalories] = useState(calorieEstimate || '~420 kcal');
  const [rating, setRating] = useState<number>(5);
  const [note, setNote] = useState('Super fragrant and hit the spot! 💯');
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['🇸🇬 Shiok!', '✨ Cherish Pick']);
  const [frameStyle, setFrameStyle] = useState<'polaroid' | 'gold' | 'neon' | 'clean'>('polaroid');
  const [spiceLevel, setSpiceLevel] = useState<'Mild 🌶️' | 'Medium 🌶️🌶️' | 'Extra Shiok 🌶️🌶️🌶️' | 'Non-Spicy 🥗'>('Medium 🌶️🌶️');

  // Photo state: dish image or custom upload
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialOption?.imageUrl || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
  );
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Sync state when opened with a new option
  useEffect(() => {
    if (isOpen && initialOption) {
      setDishName(initialOption.dishHighlights?.[0] || initialOption.stallName || 'Hawker Feast');
      setStallName(initialOption.stallName || 'Local Hawker');
      setHawkerCentre(initialOption.hawkerCentre || 'Hawker Centre');
      setPrice(initialOption.priceRange || '$6.00');
      setCalories(calorieEstimate || '~420 kcal');
      if (initialOption.imageUrl) {
        setPhotoUrl(initialOption.imageUrl);
      }
    }
  }, [isOpen, initialOption, calorieEstimate]);

  if (!isOpen) return null;

  // Handle image upload from phone camera or gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter(s => s !== sticker));
    } else {
      if (selectedStickers.length < 5) {
        setSelectedStickers([...selectedStickers, sticker]);
      }
    }
  };

  const handleCopyCaption = () => {
    const caption = `🍜 Hawker Hit: ${dishName} at ${stallName} (${hawkerCentre})!\n${'⭐'.repeat(rating)} | ${price} | ${calories}\n${selectedStickers.join(' ')}\n"${note}"\n\nDecided with @CherishSG ✨ #SingaporeHawker #HawkerFoodie #Shiok`;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Generate canvas image for Instagram / Story share
  const generateCanvasBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350; // 4:5 Instagram Portrait
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Background
      ctx.fillStyle = frameStyle === 'polaroid' ? '#f8f6f0' : (frameStyle === 'gold' ? '#220817' : (frameStyle === 'neon' ? '#12020a' : '#1c0512'));
      ctx.fillRect(0, 0, 1080, 1350);

      // Gold border accent if gold frame
      if (frameStyle === 'gold') {
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 1020, 1290);
      } else if (frameStyle === 'neon') {
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 1020, 1290);
      }

      // Draw image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw photo centered in upper 70%
        const imgX = 60;
        const imgY = 60;
        const imgW = 960;
        const imgH = 800;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        // Dark overlay gradient at bottom of photo for text legibility
        const grad = ctx.createLinearGradient(imgX, imgY + imgH - 140, imgX, imgY + imgH);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(imgX, imgY + imgH - 140, imgW, 140);

        // Stall & Price on photo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`📍 ${stallName}`, imgX + 30, imgY + imgH - 50);

        ctx.fillStyle = '#c5a059';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(price, imgX + imgW - 160, imgY + imgH - 50);

        // Stickers stamp on photo
        let stickerX = imgX + 30;
        selectedStickers.forEach((st) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.roundRect(stickerX, imgY + 30, 220, 52, 26);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(st, stickerX + 16, imgY + 66);
          stickerX += 240;
        });

        // Bottom text section
        const textColor = frameStyle === 'polaroid' ? '#1a050d' : '#f5f2ed';
        ctx.fillStyle = textColor;
        ctx.font = 'italic 52px serif';
        ctx.fillText(dishName, 70, 930);

        // Stars
        ctx.fillStyle = '#f59e0b';
        ctx.font = '36px sans-serif';
        ctx.fillText('★'.repeat(rating) + '☆'.repeat(5 - rating), 70, 990);

        // Note
        ctx.fillStyle = frameStyle === 'polaroid' ? '#444' : '#d4cece';
        ctx.font = 'italic 34px sans-serif';
        ctx.fillText(`"${note}"`, 70, 1060);

        // Meta info
        ctx.fillStyle = '#c5a059';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`⚖️ ${calories}  •  ${spiceLevel}  •  ${hawkerCentre}`, 70, 1140);

        // Branding
        ctx.fillStyle = textColor;
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('Cherish • Singapore Hawker Journal 🇸🇬', 70, 1260);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.src = photoUrl;
    });
  };

  const handleDownloadImage = async () => {
    try {
      const blob = await generateCanvasBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cherish-${dishName.toLowerCase().replace(/\s+/g, '-')}-story.png`;
        a.click();
        URL.revokeObjectURL(url);
        handleCopyCaption();
      }
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleShareStory = async () => {
    try {
      const blob = await generateCanvasBlob();
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'hawker-meal.png', { type: 'image/png' })] })) {
        const file = new File([blob], `cherish-${dishName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        await navigator.share({
          title: `Hawker Story: ${dishName}`,
          text: `Ate ${dishName} at ${stallName}! ${selectedStickers.join(' ')} ✨ #SingaporeHawker #CherishSG`,
          files: [file]
        });
      } else {
        // Fallback: download the image and copy caption for direct posting
        await handleDownloadImage();
      }
    } catch (e) {
      console.log('Share dismissed or handled via copy', e);
      handleCopyCaption();
    }
  };

  const handleSave = () => {
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      dishName,
      stallName,
      hawkerCentre,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateIso: new Date().toISOString(),
      photoUrl,
      stickers: selectedStickers,
      rating,
      price,
      calories,
      note,
      spiceLevel,
      frameStyle,
      source: 'solo'
    };

    onSaveEntry(entry);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto" id="log-meal-modal">
      <div className="w-full max-w-2xl my-auto rounded-3xl bg-[#16040d] border border-[#c5a059]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)] glow p-4 sm:p-6 space-y-4 max-h-[94vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 shrink-0 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📸</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-medium">Food Journal</div>
              <h3 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed] leading-tight">
                Log Meal &amp; Decorate Card
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#f5f2ed] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Two Column on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 flex-1">
          
          {/* Column 1: Live Interactive Social Story Card */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-[#c5a059] font-medium flex items-center justify-between">
              <span>🖼️ Social Story Preview</span>
              <span className="text-[10px] text-[#8ce2ad] font-semibold">Ready for Insta</span>
            </div>

            {/* Social Post Card */}
            <div 
              ref={cardPreviewRef}
              id="social-story-card"
              className={`relative rounded-2xl overflow-hidden transition-all shadow-2xl ${
                frameStyle === 'polaroid' 
                  ? 'bg-[#f5f2ed] text-[#1a050d] p-3 pb-5 border-4 border-white shadow-2xl'
                  : frameStyle === 'gold'
                  ? 'bg-[#2a0b1c] text-[#f5f2ed] p-3 border-2 border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.35)]'
                  : frameStyle === 'neon'
                  ? 'bg-[#1b030d] text-[#f5f2ed] p-3 border-2 border-[#ea580c] shadow-[0_0_30px_rgba(234,88,12,0.45)]'
                  : 'bg-[#250717] text-[#f5f2ed] p-3 border border-white/20 shadow-xl'
              }`}
            >
              {/* Photo Container */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 shadow-inner">
                <img 
                  src={photoUrl} 
                  alt={dishName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlaid Active Stickers */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[85%] z-10">
                  {selectedStickers.map((s, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-xl backdrop-blur-md bg-black/85 text-white border border-white/30 animate-fadeIn"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Overlaid Location Badge */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="truncate font-semibold">📍 {stallName}</span>
                  <span className="shrink-0 text-[#c5a059] font-bold">{price}</span>
                </div>
              </div>

              {/* Card Bottom Meta (Polaroid caption style) */}
              <div className={`pt-3 space-y-1.5 ${frameStyle === 'polaroid' ? 'text-[#1a050d]' : 'text-[#f5f2ed]'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-lux text-base sm:text-lg font-bold italic truncate leading-snug">
                    {dishName}
                  </h4>
                  <div className="flex text-amber-500 text-xs">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </div>
                </div>

                <p className={`text-xs italic truncate ${frameStyle === 'polaroid' ? 'text-[#1a050d]/90 font-medium' : 'text-[#f5f2ed]/90'}`}>
                  &ldquo;{note}&rdquo;
                </p>

                <div className={`flex items-center justify-between text-[10px] uppercase tracking-wider pt-1.5 border-t ${
                  frameStyle === 'polaroid' ? 'border-[#1a050d]/20 text-[#1a050d]/70' : 'border-white/15 text-[#f5f2ed]/70'
                }`}>
                  <span className="font-medium">⚖️ {calories} &bull; {spiceLevel}</span>
                  <span className="font-bold text-[#c5a059]">Cherish SG</span>
                </div>
              </div>
            </div>

            {/* Quick Card Action Buttons */}
            <div className="flex items-center gap-2 pt-1 font-sans">
              <button
                onClick={handleShareStory}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-black" />
                <span>Post to Insta / Story 📲</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="py-2.5 px-3 rounded-xl bg-[#250717] hover:bg-[#320a20] border border-white/20 text-xs text-[#f5f2ed] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Download image"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Save</span>
              </button>

              <button
                onClick={handleCopyCaption}
                className="py-2.5 px-3 rounded-xl bg-[#250717] hover:bg-[#320a20] border border-white/20 text-xs text-[#f5f2ed] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Copy caption"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-[#8ce2ad]" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                <span>{copiedCaption ? 'Copied' : 'Caption'}</span>
              </button>
            </div>
          </div>

          {/* Column 2: Photo Pick & Decoration Controls */}
          <div className="space-y-3.5 font-sans">
            
            {/* Photo Selection: Open Camera vs Photo Gallery */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                1. Food Photo (Camera / Gallery)
              </label>

              {/* Camera Input */}
              <input 
                type="file" 
                ref={cameraInputRef} 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleFileUpload}
              />
              {/* Photo Gallery Input */}
              <input 
                type="file" 
                ref={galleryInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-2 rounded-xl bg-[#250717] hover:bg-[#350a22] border border-white/20 text-[11px] text-[#f5f2ed] font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[#c5a059]" />
                  <span>📷 Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2.5 px-2 rounded-xl bg-[#250717] hover:bg-[#350a22] border border-white/20 text-[11px] text-[#f5f2ed] font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                  <span>🖼️ Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (initialOption?.imageUrl) {
                      setPhotoUrl(initialOption.imageUrl);
                    }
                  }}
                  className="py-2.5 px-2 rounded-xl bg-[#250717] hover:bg-[#350a22] border border-white/20 text-[11px] text-[#f5f2ed] font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>🍜 Stall Pic</span>
                </button>
              </div>
            </div>

            {/* Frame Theme */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                2. Frame Theme
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'polaroid', label: 'Polaroid 📷' },
                  { id: 'gold', label: 'Gold Luxe ✨' },
                  { id: 'neon', label: 'Hawker 🔥' },
                  { id: 'clean', label: 'Clean 🌿' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrameStyle(f.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] border transition-all cursor-pointer font-medium ${
                      frameStyle === f.id
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-md'
                        : 'bg-[#250717] border-white/15 text-[#f5f2ed]/80 hover:bg-[#320a20]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tap-to-add Stickers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                  3. Add Stickers (Max 5)
                </label>
                <span className="text-[10px] text-[#f5f2ed]/60 font-semibold">{selectedStickers.length}/5</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🇸🇬 Shiok Ah!',
                  '🔥 Wok Hei 10/10',
                  '🏆 Hawker Legend',
                  '🤤 Food Coma Ahead',
                  '🥗 Clean & Lean',
                  '👴 Uncle Approved',
                  '⭐ Michelin Bib Vibe',
                  '💯 10/10 Must Try',
                  '⚡ 3PM Slump-Proof',
                  '✨ Cherish Pick'
                ].map(s => {
                  const isSelected = selectedStickers.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSticker(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#c5a059] text-black font-bold border-[#c5a059] shadow-md'
                          : 'bg-[#250717] border-white/20 text-[#f5f2ed]/80 hover:border-[#c5a059] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Rating & Spice */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                  Rating
                </label>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                  Spice Level
                </label>
                <select
                  value={spiceLevel}
                  onChange={(e) => setSpiceLevel(e.target.value as any)}
                  className="w-full bg-[#250717] border border-white/20 text-[#f5f2ed] text-xs rounded-xl px-2.5 py-1.5 font-sans focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Non-Spicy 🥗">Non-Spicy 🥗</option>
                  <option value="Mild 🌶️">Mild 🌶️</option>
                  <option value="Medium 🌶️🌶️">Medium 🌶️🌶️</option>
                  <option value="Extra Shiok 🌶️🌶️🌶️">Extra Shiok 🌶️🌶️🌶️</option>
                </select>
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] font-medium">
                Short Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Crispy, fragrant, wok hei master..."
                className="w-full bg-[#250717] border border-white/20 px-3 py-2 rounded-xl text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/40 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer: Save Button */}
        <div className="pt-2 border-t border-white/15 shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/15 text-xs text-[#f5f2ed]/70 hover:text-[#f5f2ed] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex-1 py-3 px-5 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black font-semibold text-xs uppercase tracking-wider glow shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Logged to Journal! 🎉</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4 text-black" />
                <span>Save to Food Journal 📖</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
