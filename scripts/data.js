export const zones = [
  {
    id: 'sunlit',
    name: 'Sunlit Zone',
    minDepth: 0,
    maxDepth: 50,
    hasReef: true,
    fogColor: '#03111c',
    fogNear: 15,
    fogFar: 140,
    skyColor: '#4fa8d8',
    groundColor: '#031018',
    ambientIntensity: 0.75,
    directionalIntensity: 0.7,
    floorColor: '#071c29',
    rockColor: '#26404c',
    particleColor: '#8fd9e8'
  },
  {
    id: 'twilight',
    name: 'Twilight Zone',
    minDepth: 50,
    maxDepth: 200,
    hasReef: true,
    fogColor: '#020c16',
    fogNear: 10,
    fogFar: 95,
    skyColor: '#1c4f70',
    groundColor: '#020810',
    ambientIntensity: 0.48,
    directionalIntensity: 0.32,
    floorColor: '#04141e',
    rockColor: '#1c303a',
    particleColor: '#5fb8c9'
  },
  {
    id: 'midnight',
    name: 'Midnight Zone',
    minDepth: 200,
    maxDepth: 1000,
    hasReef: false,
    fogColor: '#010710',
    fogNear: 8,
    fogFar: 65,
    skyColor: '#0c2436',
    groundColor: '#000000',
    ambientIntensity: 0.26,
    directionalIntensity: 0.12,
    floorColor: '#01090f',
    rockColor: '#101c22',
    particleColor: '#4dd8c8'
  },
  {
    id: 'abyssal',
    name: 'Abyssal Zone',
    minDepth: 1000,
    maxDepth: 6000,
    hasReef: false,
    fogColor: '#00040a',
    fogNear: 6,
    fogFar: 48,
    skyColor: '#04121a',
    groundColor: '#000000',
    ambientIntensity: 0.16,
    directionalIntensity: 0.05,
    floorColor: '#00060c',
    rockColor: '#0a1318',
    particleColor: '#3ba896'
  },
  {
    id: 'hadal',
    name: 'Hadal Zone',
    minDepth: 6000,
    maxDepth: 8000,
    hasReef: false,
    fogColor: '#000103',
    fogNear: 5,
    fogFar: 36,
    skyColor: '#020608',
    groundColor: '#000000',
    ambientIntensity: 0.1,
    directionalIntensity: 0.02,
    floorColor: '#000103',
    rockColor: '#060a0c',
    particleColor: '#2c7d70'
  }
]

export function getZoneForDepth(depth) {
  return zones.find((z) => depth >= z.minDepth && depth < z.maxDepth) || zones[zones.length - 1]
}

// `archetype` picks which low-poly body-plan component in MarineLife.jsx
// renders this entry, and `position`/`scale`/`color` place and style it.
// Entries whose zone isn't reachable yet (midnight/abyssal/hadal — the
// explorable depth range only extends into twilight until the zones phase)
// still get real positions far below, ready for when that range opens up.
export const marineLife = [
  {
    id: 'blue-whale',
    name: 'Blue Whale',
    scientificName: 'Balaenoptera musculus',
    category: 'animal',
    zone: 'sunlit',
    depthMin: 0,
    depthMax: 500,
    habitat: 'Open ocean, worldwide',
    diet: 'Krill',
    size: 'Up to 30m',
    description: 'The largest animal known to have ever lived, filtering huge volumes of krill through baleen plates.',
    facts: ['Its heart alone can weigh as much as a small car.', 'Calls can travel for hundreds of kilometers underwater.'],
    archetype: 'whale',
    position: [40, -20, -30],
    scale: 3.2,
    color: '#4a6fa0'
  },
  {
    id: 'green-sea-turtle',
    name: 'Green Sea Turtle',
    scientificName: 'Chelonia mydas',
    category: 'animal',
    zone: 'sunlit',
    depthMin: 0,
    depthMax: 40,
    habitat: 'Coral reefs and seagrass beds',
    diet: 'Algae and seagrass',
    size: 'Up to 1.5m',
    description: 'One of the few sea turtles that becomes strictly herbivorous as an adult.',
    facts: ['Can hold its breath for several hours while resting.', 'Returns to the beach where it hatched to nest decades later.'],
    archetype: 'turtle',
    position: [-25, -15, 20],
    scale: 1,
    color: '#4a8f5c'
  },
  {
    id: 'great-white-shark',
    name: 'Great White Shark',
    scientificName: 'Carcharodon carcharias',
    category: 'animal',
    zone: 'sunlit',
    depthMin: 0,
    depthMax: 250,
    habitat: 'Coastal and open ocean',
    diet: 'Seals, fish, other sharks',
    size: 'Up to 6m',
    description: 'An apex predator with an exceptional sense of smell and a countershaded body for camouflage.',
    facts: ['Can detect a single drop of blood in a large volume of water.', 'Regularly dives far deeper than most people assume.'],
    archetype: 'shark',
    position: [15, -30, -50],
    scale: 1.6,
    color: '#8f9aa3'
  },
  {
    id: 'clownfish',
    name: 'Clownfish',
    scientificName: 'Amphiprion ocellaris',
    category: 'animal',
    zone: 'sunlit',
    depthMin: 0,
    depthMax: 15,
    habitat: 'Coral reefs, among sea anemones',
    diet: 'Algae and small zooplankton',
    size: 'Up to 11cm',
    description: 'Lives in a mutualistic partnership with sea anemones, gaining protection from predators.',
    facts: ['A mucus coating protects it from the anemone\u2019s sting.', 'All clownfish are born male and can change sex.'],
    archetype: 'fish',
    position: [5, -8, 10],
    scale: 0.4,
    color: '#e8712a'
  },
  {
    id: 'manta-ray',
    name: 'Giant Manta Ray',
    scientificName: 'Mobula birostris',
    category: 'animal',
    zone: 'sunlit',
    depthMin: 0,
    depthMax: 120,
    habitat: 'Open ocean and reef edges',
    diet: 'Plankton',
    size: 'Up to 7m wingspan',
    description: 'A gentle filter feeder that glides through the water using enormous pectoral fins.',
    facts: ['Has the largest brain-to-body ratio of any fish.', 'Individuals are identified by their unique belly spot patterns.'],
    archetype: 'ray',
    position: [-40, -18, -20],
    scale: 1.8,
    color: '#37505e'
  },
  {
    id: 'hammerhead-shark',
    name: 'Great Hammerhead Shark',
    scientificName: 'Sphyrna mokarran',
    category: 'animal',
    zone: 'twilight',
    depthMin: 0,
    depthMax: 300,
    habitat: 'Coastal and open ocean',
    diet: 'Fish, rays, cephalopods',
    size: 'Up to 6m',
    description: 'Its wide, flattened head spreads out sensory organs for detecting prey buried in sand.',
    facts: ['Uses its head to pin stingrays to the seafloor.', 'Has a nearly 360-degree field of vision.'],
    archetype: 'shark',
    position: [30, -45, 25],
    scale: 1.5,
    color: '#7c8791'
  },
  {
    id: 'moon-jellyfish',
    name: 'Moon Jellyfish',
    scientificName: 'Aurelia aurita',
    category: 'animal',
    zone: 'twilight',
    depthMin: 0,
    depthMax: 200,
    habitat: 'Open water, worldwide',
    diet: 'Zooplankton',
    size: 'Up to 40cm bell',
    description: 'A near-translucent drifter with a mild sting, recognizable by four horseshoe-shaped organs visible through its bell.',
    facts: ['Is roughly 95% water.', 'Pulses its bell to both swim and pull food toward its mouth.'],
    archetype: 'jelly',
    position: [-10, -40, -15],
    scale: 1,
    color: '#cdeee8'
  },
  {
    id: 'giant-pacific-octopus',
    name: 'Giant Pacific Octopus',
    scientificName: 'Enteroctopus dofleini',
    category: 'animal',
    zone: 'twilight',
    depthMin: 0,
    depthMax: 200,
    habitat: 'Rocky reefs and dens',
    diet: 'Crustaceans and fish',
    size: 'Up to 5m arm span',
    description: 'The largest octopus species, capable of squeezing through any gap larger than its beak.',
    facts: ['Has three hearts and blue, copper-based blood.', 'Can change both color and skin texture in an instant.'],
    archetype: 'cephalopod',
    position: [20, -50, 35],
    scale: 1.3,
    color: '#a1493f'
  },
  {
    id: 'humpback-anglerfish',
    name: 'Humpback Anglerfish',
    scientificName: 'Melanocetus johnsonii',
    category: 'animal',
    zone: 'midnight',
    depthMin: 200,
    depthMax: 1000,
    habitat: 'Deep open water',
    diet: 'Fish and crustaceans',
    size: 'Up to 18cm',
    description: 'Lures prey with a glowing bioluminescent appendage powered by symbiotic bacteria.',
    facts: ['Males are tiny and fuse permanently onto a female\u2019s body.', 'Its bioluminescent lure flashes to mimic prey.'],
    archetype: 'anglerfish',
    position: [12, -35, -18],
    scale: 0.7,
    color: '#2b2530'
  },
  {
    id: 'giant-squid',
    name: 'Giant Squid',
    scientificName: 'Architeuthis dux',
    category: 'animal',
    zone: 'midnight',
    depthMin: 300,
    depthMax: 1000,
    habitat: 'Deep open water',
    diet: 'Deep-sea fish and other squid',
    size: 'Up to 13m',
    description: 'A rarely-seen giant with the largest eyes of any animal, evolved to detect faint light in the deep.',
    facts: ['Its eyes can be as large as a dinner plate.', 'Was not filmed alive in the wild until 2012.'],
    archetype: 'cephalopod',
    position: [-22, -25, 28],
    scale: 2.2,
    color: '#7a4a5c'
  },
  {
    id: 'vampire-squid',
    name: 'Vampire Squid',
    scientificName: 'Vampyroteuthis infernalis',
    category: 'animal',
    zone: 'abyssal',
    depthMin: 600,
    depthMax: 1200,
    habitat: 'Oxygen-minimum zone',
    diet: 'Marine snow and detritus',
    size: 'Up to 30cm',
    description: 'Despite its name, a harmless scavenger that drifts through one of the ocean\u2019s most oxygen-poor layers.',
    facts: ['Can turn itself inside out to display spiny projections when threatened.', 'Related more closely to octopuses than true squid.'],
    archetype: 'cephalopod',
    position: [18, -32, 12],
    scale: 0.5,
    color: '#3a1f38'
  },
  {
    id: 'dumbo-octopus',
    name: 'Dumbo Octopus',
    scientificName: 'Grimpoteuthis sp.',
    category: 'animal',
    zone: 'abyssal',
    depthMin: 1000,
    depthMax: 4000,
    habitat: 'Deep seafloor',
    diet: 'Worms and small crustaceans',
    size: 'Up to 30cm',
    description: 'Named for the ear-like fins it flaps to hover just above the seafloor.',
    facts: ['Lives deeper than almost any other octopus species.', 'Swallows its prey whole rather than biting it.'],
    archetype: 'cephalopod',
    position: [-16, -18, -22],
    scale: 0.6,
    color: '#c98fae'
  },
  {
    id: 'hadal-snailfish',
    name: 'Hadal Snailfish',
    scientificName: 'Pseudoliparis swirei',
    category: 'animal',
    zone: 'hadal',
    depthMin: 6000,
    depthMax: 8000,
    habitat: 'Ocean trenches',
    diet: 'Small crustaceans',
    size: 'Up to 20cm',
    description: 'One of the deepest-living fish ever recorded, tolerant of crushing pressure that would kill most animals.',
    facts: ['Its body is soft and gelatinous rather than boned, which helps it resist pressure.', 'Recorded at depths beyond 8,000 meters in the Mariana Trench.'],
    archetype: 'fish',
    position: [0, -22, 10],
    scale: 0.4,
    color: '#d9c9a8'
  }
]

// Every mission/achievement `check` runs against the same derived stats
// object (see deriveExplorationStats below) rather than maintaining its
// own separate progress counter — one source of truth, and it's the
// reason none of this can silently drift out of sync with what's
// actually been discovered.
export const missions = [
  {
    id: 'first-dive',
    title: 'First Dive',
    description: 'Descend below 100m.',
    check: (s) => s.maxDepthReached >= 100,
    progressLabel: (s) => `${Math.min(s.maxDepthReached, 100)} / 100m`
  },
  {
    id: 'marine-researcher',
    title: 'Marine Researcher',
    description: 'Discover 5 different creatures.',
    check: (s) => s.animalCount >= 5,
    progressLabel: (s) => `${Math.min(s.animalCount, 5)} / 5`
  },
  {
    id: 'deep-explorer',
    title: 'Deep Explorer',
    description: 'Reach the Midnight Zone.',
    check: (s) => s.visitedZones.includes('midnight'),
    progressLabel: (s) => (s.visitedZones.includes('midnight') ? 'Reached' : 'Not yet')
  },
  {
    id: 'lost-expedition',
    title: 'Lost Expedition',
    description: 'Find the sunken shipwreck.',
    check: (s) => Boolean(s.discovered.shipwreck),
    progressLabel: (s) => (s.discovered.shipwreck ? 'Found' : 'Not found')
  },
  {
    id: 'into-the-abyss',
    title: 'Into the Abyss',
    description: 'Reach the Abyssal Zone.',
    check: (s) => s.visitedZones.includes('abyssal'),
    progressLabel: (s) => (s.visitedZones.includes('abyssal') ? 'Reached' : 'Not yet')
  },
  {
    id: 'unknown-life',
    title: 'Unknown Life',
    description: 'Discover 3 creatures from the Midnight zone or deeper.',
    check: (s) => s.deepCreatureCount >= 3,
    progressLabel: (s) => `${Math.min(s.deepCreatureCount, 3)} / 3`
  },
  {
    id: 'ocean-archaeologist',
    title: 'Ocean Archaeologist',
    description: 'Discover every underwater object.',
    check: (s) => s.totalObjects > 0 && s.objectCount >= s.totalObjects,
    progressLabel: (s) => `${s.objectCount} / ${s.totalObjects}`
  }
]

// Thresholds are sized to this project's actual 13-creature, 4-object
// dataset — copying numbers from a generic brief (e.g. "discover 25
// species") when the real data only has 13 would make an achievement
// that can never unlock, which is the "not really functional" failure
// the brief itself warns against.
export const achievements = [
  { id: 'first-contact', title: 'First Contact', icon: '\u{1F30A}', description: 'Make your first discovery.', check: (s) => s.discoveredTotal >= 1 },
  { id: 'marine-researcher-badge', title: 'Marine Researcher', icon: '\u{1F52C}', description: 'Discover 10 creatures.', check: (s) => s.animalCount >= 10 },
  { id: 'into-the-dark', title: 'Into the Dark', icon: '\u{1F311}', description: 'Reach the Midnight Zone.', check: (s) => s.visitedZones.includes('midnight') },
  { id: 'abyssal-explorer', title: 'Abyssal Explorer', icon: '\u{1F525}', description: 'Reach the Abyssal Zone.', check: (s) => s.visitedZones.includes('abyssal') },
  { id: 'lost-expedition-badge', title: 'Lost Expedition', icon: '\u2693', description: 'Discover the shipwreck.', check: (s) => Boolean(s.discovered.shipwreck) },
  { id: 'creature-collector', title: 'Creature Collector', icon: '\u{1F9EC}', description: 'Discover all marine life.', check: (s) => s.totalAnimals > 0 && s.animalCount >= s.totalAnimals },
  { id: 'world-explorer', title: 'World Explorer', icon: '\u{1F5FA}\uFE0F', description: 'Visit every ocean zone.', check: (s) => s.visitedZones.length >= zones.length }
]

export function deriveExplorationStats({ discovered, visitedZones, maxDepthReached, journal }) {
  const discoveredIds = Object.keys(discovered || {})
  const animalIds = new Set(marineLife.map((m) => m.id))
  const objectIds = new Set(worldObjects.map((o) => o.id))
  const deepZones = new Set(['midnight', 'abyssal', 'hadal'])

  return {
    discovered: discovered || {},
    discoveredTotal: discoveredIds.length,
    animalCount: discoveredIds.filter((id) => animalIds.has(id)).length,
    totalAnimals: marineLife.length,
    objectCount: discoveredIds.filter((id) => objectIds.has(id)).length,
    totalObjects: worldObjects.length,
    deepCreatureCount: marineLife.filter((m) => discovered?.[m.id] && deepZones.has(m.zone)).length,
    visitedZones: visitedZones || [],
    maxDepthReached: maxDepthReached || 0,
    journalCount: Object.keys(journal || {}).length
  }
}
export const worldObjects = [
  {
    id: 'shipwreck',
    name: 'Sunken Shipwreck',
    category: 'object',
    zone: 'twilight',
    description: 'The broken hull of a cargo ship, resting on the seabed for decades.',
    facts: ['Now serves as an artificial reef for dozens of species.', 'Its exact sinking is undocumented.'],
    archetype: 'shipwreck',
    position: [-50, -48, -60],
    scale: 1,
    color: '#3a4550',
    static: true
  },
  {
    id: 'research-buoy',
    name: 'Research Buoy',
    category: 'object',
    zone: 'sunlit',
    description: 'A floating instrument platform recording temperature, salinity, and current data.',
    facts: ['Transmits readings by satellite in real time.', 'Anchored to the seabed by a long tether.'],
    archetype: 'buoy',
    position: [10, -3, -40],
    scale: 1,
    color: '#d94f4f'
  },
  {
    id: 'ancient-statue',
    name: 'Ancient Statue',
    category: 'object',
    zone: 'twilight',
    description: 'A weathered stone figure, long since claimed by the sea.',
    facts: ['Encrusted with decades of coral growth.', 'Its origin is one of the ocean\u2019s many unsolved mysteries.'],
    archetype: 'statue',
    position: [35, -46, 15],
    scale: 1,
    color: '#5c6b63',
    static: true
  },
  {
    id: 'hydrothermal-vent',
    name: 'Hydrothermal Vent',
    category: 'object',
    zone: 'abyssal',
    description: 'A mineral-rich plume rising from a crack in the seafloor, hot enough to support life with no sunlight at all.',
    facts: ['Supports ecosystems that run on chemical energy instead of sunlight.', 'Plumes can reach several hundred degrees Celsius.'],
    archetype: 'vent',
    position: [0, -48, -12],
    scale: 1,
    color: '#3a2a28',
    static: true
  }
]
