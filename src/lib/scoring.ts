// Points awarded per position in a stage (top 10)
export const POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
  6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
};

// GC prediction bonus points
export const GC_EXACT_POSITION = 20;
export const GC_IN_TOP5 = 10;

export function calculateStagePoints(
  position: number,
  riderValue: number,
  isCaptain: boolean,
  isGoldenStage: boolean,
): number {
  const positionPts = POSITION_POINTS[position] ?? 0;
  let pts = positionPts * riderValue;
  if (isCaptain) pts *= 2;
  if (isGoldenStage) pts *= 2;
  return pts;
}

export function calculateGcBonus(
  predictedPosition: number,
  actualPosition: number | null,
): number {
  if (actualPosition === null) return 0;
  if (predictedPosition === actualPosition) return GC_EXACT_POSITION;
  if (actualPosition >= 1 && actualPosition <= 5) return GC_IN_TOP5;
  return 0;
}

export function calculateRiderValue(
  totalParticipants: number,
  timesChosen: number,
): number {
  return Math.max(1, totalParticipants - timesChosen);
}

export const specialityLabel: Record<string, string> = {
  climber: 'Klimmer',
  sprinter: 'Sprinter',
  time_trialist: 'Tijdrijder',
  gc_contender: 'Klassementsrenner',
  domestique: 'Knecht',
  puncheur: 'Puncheur',
};

export const specialityIcon: Record<string, string> = {
  climber: '⛰️',
  sprinter: '⚡',
  time_trialist: '⏱️',
  gc_contender: '🏆',
  domestique: '🤝',
  puncheur: '💥',
};

export const stageTypeLabel: Record<string, string> = {
  flat: 'Vlak',
  hilly: 'Heuvelachtig',
  mountain: 'Berg',
  time_trial: 'Tijdrit',
  team_time_trial: 'Ploegentijdrit',
};

export const stageTypeColor: Record<string, string> = {
  flat: '#00A651',
  hilly: '#FF8C00',
  mountain: '#E2001A',
  time_trial: '#0055A4',
  team_time_trial: '#003d8f',
};

export const nationalityFlag: Record<string, string> = {
  'Nederland': '🇳🇱',
  'België': '🇧🇪',
  'Slovenia': '🇸🇮',
  'Denemarken': '🇩🇰',
  'Spanje': '🇪🇸',
  'Colombia': '🇨🇴',
  'Australië': '🇦🇺',
  'Groot-Brittannië': '🇬🇧',
  'Ierland': '🇮🇪',
  'Ecuador': '🇪🇨',
  'Italië': '🇮🇹',
  'Portugal': '🇵🇹',
  'Norge': '🇳🇴',
  'Noorwegen': '🇳🇴',
  'Zweden': '🇸🇪',
  'Polen': '🇵🇱',
  'Duitsland': '🇩🇪',
  'Oostenrijk': '🇦🇹',
  'Zwitserland': '🇨🇭',
  'Kazachstan': '🇰🇿',
  'Ethiopië': '🇪🇹',
  'Eritrea': '🇪🇷',
  'Nieuw-Zeeland': '🇳🇿',
  'VS': '🇺🇸',
  'Canada': '🇨🇦',
  'Tsjechië': '🇨🇿',
  'Slowakije': '🇸🇰',
  'Roemenië': '🇷🇴',
  'Rusland': '🇷🇺',
  'Letland': '🇱🇻',
  'Kroatië': '🇭🇷',
  'Brazilië': '🇧🇷',
  'Argentina': '🇦🇷',
  'Frankrijk': '🇫🇷',
  'Luxemburg': '🇱🇺',
};
