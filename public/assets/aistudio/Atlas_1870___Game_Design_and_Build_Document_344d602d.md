# Atlas 1870 — Game Design and Build Document

*A free, browser-based 3D tribal management game set in the High Atlas of Morocco in 1870. Written so you can hand it to Google AI Studio one stage at a time.*

## 1. Vision

You are the amghar (chosen chief) of an Amazigh (Berber) mountain community in the High Atlas, 1870. You farm barley and walnuts on terraced fields, store grain in a fortified agadir, keep flocks, manage your relationship with the Sultan's court (the Makhzen) and with rival tribes, and defend your valley. Other real players run their own valleys in the same world. You can visit them, trade with them, ally with them, or raid them.

**Design pillars**

- Survive the seasons. Water, harvest and winter decide everything.
- Honor and politics matter as much as stone and grain.
- Calm, check-in-a-few-times-a-day play. Nothing needs fast reflexes.
- Beautiful, believable mountain architecture: rammed-earth towers, terraces, walnut groves, snow peaks.
- Free forever: no ads, no pay-to-win.

## 2. The key decision: asynchronous multiplayer

Live multiplayer, where everyone sees everyone move in real time, needs a game server and costs money. Your concept (each player has a valley, others visit, trade and raid) does not need it. Build it asynchronously:

- Each valley is a saved document in a database.
- Production is time-based. The game stores a timestamp and calculates what happened while you were away, like most city and idle games.
- Visiting another valley loads their saved state in read-only 3D.
- Trades and raids are orders with arrival times. They are resolved when a client next processes them.

This keeps the game free, scalable, and still truly multiplayer. Live chat or live presence can be added later.

**Recommended stack**

- Three.js for the 3D world.
- Firebase on the free Spark plan: Authentication (Google sign-in), Firestore (database), Hosting.
- Google AI Studio (Build mode) to generate and iterate the code.

**Free-plan limits to design around**

- Firestore has daily read/write quotas, so the game must save in batches (every 30 seconds and after actions), never every frame.
- Cloud Functions need the paid Blaze plan, so game rules run in players' browsers. A determined cheater could tamper with their own client. Section 9 lists mitigations. For a friendly community this is fine; move rules to Functions later if the game grows.
- Check the current Firebase and AI Studio free limits before launch, because they change.

## 3. Historical setting

Use these anchors for authenticity. Verify details before publishing and add an in-game Historical Notes page.

- **Ruler:** Sultan Sidi Mohammed IV (reigned 1859–1873). Moulay Hassan I succeeds him in 1873. Imperial cities: Fez, Marrakesh, Meknes, Rabat.
- **Bled al-Makhzen and bled al-siba:** land governed by the Sultan (cities, plains) versus mountain and tribal land that largely governed itself. Many High Atlas valleys were siba with varying degrees of loyalty. This tension is the political heart of the game.
- **The mahalla:** the Sultan's military expedition that toured regions to collect taxes and enforce loyalty.
- **Foreign pressure:** Spain defeated Morocco in 1859–60 and imposed a heavy indemnity. Morocco was financially strained. British, French and Spanish merchants and consuls were active in ports like Tangier and Mogador (Essaouira). The 1856 British trade treaty opened trade.
- **Hardship:** the late 1860s brought famine and epidemics, so harvest failure is historically grounded.
- **Society:** Tamazight-speaking communities. The jemaa (assembly of family heads), an amghar chosen by consensus, customary law (urf), saints and religious lodges (zawiyas) whose marabouts mediated disputes. Jewish merchants and artisans were important in trade networks. Portray everyone with respect and without caricature.
- **Architecture:** the tighremt (fortified family house with corner towers), the ighrem or ksar (fortified village), the agadir (collective fortified granary), the kasbah, terraced irrigated fields, seguia (irrigation channels), water mills, rammed-earth (pisé) walls, flat roofs, small windows.
- **Economy:** barley, wheat, walnuts, almonds, apples, sheep, goats, wool, carpets, honey. Flocks move to high summer pastures (azib) and winter lower down. A weekly souk (market). Imported goods: tea, sugar, cotton cloth, gunpowder, rifles.
- **Money:** Spanish silver dollars and Moroccan coins circulated. In game this is simply Silver.

In the game, use fictional tribe and valley names (for example Ait Tamda, Tafza valley) inspired by real naming, so you never misrepresent real tribes.

## 4. Player role and core loop

**Start:** the player picks a display name, a valley name, and a region (a group of up to 30 valleys). They begin with a small village, a few fields, a flock, and a short tutorial.

**Each visit (3–10 minutes)**

1. Check the season, weather and notices (arriving caravans, raids, messages).
2. Collect results and adjust how households are assigned to work.
3. Build or upgrade one thing.
4. Resolve one event card (a decision with consequences).
5. Interact with others: propose a trade, visit a neighbor, pledge a pact, or send a raiding party.
6. Leave. The valley keeps working.

**Long-term goals**

- Grow from a hamlet to a fortified ighrem with an agadir.
- Reach high Prestige and rank in the regional leaderboard.
- Choose a political path: loyal governor (qaid) recognized by the Sultan, or independent lord of the valley.

## 5. Game systems

### 5.1 Time and seasons

All values below are constants in one config file so you can tune them.

- 1 game season = 3 real days. 1 game year = 12 real days.
- **Autumn:** sow barley and wheat, harvest walnuts and apples, dues come due.
- **Winter:** snow closes the high passes (caravan and raid travel time doubled), flocks stay low, food consumption matters most, weaving and repairs.
- **Spring:** snowmelt fills the seguia (water abundant), lambing, barley harvested at the end of spring.
- **Summer:** wheat harvest, flocks go to the azib, drought risk, easiest travel, mahalla season.

### 5.2 Resources

- **Grain** (barley and wheat): feeds households, seed, trade.
- **Water:** a flow value, not stored. Depends on season and seguia level; multiplies field output.
- **Flocks:** sheep and goats; produce wool, meat in emergencies, and are raid targets.
- **Timber:** juniper and cedar.
- **Earth and Stone:** building materials.
- **Walnuts and Almonds:** main cash crops.
- **Textiles:** wool turned into carpets and cloth.
- **Silver:** money for imports and gifts.
- **Arms:** gunpowder and rifles for defense.
- **Prestige:** honor and reputation. Used for ranking and political options.

Storage is split: normal stores can be raided; goods in the Agadir vault are protected.

### 5.3 Population

- The unit is the household (about 5 people).
- Roles set by sliders: farmers, shepherds, builders, guards, artisans.
- Each household eats grain every season. Surplus plus free housing creates growth. Hunger raises Unrest; high Unrest makes households leave.

### 5.4 Buildings (starting costs, three levels each)

| Building | Purpose | Cost (Earth / Timber / Stone / Silver) | Effect |
| --- | --- | --- | --- |
| Tighremt | Housing | 30 / 10 / 0 / 0 | +2 households per level |
| Terrace field | Grain | 20 / 0 / 5 / 0 | Grain at harvest, scaled by water |
| Seguia | Irrigation | 5 / 5 / 25 / 0 | +water; boosts all fields |
| Walnut grove | Cash crop | 0 / 5 / 0 / 5 | Matures after 2 seasons |
| Sheepfold and azib | Flocks | 5 / 15 / 5 / 0 | Flock capacity, wool |
| Water mill | Flour | 0 / 30 / 20 / 0 | Grain feeds 25% further |
| Agadir | Vault | 100 / 40 / 80 / 0 | Protects 40% of stored grain and nuts per level |
| Watchtower | Warning | 40 / 10 / 40 / 0 | Early raid warning, defense bonus |
| Wall and gate | Defense | 40 / 20 / 60 / 0 | Defense multiplier |
| Jemaa square | Politics | 40 / 5 / 10 / 0 | Prestige, event options |
| Mosque and zawiya | Community | 60 / 20 / 20 / 0 | Morale, dispute resolution, scholar |
| Souk | Trade | 20 / 30 / 10 / 20 | Trade slots, market board access |
| Weaving house | Textiles | 10 / 25 / 0 / 0 | Wool becomes carpets |
| Funduq (caravan inn) | Trade routes | 40 / 30 / 30 / 40 | Faster caravans, trade bonus |
| Kasbah | Governance | 150 / 60 / 120 / 100 | Needs Makhzen favor 70+; qaid seat |

Construction takes real time (minutes at low level, hours at high level) and needs builder households.

### 5.5 Event cards

One card per game month, drawn by season and current meters. Each has 2–3 choices with costs and rewards. Starter set of twelve:

1. **Early frost** threatens the walnuts: light smudge fires (spend timber) or accept the loss.
2. **A traveling scholar** asks for hospitality: host him (spend grain, gain Prestige) or send him on.
3. **Water dispute** between two families over irrigation turns: judge it yourself or call the marabout (spend Silver, gain Prestige).
4. **Wolves among the flocks:** organize a hunt or hire extra shepherds.
5. **A trader from Mogador** offers tea, sugar and cloth for walnuts and wool.
6. **Heavy snow** closes the pass: stores are drawn down, trade delayed.
7. **A fugitive from another tribe** asks for refuge: shelter him (gain Prestige, risk a rival's anger) or refuse.
8. **Locusts:** organize everyone to fight them (lose labor) or accept the damage.
9. **A wedding:** pay for the feast and form a pact with a neighbor.
10. **Rumor of the mahalla:** prepare gifts or strengthen the tower.
11. **Spring flood** damages a seguia: repair now or later.
12. **Drought:** ration, dig deeper, or move flocks early.

### 5.6 Politics: the Makhzen

- Two meters: **Makhzen Favor** (0–100) and **Prestige**.
- Once per game year the mahalla visits the region and demands tribute (Silver, grain, livestock). Choices:
  - **Pay in full:** Favor up, resources down.
  - **Negotiate with gifts:** pay part, small Favor gain, small Prestige cost.
  - **Refuse and fortify:** Favor down, Prestige up. If Favor is very low and neighbors are loyal, a punitive expedition can follow (losses to stores and flocks).
  - **Send the scholar to mediate:** needs a mosque and zawiya; cheap, can fail.
- With Favor 70+ and enough Prestige, the Sultan may recognize you as qaid: Prestige bonus, trade bonus, a seat on the Regional Council (see 6). It never gives power over other players' resources.
- Mahalla timing is deterministic from the calendar, so every valley in a region sees the same event.

### 5.7 Rival tribes (NPCs)

Empty slots are filled with NPC valleys generated deterministically from the slot number. Each has a personality (proud, greedy, peaceful) that affects trade prices and how they respond to pacts. This keeps the world alive when few players are online.

### 5.8 Defense and raids

**Formulas** (all constants in config):

- Attack = fighters × (1 + arms bonus) × morale
- Defense = (guards + 0.5 × able households) × (1 + tower + wall bonus) × 1.3 terrain bonus
- Both multiplied by a random factor between 0.85 and 1.15 derived from a seed stored on the raid order, so any client computes the same result.

**Outcomes**

- Attack wins: loot up to 15% of unprotected grain, 10% flocks, 10% Silver. Defender loses some guards.
- Defense wins: attacker loses 30% of fighters; defender gains Prestige.

**Fairness rules**

- New players get a 7-real-day shield.
- A raided valley cannot be raided again for 24 hours.
- One raid per attacker per target per 48 hours.
- No raids on pact allies.
- Raiding a much weaker valley costs the attacker Prestige (it is shameful).
- Agadir vault contents can never be looted.
- Winter doubles travel time, so deep-winter raids are rare.

### 5.9 Trade

- A player posts an offer (give X, want Y) to the regional souk board or sends it directly to a neighbor.
- Offered goods are escrowed in the order using a Firestore transaction, so nothing is duplicated.
- A caravan takes time based on distance. When it arrives, the order settles.
- Gifts work the same way and raise Prestige for both sides over time.

### 5.10 Prestige and ranking

- Gained by: surviving winters without hunger, hosting guests, winning defenses, building a mosque and agadir, honoring pacts, fair trade.
- Lost by: raiding the weak, breaking pacts, famine.
- Leaderboards: region and world.

## 6. Multiplayer rules

- **World:** regions of up to 30 valleys placed on a 2D strategic map. New players are placed in the region with free slots closest to full, so neighbors exist.
- **Visit mode:** tap a neighbor to load their valley in 3D, read-only. You see their buildings and season. Public info only: valley name, display name, Prestige, and a rough strength label (Weak, Moderate, Strong). Exact numbers stay hidden.
- **Actions on a neighbor:** send gift, offer trade, propose pact, send raiders.
- **Regional Council (later):** qaids in a region vote on shared rules such as how harsh the mahalla is.
- **Communication:** preset phrases only at first (greeting, thanks, apology, warning). No free text chat in version 1, so you avoid moderation problems.
- **Safety:** report and block buttons; no real names or emails ever shown; Google sign-in only.

## 7. Art and 3D direction

- **Camera:** RTS-style orbit camera, drag to pan, wheel or pinch to zoom, two-finger rotate, with tilt and zoom limits. Touch support from day one.
- **Terrain:** procedural valley (noise height map), a river through the middle, stepped terrace planes on slopes, a ring of snow-capped ridges as backdrop, sky gradient with time of day.
- **Buildings:** modular meshes with textures. Ochre and red rammed-earth walls, tapering corner towers, flat roofs, tiny dark windows. The agadir is a honeycomb of small storage cells.
- **Materials and assets:** use free CC0 sources (Poly Haven, ambientCG for textures; Kenney and Quaternius for models) and check each license. Start with textured boxes and cylinders, upgrade models later.
- **Season looks:** green terraces in spring, gold in summer, orange walnut leaves in autumn, snow in winter (particles plus white tint).
- **Performance targets:** 30+ fps on a mid-range phone. Under about 200k triangles, instancing for fields and trees, no real-time shadows on mobile (use blob shadows), fog to hide draw distance.
- **Audio:** wind, running water, flock bells, hammering, distant drums. Avoid synthesizing religious recitation; if you want it, use properly licensed recordings and handle respectfully.
- **UI style:** ochre and indigo palette, borders inspired by Amazigh geometric patterns (diamonds, zigzags). A readable sans for body text and a serif for headings. English first; plan for French, Arabic (right-to-left) and Tamazight later.

## 8. Screens

1. Title and sign-in
2. Tutorial (first valley, first harvest)
3. Valley view (3D) with top bar: resources, season, day, notices
4. Build menu (bottom bar)
5. Population panel (sliders)
6. Event card modal
7. Region map
8. Visit mode with action buttons
9. Trade board and orders
10. Reports inbox (trade, raids, events)
11. Politics panel (Makhzen Favor, Prestige, pacts)
12. Leaderboard
13. Settings (language, sound, graphics quality, sign out, block list)
14. Historical Notes

## 9. Technical architecture and data model

**Code layout.** Keep game logic in plain, framework-independent files so it can be tested and reused:

- game/config — every number in the game
- game/tick — the pure time function
- game/raid — raid and trade resolution
- game/events — event cards
- render/ — Three.js scene, camera, models
- net/ — Firebase calls
- ui/ — panels and modals

**The tick function.** tick(valleyState, nowMs) returns a new state. It advances production, consumption, construction, growth, harvests and weather from the stored timestamp. It is deterministic and has unit tests. Offline catch-up is capped at 7 game-days of real time so abandoned valleys do not explode.

**Firestore collections**

- users/{uid}: displayName, createdAt, valleyId, settings, blocked list
- valleys/{valleyId}: ownerUid, name, regionId, slot x and y, lastTick, resources, population and role assignment, buildings (id, type, level, x, z, finishAt), flocks, meters (makhzenFavor, prestige, unrest), shieldUntil, pacts, version
- regions/{regionId}: name, valleyIds, calendar offset
- orders/{orderId}: type (trade, raid, gift, pact), fromValleyId, toValleyId, payload, status (pending, resolved, cancelled), createdAt, arriveAt, resolvedAt, seed
- reports/{valleyId}/items/{id}: results shown in the inbox
- world/state: game epoch and constants version

**Write budget (free quota).** Save the valley at most every 30 seconds and after each action. Use live listeners only on your own orders and reports. Load neighbors once when visiting.

**Security rules, intent**

- A user may write only their own user doc and their own valley.
- Anyone signed in may create an order from their own valley, and read public fields of other valleys.
- Order status may change from pending to resolved exactly once, through a transaction.
- Reports are create-only and shaped by validation rules.

**Anti-cheat on the free plan.** Resolve orders in a transaction on the first client that sees them past arriveAt. Deterministic seeds make results verifiable. Cap how much any single raid or trade can move. Log unusual jumps for review. If cheating becomes a problem, move resolution to Cloud Functions on the Blaze plan (pay-as-you-go with a free allowance).

## 10. Build plan for Google AI Studio

Do one stage at a time. Test it in the preview, fix problems, then move on.

**Paste this before every stage**

```
Keep every existing feature working. Do not rewrite files I did not mention. Put every game number in game/config. Keep game logic in plain files separate from rendering. At the end, tell me in three lines what changed and how to test it. Use no paid services.
```

**Stage 1: 3D scene**

```
Build a web app with a Three.js scene: a procedurally generated High Atlas valley (noise height map, a river down the middle, terraced slopes, a ring of distant snowy ridges), warm afternoon light, fog and a sky gradient. Add an RTS-style orbit camera: drag to pan, wheel or pinch to zoom, two-finger rotate, with tilt and zoom limits. It must run at 30 fps on a mid-range phone: no real-time shadows, use instancing for repeated objects. Add a debug FPS counter.
```

**Stage 2: building placement**

```
Add a bottom build menu with: tighremt, terrace field, seguia, walnut grove, sheepfold, water mill, agadir, watchtower, wall and gate, jemaa square, mosque and zawiya, souk, weaving house. Each has a placeholder mesh (boxes and cylinders with a rammed-earth texture generated on a canvas), a grid footprint, placement rules (slope limit, no overlap, mill must be near water), a ghost preview that is green or red, and rotation with the R key. Costs and sizes come from game/config using the table I provide. Store buildings in a state object.
```

**Stage 3: economy and time**

```
Implement game/tick as a pure function tick(state, nowMs). 1 game season = 3 real days. Include resources, households and roles (sliders), growth and hunger, barley harvest at the end of spring, wheat in summer, walnuts in autumn, construction with finishAt, and offline catch-up capped at 7 days. Add a top bar with resources, season and day, and a population panel. Save to localStorage for now. Add unit tests for tick.
```

**Stage 4: events and politics**

```
Add an event card system: one card per game month from events.json, filtered by season and meters, shown in a modal with 2 to 3 choices and effects. Add the meters Makhzen Favor, Prestige and Unrest. Implement the yearly mahalla event exactly as described in section 5.6 of my design document. Add the twelve starter events from section 5.5.
```

**Stage 5: Firebase accounts and saves**

```
Add Firebase: Google sign-in and Firestore (use Build mode's Firebase integration if it offers one). Replace localStorage with a valleys/{id} document, saved every 30 seconds and after each action, and run tick on load. On first login create the user doc and a starting valley in a region with fewer than 30 valleys. Write Firestore security rules so users can only write their own user doc and valley, and public valley fields are readable by signed-in users.
```

**Stage 6: region map and visiting**

```
Add a region map screen showing the valleys in my region, mine highlighted. Tapping one opens Visit mode: load that valley read-only in 3D, show only public info (valley name, display name, Prestige, strength label Weak, Moderate or Strong). Add a regional leaderboard. Generate NPC valleys deterministically for empty slots.
```

**Stage 7: trade and gifts**

```
Add an orders collection and trade offers with escrow through a Firestore transaction, caravan travel time based on map distance (doubled in winter), a souk board for the region, direct offers to a neighbor, gifts, a reports inbox and a notification badge. Orders settle at arriveAt through a transaction so they resolve exactly once.
```

**Stage 8: raids**

```
Implement raids with the formulas and fairness rules in section 5.8 of my design document: raid orders, travel time, seeded deterministic resolution in a transaction, loot limits, Agadir vault protection, shields, cooldowns, pact protection, Prestige penalty for raiding the weak, reports for both players, and unit tests for the resolution function.
```

**Stage 9: polish**

```
Improve visuals: CC0 textures, better building models, seasonal looks (green spring, gold summer, orange autumn, snow in winter), ambient sound, a tutorial for the first two game days, mobile-friendly UI, a language switch (English first, structure ready for French and Arabic right-to-left), settings, report and block buttons, and the Historical Notes page.
```

**Stage 10: launch**

```
Prepare for launch: Firebase Hosting deploy steps, hardened security rules, a daily read and write quota check with a plan to stay under the free limits, a privacy page, an assets credits page, and a feedback link.
```

## 11. Starting balance numbers

Tune these in config after playtesting.

- **Starting valley:** 6 households, grain 300, Earth 200, Timber 80, Stone 60, Silver 50, flocks 40, Prestige 10, Makhzen Favor 40, 5 terrace fields, 1 tighremt, 1 sheepfold.
- **Food:** a household eats 80 grain per game year. A field yields 100 grain at harvest with normal water; 50 in drought; 130 with a level 2 seguia. Six households need 480 per year and five fields give 500, so the start is deliberately tight and growth requires expansion.
- **Winter:** consumption is 40% of the yearly need, taken from stores. Starvation starts raising Unrest at 0 grain.
- **Growth:** +1 household per season when grain surplus is above 25% of need and housing is free.
- **Mahalla tribute:** about 15% of annual grain, 20 Silver, and 5 sheep, scaled by valley size.

## 12. Testing, safety and launch checklist

- Play the full tutorial yourself and time it.
- Playtest with 3–5 friends in the same region for at least two game seasons.
- Test on a real mid-range phone for frame rate and touch controls.
- Unit tests for tick and raid resolution before multiplayer goes live.
- Report and block tools, preset messages only, no personal data shown.
- Credits page for every CC0 asset used.
- Historical Notes page with sources, and a feedback form for corrections.
- Accessibility: adjustable text size, color-blind-safe meters, sound off by default option.

## 13. After launch

- Live chat and presence, Cloud Functions for authoritative rules, guilds and confederations, weather events across regions, more regions (Rif, Anti-Atlas, Saharan caravan routes), installable app (PWA), more languages.

## 14. Decisions still open

- Game name and logo.
- Which language to ship first besides English.
- How long one real day of progress should feel (the 3-days-per-season setting is a starting guess).
- Whether raiding is on by default for everyone or opt-in per valley (opt-in is gentler for new players).
- Whether to add live chat in version 1 or keep preset messages.
