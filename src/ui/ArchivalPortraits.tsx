import React from 'react';
import { PopulationRoles } from '../game/types';

export type ArchivalPortraitId =
  | 'amghar'
  | 'amghar_wife'
  | 'elder_advisor'
  | 'oldest_son_heir'
  | 'daughter_in_law'
  | 'daughter'
  | 'village_laborer'
  | 'teenage_grandson'
  | 'young_granddaughter'
  | 'young_boy_heir';

export interface ArchivalCharacterDef {
  id: ArchivalPortraitId;
  generation: '1850_1860' | '1870' | '1890_1900';
  generationYearLabel: string;
  generationTitleEn: string;
  generationTitleAr: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  ageLabelEn: string;
  ageLabelAr: string;
  ageYears: number;
  roleKey: keyof PopulationRoles;
  roleLabelEn: string;
  roleLabelAr: string;
  companionId: ArchivalPortraitId;
  companionRelationEn: string;
  companionRelationAr: string;
  /** CSS background-position and background-size to crop exact bust from Gemini_Generated_Image_dnb7p2dnb7p2dnb7_9e1db0df.png */
  cropPos: string;
  cropSize: string;
  stats: {
    martial: number;
    defense: number;
    diplomacy: number;
    harvest: number;
    trade: number;
  };
  productionEn: string;
  productionAr: string;
  consumptionEn: string;
  consumptionAr: string;
  biographyEn: string;
  biographyAr: string;
  attireNotesEn: string;
  attireNotesAr: string;
}

export const ARCHIVAL_FAMILY_SHEET_URL = `${import.meta.env.BASE_URL}assets/aistudio/Gemini_Generated_Image_dnb7p2dnb7p2dnb7_9e1db0df.png`;
export const ARCHIVAL_UI_KIT_URL = `${import.meta.env.BASE_URL}assets/aistudio/Gemini_Generated_Image_vx90l5vx90l5vx90_2c5ab6f2.png`;

export const ARCHIVAL_CHARACTERS: Record<ArchivalPortraitId, ArchivalCharacterDef> = {
  amghar: {
    id: 'amghar',
    generation: '1850_1860',
    generationYearLabel: '1850 – 1870',
    generationTitleEn: 'Generation I — The Ancestors & Elders',
    generationTitleAr: 'الجيل الأول (1850–1860م) — الأجداد والشيوخ المؤسسون',
    nameEn: 'Amghar El-Hajj Al-Hassan',
    nameAr: 'الأمغار الحاج الحسن',
    titleEn: 'The Amghar (Tribal Chief)',
    titleAr: 'الأمغار (شيخ القبيلة وعمدة الجماعة)',
    ageLabelEn: 'Elder in his 60s',
    ageLabelAr: 'شيخ في الستينيات من عمره',
    ageYears: 62,
    roleKey: 'guards',
    roleLabelEn: 'Supreme Council & Defense',
    roleLabelAr: 'رئاسة الجماعة وحماية القصبة',
    companionId: 'amghar_wife',
    companionRelationEn: 'Spouse: Lalla Tafukt (Matriarch)',
    companionRelationAr: 'القرينة: لالة تافوكت (سيدة القصبة)',
    cropPos: '37.2% 14.5%',
    cropSize: '470% auto',
    stats: { martial: 14, defense: 16, diplomacy: 18, harvest: 12, trade: 15 },
    productionEn: '+8 Prestige/yr · +15% Agadir Granary Security · Customary Law (Azref)',
    productionAr: '+8 هيبة سنوياً · +15% تحصين أكادير · القضاء العرفي (أزرف)',
    consumptionEn: '2 Grain/season · 1 Olive Oil · Ceremonial Hospitality',
    consumptionAr: '2 قمح/فصل · 1 زيت أركان وزيتون · مئونة الضيافة',
    biographyEn:
      'Patriarch of Ksar Aït Tamda and keeper of the silver Koumya dagger. He united the Souss-Massa clans under the sacred Tada pact and stewards the mountain granaries.',
    biographyAr:
      'عميد قصر آيت تامدا وحامل الخنجر الفضي (الكمية). وحّد فروع القبيلة في سوس ماسة تحت ميثاق تاضا المقدس وأشرف على بناء السواقي وتحصين أكادير الجماعة.',
    attireNotesEn: 'White folded razza turban, golden-ochre wool burnous with brass clasps, silver koumya.',
    attireNotesAr: 'عمامة بيضاء (رزة)، برنوس صوفي ذهبي بمشابك نحاسية، وخنجر كمية فضي منقوش.',
  },
  amghar_wife: {
    id: 'amghar_wife',
    generation: '1850_1860',
    generationYearLabel: '1850 – 1870',
    generationTitleEn: 'Generation I — The Ancestors & Elders',
    generationTitleAr: 'الجيل الأول (1850–1860م) — الأجداد والشيوخ المؤسسون',
    nameEn: 'Lalla Tafukt n-Aït Atta',
    nameAr: 'لالة تافوكت ن آيت عطا',
    titleEn: 'His Wife (Matriarch of the Ksar)',
    titleAr: 'زوجة الأمغار (الحكيمة وسيدة الدار)',
    ageLabelEn: 'Elder in her 50s',
    ageLabelAr: 'حكيمة في الخمسينيات من عمرها',
    ageYears: 56,
    roleKey: 'artisans',
    roleLabelEn: 'Master Weaver & Household Steward',
    roleLabelAr: 'كبيرة النسّاجات وأمينة المؤونة',
    companionId: 'amghar',
    companionRelationEn: 'Husband: Amghar El-Hajj Al-Hassan',
    companionRelationAr: 'الزوج: الأمغار الحاج الحسن',
    cropPos: '58.8% 15.2%',
    cropSize: '500% auto',
    stats: { martial: 7, defense: 14, diplomacy: 16, harvest: 15, trade: 17 },
    productionEn: '+6 Carpets & Wool/yr · +12% Household Storage Conservation',
    productionAr: '+6 زرابي ومنسوجات/سنة · +12% حفظ المؤونة في البيوت',
    consumptionEn: '1.5 Grain/season · Indigo & Saffron Dyes',
    consumptionAr: '1.5 قمح/فصل · أصباغ النيلة والزعفران الحر',
    biographyEn:
      'Matriarch of the ruling house, wearing ancestral silver Tizerzai fibulae and traditional Amazigh chin tattoo (siyala). She oversees the village looms and medicinal argan presses.',
    biographyAr:
      'سيدة القصبة وحافظة تراث النسيج الأمازيغي، تتزين بـ «تزرزاي» الفضية والوشم الأمازيغي العريق، وتشرف على مشاغل الزرابي وعصر زيت الأركان.',
    attireNotesEn: 'Indigo Amazigh head-covering, silver forehead diadem, Tizerzai fibula brooches.',
    attireNotesAr: 'رداء النيلة الأمازيغي الأصيل، تاج فضي جبيني، ومشابك تزرزاي الفضية المرصعة.',
  },
  elder_advisor: {
    id: 'elder_advisor',
    generation: '1850_1860',
    generationYearLabel: '1850 – 1870',
    generationTitleEn: 'Generation I — The Ancestors & Elders',
    generationTitleAr: 'الجيل الأول (1850–1860م) — الأجداد والشيوخ المؤسسون',
    nameEn: 'Sidi Mhand u-Brahim (Lamine)',
    nameAr: 'سيدي محند أوبراهيم (الأمين)',
    titleEn: 'The Older Elder / Advisor',
    titleAr: 'الشيخ المستشار وحكيم مجلس الجماعة',
    ageLabelEn: 'Wise man in his 70s',
    ageLabelAr: 'حكيم في السبعينيات من عمره',
    ageYears: 73,
    roleKey: 'shepherds',
    roleLabelEn: 'Jmaa Chronicler & Water Arbiter',
    roleLabelAr: 'أمين السواقي ومؤرخ الوادي',
    companionId: 'amghar',
    companionRelationEn: 'Council Brother: Amghar Al-Hassan',
    companionRelationAr: 'رفيق الشورى: الأمغار الحاج الحسن',
    cropPos: '81.6% 15.0%',
    cropSize: '490% auto',
    stats: { martial: 9, defense: 13, diplomacy: 19, harvest: 16, trade: 14 },
    productionEn: '+20% Seguia Water Yield · Resolves Tribal Blood Feuds',
    productionAr: '+20% كفاءة توزيع مياه السواقي · فض النزاعات القبلية',
    consumptionEn: '1 Grain/season · 1 Honey & Herbs',
    consumptionAr: '1 قمح/فصل · أعشاب جبلية وعسل',
    biographyEn:
      'Keeper of the cedarwood water-clock (Tastount) and oral genealogies since 1820. With his carved olive-wood staff, he measures irrigation shares across every terrace.',
    biographyAr:
      'أمين الساعة المائية (تاستونت) وحافظ أنساب القبائل منذ مطلع القرن التاسع عشر. يطوف بعصاه الخشبية لتقسيم نوبات الري بالعدل بين المدرجات.',
    attireNotesEn: 'Hooded earth-brown wool jellaba and burnous, carved wooden shepherd staff.',
    attireNotesAr: 'جلابية وبرنوس صوفي بلون الأرض مع عصا المشيئة الخشبية المنحوتة.',
  },
  oldest_son_heir: {
    id: 'oldest_son_heir',
    generation: '1870',
    generationYearLabel: '1870 (Present Era)',
    generationTitleEn: 'Generation II — The 1870 Heirs & Builders',
    generationTitleAr: 'الجيل الثاني (1870م) — الورثة وبناة الحاضرة',
    nameEn: 'Amzwaro Sidi Youssef u-Hassan',
    nameAr: 'أمزوارو سيدي يوسف بن الحسن',
    titleEn: 'The Oldest Son & Heir',
    titleAr: 'الابن الأكبر وولي العهد (أمزوارو)',
    ageLabelEn: 'In his late 30s',
    ageLabelAr: 'فارس في أواخر الثلاثينيات من عمره',
    ageYears: 37,
    roleKey: 'guards',
    roleLabelEn: 'Player Heir & Caravan Commander',
    roleLabelAr: 'ولي العهد وقائد القوافل والحرس',
    companionId: 'daughter_in_law',
    companionRelationEn: 'Spouse: Lalla Maryam (Heir’s Wife)',
    companionRelationAr: 'الزوجة: لالة مريم (قرينة ولي العهد)',
    cropPos: '23.8% 49.5%',
    cropSize: '490% auto',
    stats: { martial: 17, defense: 15, diplomacy: 14, harvest: 13, trade: 16 },
    productionEn: '+12 Caravan Guard Power · +5 Silver Dirhams per Souk Expedition',
    productionAr: '+12 قوة حراسة القوافل · +5 دراهم فضية لكل رحلة سوق',
    consumptionEn: '2 Grain/season · 1 Cavalry Rations & Powder',
    consumptionAr: '2 قمح/فصل · علف الخيول وذخيرة المكحلة',
    biographyEn:
      'Firstborn son and designated successor (Amzwaro). He leads the seasonal trade caravans between Taroudant, Tiznit, and the oasis of Tafilalet.',
    biographyAr:
      'الابن البكر والوريث الشرعي (أمزوارو). يقود قوافل التجارة الموسمية بين تارودانت وتزنيت وواحات تافيلالت ويشرف على فرسان الحراسة.',
    attireNotesEn: 'Crisp white turban, trimmed dark beard, cream wool cloak with brass medallion clasp.',
    attireNotesAr: 'عمامة بيضاء متقنة، لحية سوداء مهذبة، وسلهام صوفي أبيض بمشبك نحاسي.',
  },
  daughter_in_law: {
    id: 'daughter_in_law',
    generation: '1870',
    generationYearLabel: '1870 (Present Era)',
    generationTitleEn: 'Generation II — The 1870 Heirs & Builders',
    generationTitleAr: 'الجيل الثاني (1870م) — الورثة وبناة الحاضرة',
    nameEn: 'Lalla Maryam n-Tافراوت',
    nameAr: 'لالة مريم التافراوتية',
    titleEn: "The Daughter-in-Law (The Heir's Wife)",
    titleAr: 'كنّة الأمغار (زوجة ولي العهد)',
    ageLabelEn: 'Early in her 30s',
    ageLabelAr: 'سيدة في أوائل الثلاثينيات من عمرها',
    ageYears: 31,
    roleKey: 'artisans',
    roleLabelEn: 'Souk Artisan & Alliance Envoy',
    roleLabelAr: 'أمينة المنسوجات وسفيرة المصاهرة',
    companionId: 'oldest_son_heir',
    companionRelationEn: 'Husband: Amzwaro Sidi Youssef',
    companionRelationAr: 'الزوج: أمزوارو سيدي يوسف',
    cropPos: '43.6% 50.0%',
    cropSize: '500% auto',
    stats: { martial: 8, defense: 12, diplomacy: 17, harvest: 14, trade: 18 },
    productionEn: '+8 Silver Trade Value · Cemented Tada Pact with Tafraout',
    productionAr: '+8 قيمة تجارة الفضة · توثيق حلف تاضا مع تافراوت',
    consumptionEn: '1.5 Grain/season · Amber, Coral & Wool Thread',
    consumptionAr: '1.5 قمح/فصل · خيوط الصوف والعنبر والمرجان',
    biographyEn:
      'Daughter of the Amghar of Tafraout. Her marriage sealed peace in the Anti-Atlas, and her amber-and-coral jewelry marks the prosperity of the household.',
    biographyAr:
      'ابنة أمغار تافراوت، وثّق زواجها السلام في الأطلس الصغير، وتشتهر بعقد اللبان الحر والعنبر والمرجان وإدارة مقايضات السوق.',
    attireNotesEn: 'Coin-trimmed headscarf, striped terracotta & teal dress, multi-strand amber necklace.',
    attireNotesAr: 'غطاء رأس مزين بالقطع الفضية، ثوب مخطط بالأحمر الترابي والفيروزي، وقلادة عنبر.',
  },
  daughter: {
    id: 'daughter',
    generation: '1870',
    generationYearLabel: '1870 (Present Era)',
    generationTitleEn: 'Generation II — The 1870 Heirs & Builders',
    generationTitleAr: 'الجيل الثاني (1870م) — الورثة وبناة الحاضرة',
    nameEn: 'Lalla Zaynab u-Hassan',
    nameAr: 'لالة زينب بنت الحسن',
    titleEn: 'The Daughter',
    titleAr: 'ابنة الأمغار (مشرفة البساتين والأركان)',
    ageLabelEn: 'In her early 20s',
    ageLabelAr: 'شابة في أوائل العشرينيات من عمرها',
    ageYears: 22,
    roleKey: 'farmers',
    roleLabelEn: 'Argan & Saffron Orchard Keeper',
    roleLabelAr: 'مشرفة بساتين الأركان واللوز والزعفران',
    companionId: 'village_laborer',
    companionRelationEn: 'Co-Steward: Master Terrace Farmer',
    companionRelationAr: 'شريك العمل في الحقول: مقدم الفلاحين',
    cropPos: '63.6% 50.2%',
    cropSize: '500% auto',
    stats: { martial: 9, defense: 11, diplomacy: 15, harvest: 18, trade: 15 },
    productionEn: '+9 Walnuts, Almonds & Argan Oil/season · +10% Terrace Fertility',
    productionAr: '+9 جوز ولوز وزيت أركان/فصل · +10% خصوبة المدرجات',
    consumptionEn: '1 Grain/season · Spring Irrigation Share',
    consumptionAr: '1 قمح/فصل · حصة مياه الساقية الربيعية',
    biographyEn:
      'Skilled botanist and keeper of the valley’s almond blossoms, saffron plots, and argan groves. Noble families from Iligh and Taroudant seek her hand in marriage.',
    biographyAr:
      'خبيرة ببساتين اللوز وجني الأركان وزراعة الزعفران في مدرجات الوادي. تخطب ودّها كبريات الأسر في إيليغ وتارودانت لتعزيز الأحلاف.',
    attireNotesEn: 'Patterned saffron-and-coral headscarf, richly embroidered multicolor Amazigh tunic.',
    attireNotesAr: 'وشاح رأس مزركش بالزعفران والمرجان، وقفطان أمازيغي مطرز بألوان الربيع.',
  },
  village_laborer: {
    id: 'village_laborer',
    generation: '1870',
    generationYearLabel: '1870 (Present Era)',
    generationTitleEn: 'Generation II — The 1870 Heirs & Builders',
    generationTitleAr: 'الجيل الثاني (1870م) — الورثة وبناة الحاضرة',
    nameEn: 'Brahim u-Moussa (Abdelkader)',
    nameAr: 'إبراهيم أوموسى (مقدم البنائين والفلاحين)',
    titleEn: 'The Village Laborer / Adult Man',
    titleAr: 'العامل الباني وفلاح مدرجات سوس',
    ageLabelEn: 'In late 20s or 30s',
    ageLabelAr: 'رجل جلد في أواخر العشرينيات أو الثلاثينيات',
    ageYears: 29,
    roleKey: 'builders',
    roleLabelEn: 'Master Rammed-Earth Builder & Farmer',
    roleLabelAr: 'معلم البناء بالطين المدكوك (التابوت) والفلاحة',
    companionId: 'daughter',
    companionRelationEn: 'Terrace Coordinator: Lalla Zaynab',
    companionRelationAr: 'مشرفة المدرجات: لالة زينب',
    cropPos: '83.2% 50.2%',
    cropSize: '490% auto',
    stats: { martial: 13, defense: 14, diplomacy: 10, harvest: 19, trade: 11 },
    productionEn: '+14 Grain & Earth/season · -20% Building Construction Time',
    productionAr: '+14 قمح وطين/فصل · تسريع بناء القصور والمدرجات بنسبة 20%',
    consumptionEn: '2 Grain/season · Iron Pickaxe & Timber Scaffolding',
    consumptionAr: '2 قمح/فصل · عدد الحفر وأخشاب السقالات',
    biographyEn:
      'Backbone of theSous-Massa valley workforce. From dawn to dusk he raises rammed-earth (pisé) walls, clears stone terraces, and channels mountain snowmelt into the barley fields.',
    biographyAr:
      'عماد العمل والإنتاج في وادي سوس ماسة. يشيّد جدران الطين المدكوك (اللوح) منذ الفجر، ويمهد المدرجات الحجرية ويوجه مياه العيون نحو حقول الشعير.',
    attireNotesEn: 'Woven linen work tunic with slate-grey draped shoulder wrap for hauling stone.',
    attireNotesAr: 'قميص عمل كتاني متين مع رداء كتف رمادي لحمل الحجارة وألواح الطين.',
  },
  teenage_grandson: {
    id: 'teenage_grandson',
    generation: '1890_1900',
    generationYearLabel: '1890 – 1910',
    generationTitleEn: 'Generation III — The Youth & Next Heirs',
    generationTitleAr: 'الجيل الثالث (1890–1910م) — الأحفاد وورثة المستقبل',
    nameEn: 'Idir u-Youssef',
    nameAr: 'إيدير بن يوسف (الحفيد الشاب)',
    titleEn: 'The Teenage Son (Grandson)',
    titleAr: 'الحفيد الفتى (فارس متدرب وراعي القطعان)',
    ageLabelEn: 'Teenage Youth (16 yrs)',
    ageLabelAr: 'فتى يافع (16 سنة)',
    ageYears: 16,
    roleKey: 'shepherds',
    roleLabelEn: 'Apprentice Horseman & High-Pasture Shepherd',
    roleLabelAr: 'فارس متدرب وراعي المراعي العليا (أكدال)',
    companionId: 'young_granddaughter',
    companionRelationEn: 'Sister: Tuda u-Youssef',
    companionRelationAr: 'الأخت: تودة بنت يوسف',
    cropPos: '30.5% 82.5%',
    cropSize: '500% auto',
    stats: { martial: 12, defense: 11, diplomacy: 11, harvest: 14, trade: 12 },
    productionEn: '+7 Livestock & Wool/season · Scout on the Atlas Passes',
    productionAr: '+7 ماشية وصوف/فصل · استطلاع ممرات الأطلس',
    consumptionEn: '1 Grain/season',
    consumptionAr: '1 قمح/فصل',
    biographyEn:
      'Eldest grandson of the Amghar. He tends the flocks in the high Agdal pastures and trains daily in horsemanship (Tbourida) and watchtower scouting.',
    biographyAr:
      'الحفيد الأكبر للأمغار، يرعى القطعان في مراعي «أكدال» الجبلية ويتدرب يومياً على الفروسية والرماية ومراقبة المسالك.',
    attireNotesEn: 'Earth-brown homespun wool tunic suited for mountain riding.',
    attireNotesAr: 'ثوب صوفي بني منسوج محلياً وملائم لركوب الخيل في الجبال.',
  },
  young_granddaughter: {
    id: 'young_granddaughter',
    generation: '1890_1900',
    generationYearLabel: '1890 – 1910',
    generationTitleEn: 'Generation III — The Youth & Next Heirs',
    generationTitleAr: 'الجيل الثالث (1890–1910م) — الأحفاد وورثة المستقبل',
    nameEn: 'Tuda u-Youssef',
    nameAr: 'تودة بنت يوسف (الحفيدة)',
    titleEn: 'The Young Granddaughter (approx. 13–14)',
    titleAr: 'الحفيدة الصغرى (حافظة النقوش والأغاني)',
    ageLabelEn: 'Approx. 13–14 years old',
    ageLabelAr: 'فتاة ناشئة (حوالي 13–14 سنة)',
    ageYears: 14,
    roleKey: 'artisans',
    roleLabelEn: 'Apprentice Weaver & Calligrapher ("Inks of Descent")',
    roleLabelAr: 'متدربة في نقش الحناء والنسج وتدوين الأنساب',
    companionId: 'young_boy_heir',
    companionRelationEn: 'Younger Brother: AmzwaroTariq II',
    companionRelationAr: 'الأخ الأصغر: طارق الثاني (الوريث القادم)',
    cropPos: '50.6% 82.5%',
    cropSize: '500% auto',
    stats: { martial: 5, defense: 9, diplomacy: 14, harvest: 13, trade: 14 },
    productionEn: '+5 Fine Amazigh Textiles · Preserves Oral & Written Chronicle',
    productionAr: '+5 منسوجات دقيقة · حفظ أشعار وأنساب القبيلة',
    consumptionEn: '1 Grain/season',
    consumptionAr: '1 قمح/فصل',
    biographyEn:
      'Learning geometry of Amazigh carpets from her grandmother Lalla Tafukt and recording the family’s "Inks of Descent" in Arabic and Tifinagh scripts.',
    biographyAr:
      'تتعلم أسرار الرموز الهندسية للزرابي من جدتها لالة تافوكت، وتشارك في تدوين شجرة العائلة بالخط المغربي وحروف تيفيناغ.',
    attireNotesEn: 'Soft cream wool shawl headscarf over terracotta tunic with indigo trim.',
    attireNotesAr: 'خمار صوفي أبيض ناعم فوق رداء بلون الطين المحروق مطرز بالنيلة.',
  },
  young_boy_heir: {
    id: 'young_boy_heir',
    generation: '1890_1900',
    generationYearLabel: '1890 – 1910',
    generationTitleEn: 'Generation III — The Youth & Next Heirs',
    generationTitleAr: 'الجيل الثالث (1890–1910م) — الأحفاد وورثة المستقبل',
    nameEn: 'Amzwaro Tariq II u-Youssef',
    nameAr: 'الأمير الصغير طارق بن يوسف',
    titleEn: 'The Young Boy — Next Heir',
    titleAr: 'الفتى الصغير — الوريث القادم للقرن العشرين',
    ageLabelEn: 'Child Heir (10 yrs)',
    ageLabelAr: 'الوريث الناشئ (10 سنوات)',
    ageYears: 10,
    roleKey: 'farmers',
    roleLabelEn: 'Student of the Timzgida & Future Amghar (1910)',
    roleLabelAr: 'طالب علم بالمسجد وأمغار المستقبل (1910م)',
    companionId: 'elder_advisor',
    companionRelationEn: 'Mentor: Sidi Mhand (The Elder Advisor)',
    companionRelationAr: 'المعلم والمربي: الشيخ سيدي محند',
    cropPos: '73.5% 82.8%',
    cropSize: '500% auto',
    stats: { martial: 8, defense: 10, diplomacy: 15, harvest: 12, trade: 13 },
    productionEn: '+4 Future Dynasty Prestige · Studies Law & Astronomy in Timzgida',
    productionAr: '+4 هيبة مستقبلية للسلالة · يدرس الفقه والفلك في تمزكيدا',
    consumptionEn: '0.8 Grain/season · Cedar Writing Board (Lawha)',
    consumptionAr: '0.8 قمح/فصل · لوحة كتابة من خشب الأرز وصمغ عربي',
    biographyEn:
      'Wearing the traditional pointed hooded jellaba (Aselham), he memorizes customary law and mathematics to lead the valley into the 20th century (1910).',
    biographyAr:
      'يرتدي الجلابية المغربية ذات القب المسنن، ويحفظ أعراف أزرف والحساب على يد شيوخ الزاوية ليحمل راية الوادي حتى عام 1910م.',
    attireNotesEn: 'Pointed tan hooded wool jellaba with traditional braided trim.',
    attireNotesAr: 'جلابية صوفية بقب مسنن تقليدي مطرزة بالسفيفة المغربية.',
  },
};

export const ARCHIVAL_CHARACTER_ORDER: ArchivalPortraitId[] = [
  'amghar',
  'amghar_wife',
  'elder_advisor',
  'oldest_son_heir',
  'daughter_in_law',
  'daughter',
  'village_laborer',
  'teenage_grandson',
  'young_granddaughter',
  'young_boy_heir',
];

/**
 * Deterministically maps any living VillagerProfile to the matching 1870 Archival Portrait archetype
 * from Gemini_Generated_Image_dnb7p2dnb7p2dnb7_9e1db0df.png based on gender, age, and role.
 */
export function getVillagerArchivalPortraitId(v: {
  gender: 'male' | 'female';
  age: number;
  role: keyof PopulationRoles;
  lineageId: string;
}): ArchivalPortraitId {
  if (v.gender === 'female') {
    if (v.age >= 48) return 'amghar_wife';
    if (v.age <= 16) return 'young_granddaughter';
    if (v.age >= 28 || v.role === 'artisans') return 'daughter_in_law';
    return 'daughter';
  } else {
    if (v.age >= 65) return 'elder_advisor';
    if (v.age >= 52) return 'amghar';
    if (v.age <= 13) return 'young_boy_heir';
    if (v.age <= 19) return 'teenage_grandson';
    if (v.role === 'guards' || v.lineageId === 'ait_amghar') return 'oldest_son_heir';
    return 'village_laborer';
  }
}

/**
 * Renders a crisp archival hand-drawn 1870 portrait cropped from Gemini_Generated_Image_dnb7p2dnb7p2dnb7_9e1db0df.png
 * inside either a Moorish Horseshoe Arch frame, an ornate rectangular archival frame, or a circular medallion.
 */
export const ArchivalPortraitAvatar: React.FC<{
  portraitId: ArchivalPortraitId;
  shape?: 'arch' | 'square' | 'circle';
  archVariant?: 'copper' | 'bronze';
  deceased?: boolean;
  className?: string;
}> = ({
  portraitId,
  shape = 'square',
  archVariant = 'copper',
  deceased = false,
  className = 'w-12 h-14',
}) => {
  const def = ARCHIVAL_CHARACTERS[portraitId] || ARCHIVAL_CHARACTERS.amghar;

  if (shape === 'arch') {
    const borderStroke = archVariant === 'copper' ? '#a85d34' : '#7b6b43';
    const innerFill = archVariant === 'copper' ? '#3d2114' : '#262418';
    return (
      <div
        className={`relative overflow-hidden select-none bg-[#e6d7ba] ${
          deceased ? 'grayscale opacity-80' : ''
        } ${className}`}
      >
        {/* Warm aged parchment backdrop with zoomed bust so family-tree lines below the bust are cropped out */}
        <div
          className="absolute inset-x-0 top-2 bottom-[-18%] bg-no-repeat transition-transform duration-300"
          style={{
            backgroundImage: `url("${ARCHIVAL_FAMILY_SHEET_URL}")`,
            backgroundPosition: def.cropPos,
            backgroundSize: def.cropSize,
          }}
        />
        {/* Soft parchment gradient fade at the base of the arch */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{
            background:
              'linear-gradient(to top, #dfd0b2 18%, rgba(223,208,178,0.75) 55%, transparent 100%)',
          }}
        />

        {/* Ornate Moorish Horseshoe Arch Spandrel Overlay (matching Reference Image 2) */}
        <svg
          viewBox="0 0 200 260"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Outer Dark Wood & Brass Frame */}
          <path
            d="M0,0 H200 V260 H0 Z M16,248 H184 V115 C184,102 176,94 176,82 C176,38 142,14 100,14 C58,14 24,38 24,82 C24,94 16,102 16,115 Z"
            fill={innerFill}
            fillRule="evenodd"
          />
          {/* Intricate Arabesque Spandrel Filigree */}
          <path
            d="M16,115 C16,102 24,94 24,82 C24,38 58,14 100,14 C142,14 176,38 176,82 C176,94 184,102 184,115 V248 H16 Z"
            fill="none"
            stroke={borderStroke}
            strokeWidth="4"
          />
          <path
            d="M20,115 C20,102 28,94 28,82 C28,42 60,18 100,18 C140,18 172,42 172,82 C172,94 180,102 180,115"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          {/* Left & Right Spandrel Geometric Rosettes */}
          <circle cx="32" cy="32" r="12" fill="none" stroke={borderStroke} strokeWidth="1.3" />
          <circle cx="32" cy="32" r="5" fill="none" stroke="#d4af37" strokeWidth="1" />
          <circle cx="168" cy="32" r="12" fill="none" stroke={borderStroke} strokeWidth="1.3" />
          <circle cx="168" cy="32" r="5" fill="none" stroke="#d4af37" strokeWidth="1" />
          {/* Outer Frame Border */}
          <rect
            x="2"
            y="2"
            width="196"
            height="256"
            rx="4"
            fill="none"
            stroke="#3a2615"
            strokeWidth="4"
          />
          <rect
            x="6"
            y="6"
            width="188"
            height="248"
            rx="2"
            fill="none"
            stroke={borderStroke}
            strokeWidth="1.5"
          />
          {/* Bottom Brass Corner Clasps with Rivets */}
          <polygon
            points="2,226 30,258 2,258"
            fill={borderStroke}
            stroke="#2a1a0e"
            strokeWidth="1.2"
          />
          <circle cx="10" cy="250" r="2.2" fill="#f3e5ab" />
          <polygon
            points="198,226 170,258 198,258"
            fill={borderStroke}
            stroke="#2a1a0e"
            strokeWidth="1.2"
          />
          <circle cx="190" cy="250" r="2.2" fill="#f3e5ab" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none bg-[#e8dcc4] ${
        shape === 'circle' ? 'rounded-full' : 'rounded'
      } ${deceased ? 'grayscale opacity-75' : ''} ${className}`}
    >
      <div
        className="w-full h-full bg-no-repeat"
        style={{
          backgroundImage: `url("${ARCHIVAL_FAMILY_SHEET_URL}")`,
          backgroundPosition: def.cropPos,
          backgroundSize: def.cropSize,
        }}
      />
      <div
        className={`pointer-events-none absolute inset-0 border border-[#8c6239]/70 shadow-inner ${
          shape === 'circle' ? 'rounded-full' : 'rounded'
        }`}
      />
    </div>
  );
};
