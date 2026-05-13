import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const specialityEnum = pgEnum('speciality', [
  'climber',
  'sprinter',
  'time_trialist',
  'gc_contender',
  'domestique',
  'puncheur',
]);

export const stageTypeEnum = pgEnum('stage_type', [
  'flat',
  'hilly',
  'mountain',
  'time_trial',
  'team_time_trial',
  'rest_day',
]);

export const stageStatusEnum = pgEnum('stage_status', [
  'planned',
  'active',
  'completed',
]);

// Teams
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
});

// Riders
export const riders = pgTable('riders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nationality: text('nationality').notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  speciality: specialityEnum('speciality').notNull().default('domestique'),
  bio: text('bio'),
  bibNumber: integer('bib_number'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Stages
export const stages = pgTable('stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  stageNumber: integer('stage_number').notNull().unique(),
  date: text('date').notNull(),
  startLocation: text('start_location').notNull(),
  finishLocation: text('finish_location').notNull(),
  type: stageTypeEnum('type').notNull(),
  distanceKm: real('distance_km').notNull(),
  elevationMeters: integer('elevation_meters').notNull().default(0),
  description: text('description'),
  climbs: jsonb('climbs').$type<Array<{
    name: string;
    category: string;
    altitude: number;
    lengthKm: number;
    avgGradient: number;
  }>>().default([]),
  isSprintStage: boolean('is_sprint_stage').notNull().default(false),
  isMountainStage: boolean('is_mountain_stage').notNull().default(false),
  status: stageStatusEnum('status').notNull().default('planned'),
  expectedScenario: text('expected_scenario'),
  profileImageUrl: text('profile_image_url'),
  routeImageUrl: text('route_image_url'),
  country: text('country').default('Frankrijk'),
});

// Participants
export const participants = pgTable('participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  dateOfBirth: text('date_of_birth').notNull(),
  iban: text('iban').notNull(),
  goldenStageId: uuid('golden_stage_id').references(() => stages.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Participant riders (many-to-many)
export const participantRiders = pgTable('participant_riders', {
  participantId: uuid('participant_id').notNull().references(() => participants.id),
  riderId: uuid('rider_id').notNull().references(() => riders.id),
  isCaptain: boolean('is_captain').notNull().default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.participantId, table.riderId] }),
}));

// Participant GC predictions
export const participantGcPrediction = pgTable('participant_gc_prediction', {
  participantId: uuid('participant_id').notNull().references(() => participants.id),
  riderId: uuid('rider_id').notNull().references(() => riders.id),
  predictedPosition: integer('predicted_position').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.participantId, table.riderId] }),
}));

// Stage results (top 10)
export const stageResults = pgTable('stage_results', {
  stageId: uuid('stage_id').notNull().references(() => stages.id),
  riderId: uuid('rider_id').notNull().references(() => riders.id),
  position: integer('position').notNull(),
  timeGap: text('time_gap'),
}, (table) => ({
  pk: primaryKey({ columns: [table.stageId, table.riderId] }),
}));

// Rider values (after registration closes)
export const riderValues = pgTable('rider_values', {
  riderId: uuid('rider_id').primaryKey().references(() => riders.id),
  value: integer('value').notNull().default(0),
  timesChosen: integer('times_chosen').notNull().default(0),
});

// Actual GC top 5 (filled after the Tour)
export const actualGcTop5 = pgTable('actual_gc_top5', {
  riderId: uuid('rider_id').primaryKey().references(() => riders.id),
  position: integer('position').notNull(),
});

// Settings
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// DNF riders
export const dnfRiders = pgTable('dnf_riders', {
  riderId: uuid('rider_id').primaryKey().references(() => riders.id),
  stageId: uuid('stage_id').references(() => stages.id),
  dnfAt: timestamp('dnf_at').defaultNow(),
});
