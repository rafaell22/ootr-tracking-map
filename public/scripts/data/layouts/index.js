export default [
  { id: 'scrubsS7', name: 'Scrubs S7', loadModule: () => import('./scrubsS7.js') },
  { id: 'mentourTourneyS1', name: 'Mentor Tourney S1', loadModule: () => import('./mentorTourneyS1.js') },
  { id: 'escapeFromKak', name: 'Escape from Kak', loadModule: () => import('./escapeFromKak.js') },
  { id: 'spolerLogsScrubs', name: 'Spoiler Log - Scrubs', loadModule: () => import('./spoilerLogScrubs.js') },
  { id: 'emeraldRuby', name: 'Emerald Ruby - Scrubs', loadModule: () => import('./emeraldRuby.js') },
];
