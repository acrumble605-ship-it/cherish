import { FoodOption } from '../types';
import slicedFishSoupImg from '../assets/images/sliced_fish_soup_1788688588651.jpg';
import laksaImg from '../assets/images/sungei_road_laksa_1788688609028.jpg';
import chickenRiceImg from '../assets/images/chicken_rice_1788688625731.jpg';
import thunderTeaRiceImg from '../assets/images/thunder_tea_rice_1788688650028.jpg';
import charKwayTeowImg from '../assets/images/char_kway_teow_1788688671789.jpg';
import taiHwaBcmImg from '../assets/images/tai_hwa_bcm_1788689271100.jpg';
import friedCarrotCakeImg from '../assets/images/fried_carrot_cake_1788689289727.jpg';
import lorMeeImg from '../assets/images/lor_mee_1788689304511.jpg';
import bakKutTehImg from '../assets/images/bak_kut_teh_1788689336440.jpg';
import cantoneseCongeeImg from '../assets/images/cantonese_congee_1788689352599.jpg';
import nonyaPopiahImg from '../assets/images/nonya_popiah_1788689373317.jpg';
import nasiPadangImg from '../assets/images/nasi_padang_rendang_1788689391756.jpg';
import herbalBlackChickenImg from '../assets/images/herbal_black_chicken_1788689408404.jpg';
import yongTauFooImg from '../assets/images/yong_tau_foo_1788689432187.jpg';
import banMianSoupImg from '../assets/images/ban_mian_soup_1788689445626.jpg';
import soyaChickenImg from '../assets/images/soya_chicken_1788689467056.jpg';
import singaporeRamenImg from '../assets/images/singapore_ramen_1788689483053.jpg';

export function getGoogleMapsUrl(option: FoodOption): string {
  if (option.googleMapsUrl) return option.googleMapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${option.stallName}, ${option.hawkerCentre}, Singapore`)}`;
}

export const SINGAPORE_HAWKER_DATABASE: FoodOption[] = [
  {
    id: 'amoy-han-kee',
    stallName: 'Han Kee Fish Soup',
    hawkerCentre: 'Amoy Street Food Centre',
    location: 'Amoy Street Food Centre, #02-129, 7 Maxwell Rd',
    neighborhood: 'Tanjong Pagar / CBD',
    cuisine: 'Teochew Fish Broth',
    dishHighlights: ['Sliced Mackerel Fish Soup', 'Clear Bittergourd Broth', 'Brown Rice Add-on'],
    priceRange: '$7.00 - $9.00',
    healthScore: 'Pure Clean Protein • Zero Added Oil',
    walkTimeMinutes: 4,
    tags: ['light', 'comfort', 'seafood', 'clean', 'protein', 'fish soup', 'soup'],
    imageUrl: slicedFishSoupImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Han+Kee+Fish+Soup+Amoy+Street+Food+Centre+Singapore'
  },
  {
    id: 'maxwell-zhen-zhen',
    stallName: 'Zhen Zhen Porridge',
    hawkerCentre: 'Maxwell Food Centre',
    location: 'Maxwell Food Centre, #01-54, 1 Kadayanallur St',
    neighborhood: 'Chinatown / Telok Ayer',
    cuisine: 'Traditional Cantonese Porridge',
    dishHighlights: ['Sliced Fish & Century Egg Congee', 'Shredded Chicken Congee with Ginger'],
    priceRange: '$4.50 - $6.00',
    healthScore: 'Slow-Cooked Soothing Grain & Lean Protein',
    walkTimeMinutes: 7,
    tags: ['comfort', 'light', 'porridge', 'soothing', 'ginger', 'chicken'],
    imageUrl: cantoneseCongeeImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zhen+Zhen+Porridge+Maxwell+Food+Centre+Singapore'
  },
  {
    id: 'amoy-thunder-tea',
    stallName: 'Traditional Hakka Lui Cha',
    hawkerCentre: 'Amoy Street Food Centre',
    location: 'Amoy Street Food Centre, #01-31, 7 Maxwell Rd',
    neighborhood: 'Tanjong Pagar / CBD',
    cuisine: 'Hakka Thunder Tea Rice',
    dishHighlights: ['Brown Rice Lui Cha', 'Aromatic Mint & Basil Green Tea Broth', 'Tofu & Sayur Manis'],
    priceRange: '$5.50 - $6.50',
    healthScore: 'High Dietary Fiber • Antioxidant Super-bowl',
    walkTimeMinutes: 4,
    tags: ['light', 'something_new', 'vegetarian', 'clean', 'greens', 'tea rice', 'thunder tea'],
    imageUrl: thunderTeaRiceImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Traditional+Hakka+Lui+Cha+Amoy+Street+Food+Centre+Singapore'
  },
  {
    id: 'hong-lim-sungei-road',
    stallName: 'Famous Sungei Road Trishaw Laksa',
    hawkerCentre: 'Hong Lim Market & Food Centre',
    location: 'Hong Lim Market & Food Centre, #02-66, 531A Upper Cross St',
    neighborhood: 'Chinatown / Hong Lim',
    cuisine: 'Fragrant Nyonya Laksa',
    dishHighlights: ['Light Broth Laksa with Fresh Cockles', 'Fragrant Dried Shrimp & Lemongrass Gravy'],
    priceRange: '$6.00 - $8.00',
    healthScore: 'Balanced Light-Coconut Spiced Broth',
    walkTimeMinutes: 9,
    tags: ['spicy', 'comfort', 'laksa', 'noodles', 'treat', 'seafood'],
    imageUrl: laksaImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Famous+Sungei+Road+Trishaw+Laksa+Hong+Lim+Market+Food+Centre+Singapore'
  },
  {
    id: 'tanjong-pagar-yummy-salad',
    stallName: 'Seng Kee Herbal Black Chicken & Soup',
    hawkerCentre: 'Tanjong Pagar Plaza Market',
    location: 'Tanjong Pagar Plaza, #02-18, 6 Tanjong Pagar Plaza',
    neighborhood: 'Tanjong Pagar',
    cuisine: 'Slow Herbal Double-Boiled Soups',
    dishHighlights: ['Double-Boiled Herbal Black Chicken Soup', 'Goji Berries & Angelica Root Broth', 'Steamed Pumpkin Rice'],
    priceRange: '$6.50 - $8.50',
    healthScore: 'TCM Restorative • Low Sodium Hydration',
    walkTimeMinutes: 5,
    tags: ['comfort', 'light', 'soup', 'herbal', 'pork ribs', 'chicken'],
    imageUrl: herbalBlackChickenImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Seng+Kee+Tanjong+Pagar+Plaza+Market+Singapore'
  },
  {
    id: 'lau-pa-sat-thunder-greens',
    stallName: 'Koo Kee Yong Tow Foo Noodles',
    hawkerCentre: 'Lau Pa Sat Hawker Pavilion',
    location: 'Lau Pa Sat, Stall #18, 18 Raffles Quay',
    neighborhood: 'Downtown / Marina Bay',
    cuisine: 'Custom Hakka Yong Tau Foo',
    dishHighlights: ['Fresh Bittergourd & Beancurd Skin in Soya Bean Broth', 'Clear Kang Kong Greens & Stuffed Tofu'],
    priceRange: '$6.00 - $7.50',
    healthScore: 'High Calcium • Fresh Boiled Greens & Soy',
    walkTimeMinutes: 8,
    tags: ['light', 'comfort', 'clean', 'yong tau foo', 'custom', 'tofu'],
    imageUrl: yongTauFooImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Koo+Kee+Yong+Tow+Foo+Lau+Pa+Sat+Singapore'
  },
  {
    id: 'amoy-a-noodle-story',
    stallName: 'A Noodle Story (Michelin Bib Gourmand)',
    hawkerCentre: 'Amoy Street Food Centre',
    location: 'Amoy Street Food Centre, #01-39, 7 Maxwell Rd',
    neighborhood: 'Tanjong Pagar / CBD',
    cuisine: 'Modern Singapore Ramen & Wonton',
    dishHighlights: ['Potato-Wrapped Crispy Prawn Ramen', 'Sous-vide Char Siew Springy Noodles', 'Molten Onsen Egg'],
    priceRange: '$9.00 - $11.00',
    healthScore: 'Elevated Culinary Craft • Umami Balanced',
    walkTimeMinutes: 4,
    tags: ['something_new', 'comfort', 'noodles', 'treat', 'ramen', 'wonton'],
    imageUrl: singaporeRamenImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=A+Noodle+Story+Amoy+Street+Food+Centre+Singapore'
  },
  {
    id: 'chinatown-michelin-soya',
    stallName: 'Liao Fan Hawker Chan',
    hawkerCentre: 'Chinatown Complex',
    location: 'Chinatown Complex, #02-126, 335 Smith St',
    neighborhood: 'Chinatown',
    cuisine: 'Signature Soya Sauce Chicken & Roasted Meats',
    dishHighlights: ['Glossy Caramelized Soya Sauce Chicken', 'Braised Master Stock Peanuts & Fragrant Rice'],
    priceRange: '$5.00 - $7.00',
    healthScore: 'Lean Poultry Breast • Moderate Glycemic',
    walkTimeMinutes: 10,
    tags: ['comfort', 'spicy', 'chicken', 'roast', 'rice', 'protein'],
    imageUrl: soyaChickenImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Liao+Fan+Hawker+Chan+Chinatown+Complex+Singapore'
  },
  {
    id: 'zion-riverside-carrot-cake',
    stallName: 'Zion Riverside Fried White & Black Carrot Cake',
    hawkerCentre: 'Zion Riverside Food Centre',
    location: 'Zion Riverside Food Centre, #01-26, 70 Zion Rd',
    neighborhood: 'River Valley / Havelock',
    cuisine: 'Crispy Chai Tow Kway (Carrot Cake)',
    dishHighlights: ['Crispy White Radish Cake with Egg & Chye Poh', 'Caramelized Sweet Black Molasses Radish Cake'],
    priceRange: '$4.50 - $6.50',
    healthScore: 'High Heat Wok Char • Preserved Radish Umami',
    walkTimeMinutes: 7,
    tags: ['comfort', 'something_new', 'carrot cake', 'chai tow kway', 'egg', 'crispy'],
    imageUrl: friedCarrotCakeImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zion+Riverside+Carrot+Cake+Singapore'
  },
  {
    id: 'old-airport-lor-mee',
    stallName: 'Xin Mei Xiang Zheng Zong Lor Mee',
    hawkerCentre: 'Old Airport Road Food Centre',
    location: 'Old Airport Road Food Centre, #01-116, 51 Old Airport Rd',
    neighborhood: 'Kallang / Geylang',
    cuisine: 'Five-Spice Braised Fish Noodles',
    dishHighlights: ['Flaked Deep-Fried Spanish Mackerel', 'Thick Starchy Five-Spice Gravy with Garlic & Vinegar'],
    priceRange: '$6.00 - $8.00',
    healthScore: 'Garlic Allicin Immunity • Deep Herbal Five-Spice',
    walkTimeMinutes: 14,
    tags: ['comfort', 'spicy', 'noodles', 'lor mee', 'garlic'],
    imageUrl: lorMeeImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Xin+Mei+Xiang+Zheng+Zong+Lor+Mee+Old+Airport+Road+Singapore'
  },
  {
    id: 'maxwell-tian-tian',
    stallName: 'Tian Tian Hainanese Chicken Rice',
    hawkerCentre: 'Maxwell Food Centre',
    location: 'Maxwell Food Centre, #01-10, 1 Kadayanallur St',
    neighborhood: 'Chinatown / Telok Ayer',
    cuisine: 'Hainanese Poached Chicken',
    dishHighlights: ['Fragrant Poached Chicken Rice', 'House-Chili & Ginger Dip', 'Steamed Crystal Chicken'],
    priceRange: '$5.50 - $8.00',
    healthScore: 'Clean Steamed Poultry • Fragrant Garlic Ginger',
    walkTimeMinutes: 7,
    tags: ['comfort', 'chicken', 'chicken rice', 'rice', 'maxwell'],
    imageUrl: chickenRiceImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tian+Tian+Hainanese+Chicken+Rice+Maxwell+Food+Centre+Singapore'
  },
  {
    id: 'outram-ya-hua-bkt',
    stallName: 'Outram Park Ya Hua Bak Kut Teh',
    hawkerCentre: 'Tanjong Pagar Complex',
    location: '7 Keppel Rd, #01-05/07 PSA Tanjong Pagar Complex',
    neighborhood: 'Tanjong Pagar / CBD',
    cuisine: 'Teochew Peppery Pork Rib Broth',
    dishHighlights: ['Prime Pork Ribs Peppery Broth', 'Whole Garlic Bulbs & Crispy Youtiao Fritters'],
    priceRange: '$8.50 - $12.00',
    healthScore: 'Restorative Peppery TCM Broth • Warming Circulation',
    walkTimeMinutes: 6,
    tags: ['comfort', 'spicy', 'soup', 'bak kut teh', 'bkt', 'pork ribs'],
    imageUrl: bakKutTehImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Outram+Park+Ya+Hua+Bak+Kut+Teh+Keppel+Road+Singapore'
  },
  {
    id: 'rochor-qiu-rong-ban-mian',
    stallName: 'Qiu Rong Handmade Ban Mian',
    hawkerCentre: 'Old Airport Road Food Centre',
    location: 'Old Airport Road Food Centre, #01-44, 51 Old Airport Rd',
    neighborhood: 'Kallang / Mountbatten',
    cuisine: 'Handmade Artisanal Noodle Broth',
    dishHighlights: ['Hand-Pulled Ban Mian Soup with Mani Cai & Minced Pork', 'Crispy Ikan Bilis & Poached Egg'],
    priceRange: '$4.50 - $6.50',
    healthScore: 'Freshly Rolled Unprocessed Wheat • Iron-Rich Mani Cai',
    walkTimeMinutes: 12,
    tags: ['comfort', 'light', 'noodles', 'ban mian', 'soup', 'egg'],
    imageUrl: banMianSoupImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Qiu+Rong+Handmade+Ban+Mian+Old+Airport+Road+Singapore'
  },
  {
    id: 'kampong-glam-nasi-pariaman',
    stallName: 'Warong Nasi Pariaman (Halal Heritage)',
    hawkerCentre: 'Kampong Glam Historic District',
    location: '738 North Bridge Rd, Kampong Glam',
    neighborhood: 'Bugis / Kampong Glam',
    cuisine: 'Heritage Halal Minang Nasi Padang',
    dishHighlights: ['Slow-Stewed Beef Rendang', 'Spiced Bergedil & Sayur Lodeh Coconut Gravy'],
    priceRange: '$6.50 - $9.50',
    healthScore: 'Turmeric Ginger Antioxidants • Slow-Braised Halal Protein',
    walkTimeMinutes: 10,
    tags: ['spicy', 'something_new', 'halal', 'nasi padang', 'rendang', 'rice', 'beef'],
    imageUrl: nasiPadangImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Warong+Nasi+Pariaman+North+Bridge+Rd+Singapore'
  },
  {
    id: 'crawford-tai-hwa-bcm',
    stallName: 'Hill Street Tai Hwa Pork Noodle (Michelin Star)',
    hawkerCentre: 'Crawford Lane Food Hub',
    location: '466 Crawford Ln, #01-12',
    neighborhood: 'Lavender / Bugis',
    cuisine: 'Traditional Teochew Bak Chor Mee',
    dishHighlights: ['Springy Mee Pok Tossed in Aged Black Vinegar & Chili', 'Tender Pork Liver & Sole Fish Crisps'],
    priceRange: '$7.00 - $10.00',
    healthScore: 'Fresh Lean Pork & Liver (High Iron) • Fermented Black Vinegar',
    walkTimeMinutes: 11,
    tags: ['comfort', 'spicy', 'something_new', 'noodles', 'bak chor mee', 'vinegar', 'pork'],
    imageUrl: taiHwaBcmImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hill+Street+Tai+Hwa+Pork+Noodle+Crawford+Lane+Singapore'
  },
  {
    id: 'chinatown-ann-chin-popiah',
    stallName: 'Ann Chin Handmade Popiah',
    hawkerCentre: 'Chinatown Complex',
    location: 'Chinatown Complex, #02-112, 335 Smith St',
    neighborhood: 'Chinatown',
    cuisine: 'Hand-Rolled Nonya Popiah',
    dishHighlights: ['Steamed Turnip & Jicama Roll with Sweet Garlic', 'Crunchy Biscuit Crisps & Crushed Peanuts'],
    priceRange: '$3.00 - $5.00',
    healthScore: 'High Soluble Fiber • Low Fat Fresh Vegetables',
    walkTimeMinutes: 8,
    tags: ['light', 'clean', 'vegetarian', 'popiah', 'rolls', 'veggies'],
    imageUrl: nonyaPopiahImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ann+Chin+Handmade+Popiah+Chinatown+Complex+Singapore'
  },
  {
    id: 'hong-lim-outram-fkt',
    stallName: 'Outram Park Fried Kway Teow Mee',
    hawkerCentre: 'Hong Lim Market & Food Centre',
    location: 'Hong Lim Market & Food Centre, #02-17, 531A Upper Cross St',
    neighborhood: 'Chinatown / Hong Lim',
    cuisine: 'Smoky Charcoal Wok Hei Char Kway Teow',
    dishHighlights: ['Wok-Charred Flat Rice Noodles with Cockles', 'Fragrant Egg, Bean Sprouts & Sweet Dark Molasses'],
    priceRange: '$4.50 - $6.50',
    healthScore: 'Authentic Wok Hei Sear • Iron-Rich Cockles',
    walkTimeMinutes: 9,
    tags: ['comfort', 'something_new', 'noodles', 'char kway teow', 'kway teow'],
    imageUrl: charKwayTeowImg,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Outram+Park+Fried+Kway+Teow+Hong+Lim+Market+Singapore'
  }
];

export const INITIAL_EXPIRING_PANTRY = [
  { id: 'item-1', name: 'Baby Spinach leaves', category: 'produce' as const, daysLeft: 2, isTagged: true },
  { id: 'item-2', name: 'Firm Organic Tofu', category: 'protein' as const, daysLeft: 1, isTagged: true },
  { id: 'item-3', name: 'Brown Eggs (4 left)', category: 'protein' as const, daysLeft: 3, isTagged: true },
  { id: 'item-4', name: 'Shimeji Mushrooms', category: 'produce' as const, daysLeft: 2, isTagged: false },
  { id: 'item-5', name: 'Greek Yogurt cup', category: 'dairy_pantry' as const, daysLeft: 4, isTagged: false },
  { id: 'item-6', name: 'Ripe Cherry Tomatoes', category: 'produce' as const, daysLeft: 2, isTagged: false }
];
