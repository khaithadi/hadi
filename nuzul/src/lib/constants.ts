// Static reference data for Nuzul. Wilayas seed the DB; amenities/types drive forms & filters.

export interface WilayaSeed {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  slug: string;
}

// The 58 Algerian wilayas (official numbering).
export const WILAYAS: WilayaSeed[] = [
  { id: 1, nameAr: 'أدرار', nameFr: 'Adrar', nameEn: 'Adrar', slug: 'adrar' },
  { id: 2, nameAr: 'الشلف', nameFr: 'Chlef', nameEn: 'Chlef', slug: 'chlef' },
  { id: 3, nameAr: 'الأغواط', nameFr: 'Laghouat', nameEn: 'Laghouat', slug: 'laghouat' },
  { id: 4, nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', nameEn: 'Oum El Bouaghi', slug: 'oum-el-bouaghi' },
  { id: 5, nameAr: 'باتنة', nameFr: 'Batna', nameEn: 'Batna', slug: 'batna' },
  { id: 6, nameAr: 'بجاية', nameFr: 'Béjaïa', nameEn: 'Bejaia', slug: 'bejaia' },
  { id: 7, nameAr: 'بسكرة', nameFr: 'Biskra', nameEn: 'Biskra', slug: 'biskra' },
  { id: 8, nameAr: 'بشار', nameFr: 'Béchar', nameEn: 'Bechar', slug: 'bechar' },
  { id: 9, nameAr: 'البليدة', nameFr: 'Blida', nameEn: 'Blida', slug: 'blida' },
  { id: 10, nameAr: 'البويرة', nameFr: 'Bouira', nameEn: 'Bouira', slug: 'bouira' },
  { id: 11, nameAr: 'تمنراست', nameFr: 'Tamanrasset', nameEn: 'Tamanrasset', slug: 'tamanrasset' },
  { id: 12, nameAr: 'تبسة', nameFr: 'Tébessa', nameEn: 'Tebessa', slug: 'tebessa' },
  { id: 13, nameAr: 'تلمسان', nameFr: 'Tlemcen', nameEn: 'Tlemcen', slug: 'tlemcen' },
  { id: 14, nameAr: 'تيارت', nameFr: 'Tiaret', nameEn: 'Tiaret', slug: 'tiaret' },
  { id: 15, nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', nameEn: 'Tizi Ouzou', slug: 'tizi-ouzou' },
  { id: 16, nameAr: 'الجزائر', nameFr: 'Alger', nameEn: 'Algiers', slug: 'alger' },
  { id: 17, nameAr: 'الجلفة', nameFr: 'Djelfa', nameEn: 'Djelfa', slug: 'djelfa' },
  { id: 18, nameAr: 'جيجل', nameFr: 'Jijel', nameEn: 'Jijel', slug: 'jijel' },
  { id: 19, nameAr: 'سطيف', nameFr: 'Sétif', nameEn: 'Setif', slug: 'setif' },
  { id: 20, nameAr: 'سعيدة', nameFr: 'Saïda', nameEn: 'Saida', slug: 'saida' },
  { id: 21, nameAr: 'سكيكدة', nameFr: 'Skikda', nameEn: 'Skikda', slug: 'skikda' },
  { id: 22, nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', nameEn: 'Sidi Bel Abbes', slug: 'sidi-bel-abbes' },
  { id: 23, nameAr: 'عنابة', nameFr: 'Annaba', nameEn: 'Annaba', slug: 'annaba' },
  { id: 24, nameAr: 'قالمة', nameFr: 'Guelma', nameEn: 'Guelma', slug: 'guelma' },
  { id: 25, nameAr: 'قسنطينة', nameFr: 'Constantine', nameEn: 'Constantine', slug: 'constantine' },
  { id: 26, nameAr: 'المدية', nameFr: 'Médéa', nameEn: 'Medea', slug: 'medea' },
  { id: 27, nameAr: 'مستغانم', nameFr: 'Mostaganem', nameEn: 'Mostaganem', slug: 'mostaganem' },
  { id: 28, nameAr: 'المسيلة', nameFr: "M'Sila", nameEn: 'Msila', slug: 'msila' },
  { id: 29, nameAr: 'معسكر', nameFr: 'Mascara', nameEn: 'Mascara', slug: 'mascara' },
  { id: 30, nameAr: 'ورقلة', nameFr: 'Ouargla', nameEn: 'Ouargla', slug: 'ouargla' },
  { id: 31, nameAr: 'وهران', nameFr: 'Oran', nameEn: 'Oran', slug: 'oran' },
  { id: 32, nameAr: 'البيض', nameFr: 'El Bayadh', nameEn: 'El Bayadh', slug: 'el-bayadh' },
  { id: 33, nameAr: 'إليزي', nameFr: 'Illizi', nameEn: 'Illizi', slug: 'illizi' },
  { id: 34, nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', nameEn: 'Bordj Bou Arreridj', slug: 'bordj-bou-arreridj' },
  { id: 35, nameAr: 'بومرداس', nameFr: 'Boumerdès', nameEn: 'Boumerdes', slug: 'boumerdes' },
  { id: 36, nameAr: 'الطارف', nameFr: 'El Tarf', nameEn: 'El Tarf', slug: 'el-tarf' },
  { id: 37, nameAr: 'تندوف', nameFr: 'Tindouf', nameEn: 'Tindouf', slug: 'tindouf' },
  { id: 38, nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', nameEn: 'Tissemsilt', slug: 'tissemsilt' },
  { id: 39, nameAr: 'الوادي', nameFr: 'El Oued', nameEn: 'El Oued', slug: 'el-oued' },
  { id: 40, nameAr: 'خنشلة', nameFr: 'Khenchela', nameEn: 'Khenchela', slug: 'khenchela' },
  { id: 41, nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', nameEn: 'Souk Ahras', slug: 'souk-ahras' },
  { id: 42, nameAr: 'تيبازة', nameFr: 'Tipaza', nameEn: 'Tipaza', slug: 'tipaza' },
  { id: 43, nameAr: 'ميلة', nameFr: 'Mila', nameEn: 'Mila', slug: 'mila' },
  { id: 44, nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', nameEn: 'Ain Defla', slug: 'ain-defla' },
  { id: 45, nameAr: 'النعامة', nameFr: 'Naâma', nameEn: 'Naama', slug: 'naama' },
  { id: 46, nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', nameEn: 'Ain Temouchent', slug: 'ain-temouchent' },
  { id: 47, nameAr: 'غرداية', nameFr: 'Ghardaïa', nameEn: 'Ghardaia', slug: 'ghardaia' },
  { id: 48, nameAr: 'غليزان', nameFr: 'Relizane', nameEn: 'Relizane', slug: 'relizane' },
  { id: 49, nameAr: 'تيميمون', nameFr: 'Timimoun', nameEn: 'Timimoun', slug: 'timimoun' },
  { id: 50, nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', nameEn: 'Bordj Badji Mokhtar', slug: 'bordj-badji-mokhtar' },
  { id: 51, nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', nameEn: 'Ouled Djellal', slug: 'ouled-djellal' },
  { id: 52, nameAr: 'بني عباس', nameFr: 'Béni Abbès', nameEn: 'Beni Abbes', slug: 'beni-abbes' },
  { id: 53, nameAr: 'عين صالح', nameFr: 'In Salah', nameEn: 'In Salah', slug: 'in-salah' },
  { id: 54, nameAr: 'عين قزام', nameFr: 'In Guezzam', nameEn: 'In Guezzam', slug: 'in-guezzam' },
  { id: 55, nameAr: 'تقرت', nameFr: 'Touggourt', nameEn: 'Touggourt', slug: 'touggourt' },
  { id: 56, nameAr: 'جانت', nameFr: 'Djanet', nameEn: 'Djanet', slug: 'djanet' },
  { id: 57, nameAr: 'المغير', nameFr: "El M'Ghair", nameEn: 'El Mghair', slug: 'el-mghair' },
  { id: 58, nameAr: 'المنيعة', nameFr: 'El Meniaa', nameEn: 'El Meniaa', slug: 'el-meniaa' },
];

export const PROPERTY_TYPES = [
  'apartment',
  'studio',
  'villa',
  'house',
  'farm',
  'guesthouse',
  'chalet',
] as const;

export interface AmenitySeed {
  key: string;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  icon: string;
  category: string;
}

export const AMENITIES: AmenitySeed[] = [
  { key: 'wifi', labelAr: 'واي فاي', labelFr: 'Wi-Fi', labelEn: 'Wi-Fi', icon: 'wifi', category: 'essentials' },
  { key: 'ac', labelAr: 'تكييف', labelFr: 'Climatisation', labelEn: 'Air conditioning', icon: 'snowflake', category: 'essentials' },
  { key: 'heating', labelAr: 'تدفئة', labelFr: 'Chauffage', labelEn: 'Heating', icon: 'flame', category: 'essentials' },
  { key: 'kitchen', labelAr: 'مطبخ', labelFr: 'Cuisine', labelEn: 'Kitchen', icon: 'utensils', category: 'essentials' },
  { key: 'parking', labelAr: 'موقف سيارات', labelFr: 'Parking', labelEn: 'Parking', icon: 'car', category: 'facilities' },
  { key: 'pool', labelAr: 'مسبح', labelFr: 'Piscine', labelEn: 'Pool', icon: 'waves', category: 'facilities' },
  { key: 'gym', labelAr: 'صالة رياضية', labelFr: 'Salle de sport', labelEn: 'Gym', icon: 'dumbbell', category: 'facilities' },
  { key: 'tv', labelAr: 'تلفاز', labelFr: 'Télévision', labelEn: 'TV', icon: 'tv', category: 'entertainment' },
  { key: 'washer', labelAr: 'غسالة', labelFr: 'Lave-linge', labelEn: 'Washer', icon: 'washing-machine', category: 'essentials' },
  { key: 'elevator', labelAr: 'مصعد', labelFr: 'Ascenseur', labelEn: 'Elevator', icon: 'arrow-up-down', category: 'facilities' },
  { key: 'sea_view', labelAr: 'إطلالة على البحر', labelFr: 'Vue mer', labelEn: 'Sea view', icon: 'sailboat', category: 'highlights' },
  { key: 'garden', labelAr: 'حديقة', labelFr: 'Jardin', labelEn: 'Garden', icon: 'trees', category: 'highlights' },
  { key: 'cleaning', labelAr: 'خدمة تنظيف', labelFr: 'Ménage', labelEn: 'Cleaning service', icon: 'sparkles', category: 'services' },
  { key: 'generator', labelAr: 'مولد كهربائي', labelFr: 'Groupe électrogène', labelEn: 'Backup generator', icon: 'zap', category: 'facilities' },
  { key: 'water_tank', labelAr: 'خزان ماء', labelFr: 'Réservoir d’eau', labelEn: 'Water tank', icon: 'droplets', category: 'facilities' },
  { key: 'family_friendly', labelAr: 'مناسب للعائلات', labelFr: 'Familial', labelEn: 'Family friendly', icon: 'users', category: 'highlights' },
];

// Payment methods exposed at checkout, ordered by local preference.
export const PAYMENT_METHODS = [
  { key: 'baridimob', labelAr: 'بريدي موب', labelFr: 'BaridiMob', labelEn: 'BaridiMob' },
  { key: 'edahabia', labelAr: 'الذهبية', labelFr: 'Edahabia', labelEn: 'Edahabia' },
  { key: 'satim_cib', labelAr: 'بطاقة CIB', labelFr: 'Carte CIB', labelEn: 'CIB card' },
  { key: 'bank_transfer', labelAr: 'تحويل بنكي', labelFr: 'Virement bancaire', labelEn: 'Bank transfer' },
  { key: 'cash', labelAr: 'الدفع نقداً', labelFr: 'Paiement en espèces', labelEn: 'Cash on arrival' },
] as const;

export const CURRENCY = 'DZD';
