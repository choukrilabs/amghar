import { GAME_CONFIG } from './config';
import { EventCard, ValleyState } from './types';

// Starter set of 12 historical events from Section 5.5 + Yearly Mahalla from Section 5.6
// Fully localized in English and Modern Standard Arabic (العربية الفصحى)
export const STARTER_EVENTS: EventCard[] = [
  {
    id: 'early_frost',
    title: 'Early Frost in the High Groves',
    arTitle: 'صقيع مبكر في بساتين الجوز والأركان',
    season: 'autumn',
    description:
      'A sharp night wind descends from Jbel Toubkal. Hoarfrost threatens the ripening walnut and almond groves before the harvest is complete.',
    arDescription:
      'تهب رياح ليلية قارسة من قمم جبل توبقال والأطلس الكبير، ويهدد الصقيع الأبيض بساتين الجوز واللوز والأركان قبل اكتمال جني المحصول.',
    historicalContext:
      'High Atlas orchards at 1,800m elevation depended on community coordination to protect late autumn cash crops from sudden mountain frosts.',
    arHistoricalContext:
      'اعتمدت بساتين الأطلس وسوس على تكاتف الأسر وإيقاد المشاعل الليلية لحماية محاصيل الخريف النقدية من موجات الصقيع الجبلي المفاجئة.',
    choices: [
      {
        id: 'smudge_fires',
        label: 'Light Smudge Fires All Night',
        arLabel: 'إيقاد مشاعل الحطب طوال الليل حول البساتين',
        description: 'Burn juniper brush around the terraces to shield the walnut boughs.',
        arDescription: 'إحراق حطب العرعار والأغصان الجافة حول المدرجات لتدفئة أشجار الجوز وحمايتها.',
        costText: '-15 Timber, +15 Walnuts saved, +3 Prestige',
        arCostText: '-15 أخشاب · إنقاذ +15 جوز وأركان · +3 هيبة',
        minTimber: 15,
      },
      {
        id: 'accept_loss',
        label: 'Accept the Frost Losses',
        arLabel: 'ادخار الحطب للشتاء وتحمل خسائر الصقيع',
        description: 'Save the timber for winter hearth fires and gather what nuts survive.',
        arDescription: 'الحفاظ على مخزون الأخشاب لمواقد الشتاء وجمع ما يسلم من ثمار البساتين.',
        costText: '-10 Walnuts, +4 Unrest',
        arCostText: '-10 جوز وأركان · +4 توتر',
      },
    ],
  },
  {
    id: 'traveling_scholar',
    title: 'A Traveling Scholar at the Gate',
    arTitle: 'فقيه ومؤرخ رحّالة عند بوابة القرية',
    season: 'any',
    description:
      'A faqih and chronicler traveling from the Qarawiyyin in Fez toward the Sous asks the jemaa for three nights of hospitality.',
    arDescription:
      'حلّ بباب القرية فقيه وعالم قادم من جامع القرويين بفاس في طريقه إلى حواضر سوس ماسة، طالباً ضيافة مجلس الجماعة لثلاث ليالٍ.',
    historicalContext:
      'Itinerant scholars (tolba) carried legal texts, news of the Sultan’s court, and diplomatic prestige between mountain zawiyas.',
    arHistoricalContext:
      'كان العلماء والطلبة الرحّالة يحملون كتب الفقه وأخبار البلاط السلطاني والوساطات السلمية بين زوايا سوس والأطلس.',
    choices: [
      {
        id: 'host_scholar',
        label: 'Host Him with Barley & Lamb',
        arLabel: 'إكرام وفادته بالشعير واللحم في دار الضيافة',
        description: 'Open the guest chamber of the tighremt and gather the elders to hear his counsel.',
        arDescription: 'فتح قاعة الضيافة في تغرمت وجمع شيوخ الجماعة للاستماع إلى علمه وأخبار البلاد.',
        costText: '-20 Grain, +10 Prestige, -4 Unrest',
        arCostText: '-20 حبوب · +10 هيبة · -4 توتر',
        minGrain: 20,
      },
      {
        id: 'send_on',
        label: 'Offer Water & Send Him On',
        arLabel: 'تقديم الماء والاعتذار لضيق المؤونة',
        description: 'Explain that the valley stores are tight this season.',
        arDescription: 'الاعتذار للفقيه بأن مخازن القرية بالكاد تكفي الأسر في هذا الفصل.',
        costText: '-3 Prestige',
        arCostText: '-3 هيبة',
      },
    ],
  },
  {
    id: 'water_dispute',
    title: 'Dispute Over Seguia Water Turns',
    arTitle: 'نزاع بين عائلتين حول نوبات مياه الساقية',
    season: 'summer',
    description:
      'Two extended families quarrel at dawn over the tanast (water clock) measuring irrigation turns for the lower barley terraces.',
    arDescription:
      'نشب خلافٌ عند الفجر بين عائلتين كبيرتين حول قياس الطاس المائي (التناست) لتحديد حصص سقي حقول الشعير السفلى.',
    historicalContext:
      'Under Amazigh customary law (urf), water distribution from snowmelt seguias was measured with sinking copper bowls (tanast) and adjudicated by the amghar or marabout.',
    arHistoricalContext:
      'بموجب العرف الأمازيغي (أزرف)، كانت نوبات مياه السواقي تقاس بالساعة المائية النحاسية (التناست) ويفصل فيها الأمغار أو شيخ الزاوية.',
    choices: [
      {
        id: 'call_marabout',
        label: 'Invite the Marabout to Mediate',
        arLabel: 'دعوة شيخ الزاوية للتحكيم والصلح',
        description: 'Offer a gift to the saintly lodge so both families swear peace on the zawiya threshold.',
        arDescription: 'تقديم هدية للزاوية العلمية ليقسم الطرفان على الصلح والعدل عند عتبتها.',
        costText: '-10 Silver, +8 Prestige, -8 Unrest',
        arCostText: '-10 فضة · +8 هيبة · -8 توتر',
        minSilver: 10,
      },
      {
        id: 'judge_yourself',
        label: 'Enforce Strict Urf Custom Yourself',
        arLabel: 'الحكم المباشر بصرامة وفق قانون العرف (أزرف)',
        description: 'Divide the turns by household count; one family grumbles at the ruling.',
        arDescription: 'تقسيم نوبات المياه بعدد الأسر بحزم، مما يترك بعض التذمر لدى إحدى العائلتين.',
        costText: '+3 Prestige, +5 Unrest',
        arCostText: '+3 هيبة · +5 توتر',
      },
    ],
  },
  {
    id: 'wolves_flocks',
    title: 'Atlas Wolves Among the Flocks',
    arTitle: 'ذئاب الأطلس تتربص بحظائر الماشية',
    season: 'winter',
    description:
      'Tracks in the fresh snow circle the lower sheepfolds. Shepherds report howling from the cedar ridge at dusk.',
    arDescription:
      'ظهرت آثار ذئاب حول حظائر الأغنام السفلى، وأبلغ الرعاة عن عواء القطيع القادم من التلال الشرقية عند الغسق.',
    historicalContext:
      'During deep High Atlas winters when flocks descended from high pastures (azib), predators frequently tested stone corrals.',
    arHistoricalContext:
      'في ليالي الشتاء الباردة حين تنزل القطعان من مراعي العزيب الجبلية إلى السهل، كانت الذئاب والضواري تهاجم الحظائر الحجرية.',
    choices: [
      {
        id: 'organize_hunt',
        label: 'Organize a Valley Hunt',
        arLabel: 'تنظيم حملة مطاردة مسلحة مع حراس القرية',
        description: 'Send guards with flintlocks and hounds to drive the pack over the ridge.',
        arDescription: 'إرسال الحراس بالبنادق والكلاب لطرد قطيع الذئاب بعيداً عن حدود سوس ماسة.',
        costText: '-3 Arms, +6 Prestige, Flocks unharmed',
        arCostText: '-3 بنادق وبارود · +6 هيبة · حماية القطعان بالكامل',
      },
      {
        id: 'hire_shepherds',
        label: 'Double Watch Fires & Pens',
        arLabel: 'مضاعفة نيران الحراسة وتدعيم الحظائر',
        description: 'Burn extra timber and feed the watchdogs through the bitter nights.',
        arDescription: 'إشعال الحطب طوال الليل حول العزيب، مع فقدان عدد قليل من الشياه.',
        costText: '-12 Timber, -4 Flocks',
        arCostText: '-12 أخشاب · -4 من القطعان',
      },
    ],
  },
  {
    id: 'mogador_trader',
    title: 'Caravan Merchant from Mogador',
    arTitle: 'قافلة تجار قادمة من ميناء الصويرة وأكادير',
    season: 'spring',
    description:
      'A merchant convoy from Essaouira (Mogador) arrives with mules laden with green gunpowder tea, sugar loaves, and cotton cloth.',
    arDescription:
      'وصلت قافلة تجارية من مرسى الصويرة محملة بالشاي الأخضر وقوالب السكر والمنسوجات والفضة والبنادق للمقايضة بمحاصيل سوس.',
    historicalContext:
      'Following the 1856 Anglo-Moroccan treaty, merchants linked Atlantic ports like Mogador with Souss-Massa and High Atlas souks, trading imported goods for walnuts, argan oil, wool, and almonds.',
    arHistoricalContext:
      'ربطت القوافل التجارية موانئ المحيط الأطلسي بأسواق سوس ماسة وتارودانت، حيث قايض التجار اللوز والجوز وزيت الأركان والزرابي بالفضة والسلاح.',
    choices: [
      {
        id: 'trade_walnuts',
        label: 'Exchange Walnuts & Wool for Silver & Arms',
        arLabel: 'مقايضة الجوز والأركان والصوف بالفضة والبنادق',
        description: 'Strike a generous bargain in the souk square.',
        arDescription: 'عقد صفقة مربحة باسم الجماعة في ساحة السوق الأسبوعي.',
        costText: '-15 Walnuts, +28 Silver, +5 Arms, +4 Prestige',
        arCostText: '-15 جوز وأركان · +28 فضة · +5 بنادق · +4 هيبة',
      },
      {
        id: 'modest_hospitality',
        label: 'Collect Only Customary Souk Toll',
        arLabel: 'تحصيل رسوم عبور القافلة فقط',
        description: 'Let households trade privately and collect the transit fee.',
        arDescription: 'ترك الأسر تتاجر بحرية وتحصيل المكوس المعتادة لخزينة القرية.',
        costText: '+10 Silver',
        arCostText: '+10 فضة',
      },
    ],
  },
  {
    id: 'heavy_snow',
    title: 'Heavy Snow Closes Tizi Pass',
    arTitle: 'عاصفة ثلجية تغلق ممر تيزي الجبلي',
    season: 'winter',
    description:
      'A three-day blizzard buries the mountain pass in drifts two spears deep. Caravans are halted and families crowd around the hearths.',
    arDescription:
      'عاصفة ثلجية دامت ثلاثة أيام أغلقت المسالك الجبلية المؤدية إلى مراكش، وتوقفت القوافل واجتمعت الأسر حول المواقد.',
    historicalContext:
      'High passes in the Atlas regularly isolated valleys for weeks between December and February, testing the reserves of the collective agadir.',
    arHistoricalContext:
      'كانت الثلوج الشتوية تعزل الممرات الجبلية لأسابيع، مما يبرز أهمية حصن أكادير الجماعي في تأمين غذاء القبيلة.',
    choices: [
      {
        id: 'open_agadir_stores',
        label: 'Distribute Extra Barley from Stores',
        arLabel: 'توزيع حصص إضافية من الشعير من مخازن أكادير',
        description: 'Keep every household warm and fed until the sun returns.',
        arDescription: 'ضمان دفء وغذاء كل أسرة في القرية حتى تنقشع العاصفة.',
        costText: '-35 Grain, +6 Prestige, -6 Unrest',
        arCostText: '-35 حبوب · +6 هيبة · -6 توتر',
      },
      {
        id: 'strict_rationing',
        label: 'Enforce Strict Winter Rationing',
        arLabel: 'فرض تقنين صارم على استهلاك المؤونة',
        description: 'Preserve the grain reserves at the cost of cold nights.',
        arDescription: 'الحفاظ على احتياطي الحبوب مع تحمل الأسر لمشقة البرد.',
        costText: '-10 Grain, +9 Unrest',
        arCostText: '-10 حبوب · +9 توتر',
      },
    ],
  },
  {
    id: 'tribal_fugitive',
    title: 'A Fugitive Requests Zetata Protection',
    arTitle: 'فارس مستجير يطلب حماية الزطاطة والمزرك',
    season: 'any',
    description:
      'A horseman from a neighboring tribe grasps the central pillar of your jemaa, invoking customary sanctuary after a blood feud.',
    arDescription:
      'دخل فارس من قبيلة مجاورة وأمسك بسارية مجلس الجماعة، طالباً الإجارة والحماية العرفية (المزرك/الزطاطة) إثر نزاع قبلي.',
    historicalContext:
      'Granting protection (zetata or mezrag) was a sacred mark of tribal honor and independence in bled al-siba, though it risked friction with rivals.',
    arHistoricalContext:
      'كانت إجارة المستجير ومنحه عهد الأمان (الزطاطة) رمزاً للشرف والسيادة القبلية في أعراف سوس والأطلس.',
    choices: [
      {
        id: 'grant_refuge',
        label: 'Grant Sacred Sanctuary',
        arLabel: 'منحه عهد الأمان والإجارة المقدسة',
        description: 'Uphold the honor of the valley; his kinsmen gift arms in gratitude.',
        arDescription: 'رفع شأن القرية بين القبائل؛ وأهله يرسلون هدية من البنادق عرفاناً بالجميل.',
        costText: '+12 Prestige, +5 Arms, -15 Grain',
        arCostText: '+12 هيبة · +5 بنادق · -15 حبوب',
      },
      {
        id: 'refuse_refuge',
        label: 'Escort Him Beyond the Pass',
        arLabel: 'مرافقته بأمان إلى خارج حدود القرية',
        description: 'Avoid entanglement in a neighbor’s feud.',
        arDescription: 'تجنب الدخول في خصومات مع القبائل المجاورة وكسب رضا المخزن.',
        costText: '-5 Prestige, +4 Makhzen Favor',
        arCostText: '-5 هيبة · +4 رضا المخزن',
      },
    ],
  },
  {
    id: 'locust_swarm',
    title: 'Red Locusts on the South Wind',
    arTitle: 'أسراب الجراد الأحمر تهب مع رياح الجنوب',
    season: 'summer',
    description:
      'The sky darkens over the Chergui wind as a swarm of desert locusts descends toward the ripening summer wheat terraces.',
    arDescription:
      'أظلم الأفق مع هبوب رياح الشرقي إثر قدوم أسراب الجراد الصحراوي نحو مدرجات القمح والشعير الناضجة في سهل سوس.',
    historicalContext:
      'Locust plagues in 1867–1869 compounded drought across southern and central Morocco, making community-wide defense of terraced crops vital.',
    arHistoricalContext:
      'شكّلت أسراب الجراد بين 1867 و1870م تحدياً كبيراً لفلاحي سوس ماسة، حيث كان الأهالي يقرعون الأواني النحاسية ويوقدون الدخان لحماية الحقول.',
    choices: [
      {
        id: 'mobilize_all',
        label: 'Ring Copper Pans & Smoke the Terraces',
        arLabel: 'استنفار جميع الأسر بقرع النحاس وإشعال الدخان',
        description: 'Pull every household from building and crafts to beat back the swarm.',
        arDescription: 'خروج جميع أهالي القرية لطرد الجراد وحماية المحصول الرئيسي.',
        costText: '-15 Timber, -15 Grain, saves the main harvest (+4 Prestige)',
        arCostText: '-15 أخشاب · -15 حبوب · حماية المحصول (+4 هيبة)',
      },
      {
        id: 'endure_swarm',
        label: 'Protect Only the Inner Gardens',
        arLabel: 'حماية البساتين الداخلية فقط',
        description: 'Retreat to the walled orchards while the outer wheat takes heavy losses.',
        arDescription: 'التحصن في البساتين المسورة بينما تتضرر حقول القمح الخارجية.',
        costText: '-55 Grain, +8 Unrest',
        arCostText: '-55 حبوب · +8 توتر',
      },
    ],
  },
  {
    id: 'wedding_feast',
    title: 'An Alliance Wedding in the Valley',
    arTitle: 'عرس ومصاهرة قبلية كبرى في الوادي',
    season: 'autumn',
    description:
      'An elder proposes a marriage between your valley’s leading lineage and a respected neighboring clan to seal an enduring pact.',
    arDescription:
      'اقترح شيوخ الجماعة عقد مصاهرة بين كبرى سلالات قريتك وعشيرة مجاورة مرموقة لتوثيق أواصر التحالف والسلم.',
    historicalContext:
      'Autumn after the walnut harvest was the traditional season for three-day Amazigh weddings featuring ahwach & ahidous circle dances and inter-valley pacts (tada).',
    arHistoricalContext:
      'كان فصل الخريف بعد جني المحاصيل موسم الأعراس الأمازيغية الكبرى التي تمتد ثلاثة أيام بأهازيج أحواش وتوقيع أحلاف التاضا.',
    choices: [
      {
        id: 'sponsor_feast',
        label: 'Sponsor a Three-Day Ahwach Feast',
        arLabel: 'رعاية وليمة عرس كبرى وأهازيج أحواش لثلاثة أيام',
        description: 'Provide grain, mutton, and silver jewelry to honor both valleys.',
        arDescription: 'تقديم الحبوب والذبائح والحلي الفضية السوسية لتشريف القريتين.',
        costText: '-25 Grain, -15 Silver, +14 Prestige, -10 Unrest',
        arCostText: '-25 حبوب · -15 فضة · +14 هيبة · -10 توتر',
        minSilver: 15,
      },
      {
        id: 'simple_ceremony',
        label: 'Hold a Modest Family Blessing',
        arLabel: 'إقامة حفل عائلي متواضع ومباركة في المسجد',
        description: 'Keep the celebration quiet and conserve the valley treasury.',
        arDescription: 'الاحتفال ببساطة والحفاظ على مدخرات القرية من الفضة والحبوب.',
        costText: '-8 Grain, +3 Prestige',
        arCostText: '-8 حبوب · +3 هيبة',
      },
    ],
  },
  {
    id: 'mahalla_rumor',
    title: 'Rumors of the Sultan’s Mahalla',
    arTitle: 'أنباء عن تحرك محلة السلطان نحو سوس',
    season: 'spring',
    description:
      'Muleteers from Marrakesh bring word that Sultan Sidi Mohammed IV’s tax expedition is assembling tents and brass cannon on the Haouz plain.',
    arDescription:
      'نقل المكارية القادمون من مراكش وتارودانت أنباءً بأن محلة السلطان سيدي محمد الرابع تنصب خيامها وتجهز المدافع النحاسية للقدوم صيفاً.',
    historicalContext:
      'Before the summer mahalla marched into the foothills, mountain communities debated whether to send envoys with gifts or stockpile powder in their watchtowers.',
    arHistoricalContext:
      'قبيل قدوم المحلة السلطانية صيفاً، كانت مجالس الجماعة تتشاور بين إرسال الهدايا والوفود المسبقة أو تعزيز الأبراج والبارود.',
    choices: [
      {
        id: 'prepare_gifts',
        label: 'Send Woven Carpets & Envoys Ahead',
        arLabel: 'إرسال وفد مسبق بالزرابي السوسية والفضة',
        description: 'Cultivate goodwill with the court chamberlains before the column arrives.',
        arDescription: 'كسب ودّ حجّاب البلاط السلطاني قبل وصول المحلة إلى مشارف الوادي.',
        costText: '-5 Textiles, -10 Silver, +12 Makhzen Favor',
        arCostText: '-5 زرابي · -10 فضة · +12 رضا المخزن',
      },
      {
        id: 'fortify_towers',
        label: 'Stockpile Powder & Repair the Towers',
        arLabel: 'تخزين البارود وتدعيم أبراج المراقبة بالحجر',
        description: 'Demonstrate that our mountain pass is costly to force.',
        arDescription: 'إظهار منعة القرية وقوة دفاعاتها أمام أي حملة عسكرية.',
        costText: '-15 Stone, +6 Arms, +6 Prestige, -6 Makhzen Favor',
        arCostText: '-15 حجارة · +6 بنادق · +6 هيبة · -6 رضا المخزن',
      },
    ],
  },
  {
    id: 'spring_flood',
    title: 'Spring Thaw Damages the Main Seguia',
    arTitle: 'سيول الربيع تصدّع قناة الساقية الرئيسية',
    season: 'spring',
    description:
      'Rapid snowmelt carries boulders down the gorge, breaching the dry-stone retaining wall of the primary irrigation channel.',
    arDescription:
      'حملت سيول الربيع الغزيرة صخوراً كبيرة من أعالي الوادي، مما أدى إلى تصدع الجدار الحجري لقناة الساقية الرئيسية.',
    historicalContext:
      'Every spring required collective corvée labor (tiwizi) where each household contributed stone and timber to keep water flowing to the terraces.',
    arHistoricalContext:
      'في كل ربيع، كانت الأسر تجتمع في عمل تعاوني جماعي (تيويزي) لترميم السواقي بالحجارة والأخشاب لضمان ري الحقول.',
    choices: [
      {
        id: 'repair_now',
        label: 'Call Tiwizi Collective Repair Immediately',
        arLabel: 'الدعوة الفورية لعمل تعاوني (تيويزي) لترميم الساقية بالحجر',
        description: 'Spend stone and timber now so spring barley receives full water.',
        arDescription: 'استخدام الحجارة والأخشاب فوراً ليتدفق الماء كاملاً نحو حقول الشعير.',
        costText: '-15 Stone, -10 Timber, +20 Grain bonus, +5 Prestige',
        arCostText: '-15 حجارة · -10 أخشاب · +20 حبوب إضافية · +5 هيبة',
      },
      {
        id: 'patch_mud',
        label: 'Patch with Packed Earth for Now',
        arLabel: 'ترقيع القناة مؤقتاً بالطين المدكوك',
        description: 'Save stone, though some water leaks away before harvest.',
        arDescription: 'توفير الحجارة حالياً رغم تسرب جزء من مياه الري قبل الحصاد.',
        costText: '-15 Earth, -20 Grain',
        arCostText: '-15 طين · -20 حبوب',
      },
    ],
  },
  {
    id: 'summer_drought',
    title: 'Hot Chergui Wind & Shrinking Springs',
    arTitle: 'رياح الشرقي الحارة وتراجع منسوب العيون',
    season: 'summer',
    description:
      'Weeks of scorching wind from the Sahara shrink the river to a trickle. The upper pastures parch early.',
    arDescription:
      'أدت أسابيع من رياح الشرقي الجافة إلى انخفاض منسوب وادي سوس ماسة وجفاف المراعي مبكراً.',
    historicalContext:
      'Periodic droughts in the late 1860s tested the resilience of Souss-Massa and High Atlas communities and their high-altitude transhumance pastures (azib).',
    arHistoricalContext:
      'اختبرت موجات الجفاف أواخر ستينيات القرن التاسع عشر قدرة قرى سوس والأطلس على تنظيم الرعي في المراعي الجبلية العليا (العزيب).',
    choices: [
      {
        id: 'move_flocks_early',
        label: 'Drive Flocks to the High Azib Early',
        arLabel: 'إرسال القطعان مبكراً إلى مراعي العزيب العليا',
        description: 'Send shepherds and guards up to the snowline springs.',
        arDescription: 'إرسال الرعاة والحراس مع الماشية إلى العيون الجبلية الباردة لحمايتها.',
        costText: '-10 Silver, Flocks preserved (+4 Prestige)',
        arCostText: '-10 فضة · الحفاظ على القطعان (+4 هيبة)',
      },
      {
        id: 'ration_water',
        label: 'Prioritize Grain Terraces Over Pastures',
        arLabel: 'توجيه كل مياه السواقي لحقول القمح والشعير',
        description: 'Divert every drop to the wheat fields; some sheep are culled for meat.',
        arDescription: 'إنقاذ محصول القمح على حساب المراعي وتحويل بعض الشياه إلى لحم مقدد (الخليع).',
        costText: '-6 Flocks, +20 Grain',
        arCostText: '-6 من القطعان · +20 حبوب',
      },
    ],
  },
];

export function buildMahallaEvent(state: ValleyState): EventCard {
  const annualGrain = state.households * GAME_CONFIG.ANNUAL_GRAIN_PER_HOUSEHOLD;
  const grainTribute = Math.max(35, Math.round(annualGrain * GAME_CONFIG.MAHALLA_GRAIN_RATE));
  const silverTribute = Math.round(GAME_CONFIG.MAHALLA_BASE_SILVER * (1 + state.households / 12));
  const flockTribute = Math.max(4, Math.round(GAME_CONFIG.MAHALLA_BASE_FLOCKS * (state.households / 6)));

  return {
    id: `mahalla_${state.year}`,
    title: `The Sultan’s Mahalla of ${state.year}`,
    arTitle: `قدوم المحلة السلطانية الشريفة لسنة ${state.year}م`,
    season: 'summer',
    isMahalla: true,
    description: `Drums echo in the lower gorge. The mahalla expedition of Sultan Sidi Mohammed IV has pitched its imperial pavilions and demands customary tribute from ${state.name}: ${grainTribute} Grain, ${silverTribute} Silver, and ${flockTribute} Flocks.`,
    arDescription: `تدوي طبول المخزن عند مشارف سهل سوس ماسة؛ فقد نصبت محلة السلطان سيدي محمد الرابع خيامها السلطانية وتطالب قريتك (${state.name}) بأداء واجب الزكاة والنائبة: ${grainTribute} من الحبوب، و${silverTribute} من الفضة، و${flockTribute} من القطعان.`,
    historicalContext:
      'The mahalla was the mobile royal camp that toured Moroccan regions to collect taxes (naiba and zakat), confirm loyal qaids, and assert Bled al-Makhzen authority over autonomous tribes.',
    arHistoricalContext:
      'كانت المحلة السلطانية معسكراً ملكياً متنقلاً يجوب الأقاليم المغربية لجمع الزكاة والنائبة، وتثبيت القياد الموالين بظهائر شريفة، وتأكيد سيادة دار المخزن.',
    choices: [
      {
        id: 'pay_full',
        label: 'Pay Tribute in Full',
        arLabel: 'أداء الزكاة والنائبة السلطانية كاملةً',
        description: 'Send mule trains with the full assessment and receive the royal seal of goodwill.',
        arDescription: 'إرسال القوافل بالمطالب كاملة ونيل الخاتم السلطاني ورفع رضا المخزن.',
        costText: `-${grainTribute} Grain, -${silverTribute} Silver, -${flockTribute} Flocks · +15 Makhzen Favor`,
        arCostText: `-${grainTribute} حبوب · -${silverTribute} فضة · -${flockTribute} قطعان · +15 رضا المخزن`,
      },
      {
        id: 'negotiate_gifts',
        label: 'Negotiate with Customary Gifts',
        arLabel: 'التفاوض وتقديم هدايا للوزراء والكتّاب',
        description: 'Offer half the tribute alongside fine carpets and silver for the vizier’s scribes.',
        arDescription: 'دفع نصف الحصة المقررة مع هدايا من الفضة والزرابي لحجّاب المحلة.',
        costText: `-${Math.round(grainTribute * 0.5)} Grain, -${Math.round(silverTribute * 0.65)} Silver · +5 Favor, -3 Prestige`,
        arCostText: `-${Math.round(grainTribute * 0.5)} حبوب · -${Math.round(silverTribute * 0.65)} فضة · +5 رضا المخزن · -3 هيبة`,
      },
      {
        id: 'send_scholar',
        label: 'Send the Zawiya Marabout to Mediate',
        arLabel: 'إرسال فقيه الزاوية العلمية للشفاعة والوساطة',
        description: 'Plead mountain hardship through the respected saintly lodge (Requires Mosque & Zawiya).',
        arDescription: 'طلب الإعفاء باسم الزاوية العلمية الموقرة (يتطلب بناء المسجد والزاوية).',
        costText: `-10 Silver · +6 Favor, +4 Prestige (25% chance of displeasure)`,
        arCostText: `-10 فضة · +6 رضا المخزن · +4 هيبة (احتمال 25% لرفض الشفاعة)`,
        requiresBuilding: 'mosque_zawiya',
      },
      {
        id: 'refuse_fortify',
        label: 'Refuse Tribute & Bar the Mountain Pass',
        arLabel: 'رفض الجباية وإغلاق المسالك والتحصن بالأكادير',
        description: 'Stand as free Bled al-Siba! High honor among tribes, but risks a punitive raid if Favor is low.',
        arDescription: 'الامتناع عن الدفع وإعلان الاستقلال القبلي؛ يرفع الهيبة كثيراً لكنه يخفض رضا المخزن.',
        costText: `-18 Makhzen Favor, +14 Prestige`,
        arCostText: `-18 رضا المخزن · +14 هيبة قبليّة`,
      },
    ],
  };
}

export function pickMonthlyEvent(state: ValleyState): EventCard {
  const candidates = STARTER_EVENTS.filter(
    (e) => e.season === 'any' || e.season === state.season
  );
  const idx =
    Math.abs(state.year * 17 + state.gameDaysElapsed * 31 + state.buildings.length * 7) %
    candidates.length;
  return candidates[idx];
}

export function resolveEventChoice(
  state: ValleyState,
  event: EventCard,
  choiceId: string
): { nextState: ValleyState; summary: string; arSummary: string } {
  const next: ValleyState = {
    ...state,
    resources: { ...state.resources },
    meters: { ...state.meters },
    reports: [...state.reports],
    activeEvent: null,
  };

  let summary = '';
  let arSummary = '';

  if (event.isMahalla) {
    const annualGrain = state.households * GAME_CONFIG.ANNUAL_GRAIN_PER_HOUSEHOLD;
    const grainTribute = Math.max(35, Math.round(annualGrain * GAME_CONFIG.MAHALLA_GRAIN_RATE));
    const silverTribute = Math.round(GAME_CONFIG.MAHALLA_BASE_SILVER * (1 + state.households / 12));
    const flockTribute = Math.max(4, Math.round(GAME_CONFIG.MAHALLA_BASE_FLOCKS * (state.households / 6)));

    if (choiceId === 'pay_full') {
      next.resources.grain = Math.max(0, next.resources.grain - grainTribute);
      next.resources.silver = Math.max(0, next.resources.silver - silverTribute);
      next.resources.flocks = Math.max(0, next.resources.flocks - flockTribute);
      next.meters.makhzenFavor = Math.min(100, next.meters.makhzenFavor + 15);
      summary = `Paid full mahalla tribute (${grainTribute} grain, ${silverTribute} silver, ${flockTribute} flocks). Makhzen Favor rose by +15.`;
      arSummary = `تم أداء واجب المحلة السلطانية كاملاً (${grainTribute} حبوب، ${silverTribute} فضة، ${flockTribute} قطعان)، وارتفع رضا المخزن بمقدار +15.`;
    } else if (choiceId === 'negotiate_gifts') {
      const g = Math.round(grainTribute * 0.5);
      const s = Math.round(silverTribute * 0.65);
      next.resources.grain = Math.max(0, next.resources.grain - g);
      next.resources.silver = Math.max(0, next.resources.silver - s);
      next.meters.makhzenFavor = Math.min(100, next.meters.makhzenFavor + 5);
      next.meters.prestige = Math.max(0, next.meters.prestige - 3);
      summary = `Negotiated reduced mahalla tribute (${g} grain, ${s} silver). Favor +5, Prestige -3.`;
      arSummary = `تم التفاوض على تخفيض جباية المحلة (${g} حبوب، ${s} فضة). رضا المخزن +5، الهيبة -3.`;
    } else if (choiceId === 'send_scholar') {
      next.resources.silver = Math.max(0, next.resources.silver - 10);
      const roll = ((state.year * 37 + state.households * 13) % 100) / 100;
      if (roll < 0.75) {
        next.meters.makhzenFavor = Math.min(100, next.meters.makhzenFavor + 6);
        next.meters.prestige += 4;
        summary = `The Zawiya marabout’s intercession moved the Sultan’s chamberlain. Tribute waived with honor (+6 Favor, +4 Prestige).`;
        arSummary = `نجحت وساطة فقيه الزاوية لدى حاجب السلطان، فأُعفيت القرية بتقديرٍ وشرف (+6 رضا المخزن، +4 هيبة).`;
      } else {
        next.meters.makhzenFavor = Math.max(0, next.meters.makhzenFavor - 8);
        summary = `The commander rejected the scholar’s plea and departed in displeasure (-8 Favor).`;
        arSummary = `رفض قائد المحلة شفاعة الوفد وغادر مستاءً (-8 رضا المخزن).`;
      }
    } else {
      // refuse_fortify
      next.meters.makhzenFavor = Math.max(0, next.meters.makhzenFavor - 18);
      next.meters.prestige += 14;
      if (next.meters.makhzenFavor < 25) {
        const lostGrain = Math.round(next.resources.grain * 0.12);
        const lostFlocks = Math.round(next.resources.flocks * 0.1);
        next.resources.grain = Math.max(0, next.resources.grain - lostGrain);
        next.resources.flocks = Math.max(0, next.resources.flocks - lostFlocks);
        summary = `You defied the mahalla (+14 Prestige, -18 Favor). Because Favor was critically low, a punitive detachment skirmished in the lower valley (-${lostGrain} grain, -${lostFlocks} flocks).`;
        arSummary = `رفضت جباية المحلة (+14 هيبة، -18 رضا المخزن). وبسبب تدني رضا المخزن، شنّت سرية عقابية غارة على أطراف السهل (-${lostGrain} حبوب، -${lostFlocks} قطعان).`;
      } else {
        summary = `You barred the mountain pass and refused tribute! The tribes praise your defiance (+14 Prestige, -18 Makhzen Favor).`;
        arSummary = `أغلقت المسالك وامتنعت عن دفع الجباية! أشادت القبائل بشجاعتك واستقلالك (+14 هيبة، -18 رضا المخزن).`;
      }
    }
  } else {
    switch (choiceId) {
      case 'smudge_fires':
        next.resources.timber = Math.max(0, next.resources.timber - 15);
        next.resources.walnuts += 15;
        next.meters.prestige += 3;
        summary = 'Smudge fires saved the walnut harvest (+15 Walnuts, +3 Prestige).';
        arSummary = 'أنقذت مشاعل الحطب الليلية محصول الجوز والأركان من الصقيع (+15 جوز وأركان، +3 هيبة).';
        break;
      case 'accept_loss':
        next.resources.walnuts = Math.max(0, next.resources.walnuts - 10);
        next.meters.unrest = Math.min(100, next.meters.unrest + 4);
        summary = 'Early frost damaged the outer walnut groves (-10 Walnuts, +4 Unrest).';
        arSummary = 'ألحق الصقيع المبكر أضراراً ببساتين الجوز الخارجية (-10 جوز وأركان، +4 توتر).';
        break;
      case 'host_scholar':
        next.resources.grain = Math.max(0, next.resources.grain - 20);
        next.meters.prestige += 10;
        next.meters.unrest = Math.max(0, next.meters.unrest - 4);
        summary = 'Hosted the scholar from Fez with generous hospitality (+10 Prestige, -4 Unrest).';
        arSummary = 'أكرمت وفادة العالم الفاسي في دار تغرمت فبارك المجلس (+10 هيبة، -4 توتر).';
        break;
      case 'send_on':
        next.meters.prestige = Math.max(0, next.meters.prestige - 3);
        summary = 'Turned away the traveling scholar (-3 Prestige).';
        arSummary = 'اعتذرت عن استضافة الفقيه الرحّالة لضيق المؤونة (-3 هيبة).';
        break;
      case 'call_marabout':
        next.resources.silver = Math.max(0, next.resources.silver - 10);
        next.meters.prestige += 8;
        next.meters.unrest = Math.max(0, next.meters.unrest - 8);
        summary = 'The marabout resolved the seguia water dispute peacefully (+8 Prestige, -8 Unrest).';
        arSummary = 'حسم شيخ الزاوية نزاع نوبات مياه الساقية بالصلح والعدل (+8 هيبة، -8 توتر).';
        break;
      case 'judge_yourself':
        next.meters.prestige += 3;
        next.meters.unrest = Math.min(100, next.meters.unrest + 5);
        summary = 'Adjudicated the water turns by strict urf custom (+3 Prestige, +5 Unrest).';
        arSummary = 'حكمت في توزيع مياه الساقية بصرامة وفق العرف (+3 هيبة، +5 توتر).';
        break;
      case 'organize_hunt':
        next.resources.arms = Math.max(0, next.resources.arms - 3);
        next.meters.prestige += 6;
        summary = 'Valley guards drove the wolf pack from the ridges (+6 Prestige).';
        arSummary = 'طرد حراس القرية قطيع الذئاب بعيداً عن المراعي والحظائر (+6 هيبة).';
        break;
      case 'hire_shepherds':
        next.resources.timber = Math.max(0, next.resources.timber - 12);
        next.resources.flocks = Math.max(0, next.resources.flocks - 4);
        summary = 'Kept watch fires burning; wolves took 4 sheep before retreating.';
        arSummary = 'أوقد الرعاة نيران الحراسة طوال الليل، وافترست الذئاب 4 شياه قبل فرارها.';
        break;
      case 'trade_walnuts':
        next.resources.walnuts = Math.max(0, next.resources.walnuts - 15);
        next.resources.silver += 28;
        next.resources.arms += 5;
        next.meters.prestige += 4;
        summary = 'Traded walnuts with the Mogador caravan for +28 Silver and +5 Arms.';
        arSummary = 'تمت مقايضة الجوز والأركان مع قافلة الصويرة مقابل +28 فضة و+5 بنادق (+4 هيبة).';
        break;
      case 'modest_hospitality':
        next.resources.silver += 10;
        summary = 'Collected +10 Silver in souk transit tolls from the Mogador caravan.';
        arSummary = 'تم تحصيل +10 فضة رسوم عبور قافلة الصويرة في السوق الأسبوعي.';
        break;
      case 'open_agadir_stores':
        next.resources.grain = Math.max(0, next.resources.grain - 35);
        next.meters.prestige += 6;
        next.meters.unrest = Math.max(0, next.meters.unrest - 6);
        summary = 'Opened grain reserves during the blizzard (+6 Prestige, -6 Unrest).';
        arSummary = 'فُتحت مخازن الحبوب لإطعام الأسر خلال العاصفة الثلجية (+6 هيبة، -6 توتر).';
        break;
      case 'strict_rationing':
        next.resources.grain = Math.max(0, next.resources.grain - 10);
        next.meters.unrest = Math.min(100, next.meters.unrest + 9);
        summary = 'Enforced strict winter rationing during the pass closure (+9 Unrest).';
        arSummary = 'فُرض تقنين صارم على الحبوب خلال انغلاق الممر الجبلي (+9 توتر).';
        break;
      case 'grant_refuge':
        next.resources.grain = Math.max(0, next.resources.grain - 15);
        next.resources.arms += 5;
        next.meters.prestige += 12;
        summary = 'Granted sacred zetata sanctuary to the fugitive (+12 Prestige, +5 Arms).';
        arSummary = 'منحت الإجارة وحماية الزطاطة للمستجير فأهدتك عشيرته السلاح (+12 هيبة، +5 بنادق).';
        break;
      case 'refuse_refuge':
        next.meters.prestige = Math.max(0, next.meters.prestige - 5);
        next.meters.makhzenFavor = Math.min(100, next.meters.makhzenFavor + 4);
        summary = 'Declined sanctuary to avoid a tribal feud (-5 Prestige, +4 Makhzen Favor).';
        arSummary = 'تجنبت النزاع القبلي ورافقت الفارس خارج الحدود (-5 هيبة، +4 رضا المخزن).';
        break;
      case 'mobilize_all':
        next.resources.timber = Math.max(0, next.resources.timber - 15);
        next.resources.grain = Math.max(0, next.resources.grain - 15);
        next.meters.prestige += 4;
        summary = 'Mobilized every household with smoke and copper pans to drive off the locust swarm (+4 Prestige).';
        arSummary = 'استنفرت جميع الأسر بالدخان وقرع الأواني النحاسية لطرد الجراد وحماية المحصول (+4 هيبة).';
        break;
      case 'endure_swarm':
        next.resources.grain = Math.max(0, next.resources.grain - 55);
        next.meters.unrest = Math.min(100, next.meters.unrest + 8);
        summary = 'Locusts stripped the outer terraces (-55 Grain, +8 Unrest).';
        arSummary = 'أتلف سرب الجراد حقول الحبوب الخارجية (-55 حبوب، +8 توتر).';
        break;
      case 'sponsor_feast':
        next.resources.grain = Math.max(0, next.resources.grain - 25);
        next.resources.silver = Math.max(0, next.resources.silver - 15);
        next.meters.prestige += 14;
        next.meters.unrest = Math.max(0, next.meters.unrest - 10);
        summary = 'Sponsored a three-day ahwach wedding feast (+14 Prestige, -10 Unrest).';
        arSummary = 'رعيت وليمة عرس كبرى وأهازيج أحواش لثلاثة أيام (+14 هيبة، -10 توتر).';
        break;
      case 'simple_ceremony':
        next.resources.grain = Math.max(0, next.resources.grain - 8);
        next.meters.prestige += 3;
        summary = 'Held a modest wedding blessing (+3 Prestige).';
        arSummary = 'أقيمت مباركة زواج عائلية متواضعة (+3 هيبة).';
        break;
      case 'prepare_gifts':
        next.resources.textiles = Math.max(0, next.resources.textiles - 5);
        next.resources.silver = Math.max(0, next.resources.silver - 10);
        next.meters.makhzenFavor = Math.min(100, next.meters.makhzenFavor + 12);
        summary = 'Sent woven carpets and silver ahead to the royal camp (+12 Makhzen Favor).';
        arSummary = 'أرسلت الزرابي السوسية والفضة إلى معسكر السلطان (+12 رضا المخزن).';
        break;
      case 'fortify_towers':
        next.resources.stone = Math.max(0, next.resources.stone - 15);
        next.resources.arms += 6;
        next.meters.prestige += 6;
        next.meters.makhzenFavor = Math.max(0, next.meters.makhzenFavor - 6);
        summary = 'Fortified the watchtowers and stockpiled powder (+6 Arms, +6 Prestige, -6 Favor).';
        arSummary = 'حصّنت أبراج المراقبة وخزنت البارود والبنادق (+6 بنادق، +6 هيبة، -6 رضا المخزن).';
        break;
      case 'repair_now':
        next.resources.stone = Math.max(0, next.resources.stone - 15);
        next.resources.timber = Math.max(0, next.resources.timber - 10);
        next.resources.grain += 20;
        next.meters.prestige += 5;
        summary = 'Completed collective tiwizi repairs on the main seguia (+20 Grain, +5 Prestige).';
        arSummary = 'أنجز الأهالي ترميم الساقية الرئيسية بالتعاون الجماعي (تيويزي) (+20 حبوب، +5 هيبة).';
        break;
      case 'patch_mud':
        next.resources.earth = Math.max(0, next.resources.earth - 15);
        next.resources.grain = Math.max(0, next.resources.grain - 20);
        summary = 'Patched the seguia with packed earth; water leakage reduced harvest (-20 Grain).';
        arSummary = 'تم ترقيع الساقية بالطين مؤقتاً، وأدى تسرب المياه لنقص المحصول (-20 حبوب).';
        break;
      case 'move_flocks_early':
        next.resources.silver = Math.max(0, next.resources.silver - 10);
        next.meters.prestige += 4;
        summary = 'Moved flocks early to the high snowline azib pastures (+4 Prestige).';
        arSummary = 'انتقلت القطعان مبكراً إلى مراعي العزيب الجبلية فحُفظت الماشية (+4 هيبة).';
        break;
      case 'ration_water':
        next.resources.flocks = Math.max(0, next.resources.flocks - 6);
        next.resources.grain += 20;
        summary = 'Prioritized terrace water and culled 6 sheep for dried meat (+20 Grain).';
        arSummary = 'وُجّهت مياه الري لحقول الحبوب وحُولت 6 شياه إلى مؤونة غذائية (+20 حبوب).';
        break;
      default:
        summary = 'The jemaa recorded your decision.';
        arSummary = 'سجّل مجلس الجماعة قرارك في سجل القرية.';
    }
  }

  // Sync prestige into resources.prestige and check Qaid recognition
  next.resources.prestige = next.meters.prestige;
  if (
    next.meters.makhzenFavor >= GAME_CONFIG.QAID_FAVOR_THRESHOLD &&
    next.meters.prestige >= GAME_CONFIG.QAID_PRESTIGE_THRESHOLD
  ) {
    next.isQaid = true;
  }

  next.reports.unshift({
    id: `rep_evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    gameYear: next.year,
    season: next.season,
    category: event.isMahalla ? 'mahalla' : 'event',
    title: event.title,
    arTitle: event.arTitle || event.title,
    summary,
    arSummary,
    read: false,
  });

  return { nextState: next, summary, arSummary };
}
