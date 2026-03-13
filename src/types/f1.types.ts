export type SessionType =
  | 'Practice 1'
  | 'Practice 2'
  | 'Practice 3'
  | 'Sprint Qualifying'
  | 'Sprint'
  | 'Qualifying'
  | 'Race';

export interface F1Session {
  sessionKey: number;
  sessionName: SessionType;
  dateStart: Date;
  dateEnd: Date;
  gmtOffset: string;
  sessionType: 'Practice' | 'Qualifying' | 'Race' | 'Sprint';
  meetingKey: number;
  location: string;
  countryName: string;
  circuitShortName: string;
  year: number;
  roundNumber: number;
}

export interface F1Meeting {
  meetingKey: number;
  meetingName: string;
  meetingOfficialName: string;
  location: string;
  countryName: string;
  countryCode: string;
  circuitShortName: string;
  dateStart: Date;
  year: number;
  roundNumber: number;
  sessions: F1Session[];
}

export interface DriverResult {
  position: number;
  driverNumber: number;
  driverAcronym: string;
  fullName: string;
  teamName: string;
  teamColour: string;
  points?: number;
  lapsDiff?: string;      // ex: "+5.231s" ou "DNF"
  fastestLap?: string;    // ex: "1:23.456"
  isFastestLap?: boolean;
}

export interface SessionResult {
  session: F1Session;
  results: DriverResult[];
}

export interface DriverStanding {
  position: number;
  driverNumber: number;
  driverAcronym: string;
  fullName: string;
  teamName: string;
  teamColour: string;
  points: number;
  wins: number;
}

export interface ConstructorStanding {
  position: number;
  teamName: string;
  teamColour: string;
  points: number;
  wins: number;
}

export interface RaceWeekSchedule {
  meeting: F1Meeting;
  sessions: F1Session[];
  isCurrentWeek: boolean;
}
