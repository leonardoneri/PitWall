import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type {
  F1Meeting,
  F1Session,
  DriverResult,
  SessionResult,
  DriverStanding,
  ConstructorStanding,
} from '../types/f1.types';

dayjs.extend(utc);
dayjs.extend(timezone);

const BASE_URL = 'https://api.openf1.org/v1';

// Jolpica como fallback para standings (OpenF1 não tem standings)
const JOLPICA_URL = 'https://api.jolpi.ca/ergast/f1';

export class OpenF1Service {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10_000,
    });
  }

  // ─── Meetings ────────────────────────────────────────────────────────────────

  async getMeetings(year: number): Promise<F1Meeting[]> {
    const { data } = await this.client.get('/meetings', {
      params: { year },
    });

    return data.map((m: any): F1Meeting => ({
      meetingKey: m.meeting_key,
      meetingName: m.meeting_name,
      meetingOfficialName: m.meeting_official_name,
      location: m.location,
      countryName: m.country_name,
      countryCode: m.country_code,
      circuitShortName: m.circuit_short_name,
      dateStart: new Date(m.date_start),
      year: m.year,
      roundNumber: m.round_number ?? 0,
      sessions: [],
    }));
  }

  async getCurrentMeeting(): Promise<F1Meeting | null> {
    const { data } = await this.client.get('/meetings', {
      params: { meeting_key: 'latest' },
    });
    if (!data.length) return null;
    const m = data[0];
    return {
      meetingKey: m.meeting_key,
      meetingName: m.meeting_name,
      meetingOfficialName: m.meeting_official_name,
      location: m.location,
      countryName: m.country_name,
      countryCode: m.country_code,
      circuitShortName: m.circuit_short_name,
      dateStart: new Date(m.date_start),
      year: m.year,
      roundNumber: m.round_number ?? 0,
      sessions: [],
    };
  }

  // ─── Sessions ─────────────────────────────────────────────────────────────

  async getSessions(meetingKey: number): Promise<F1Session[]> {
    const { data } = await this.client.get('/sessions', {
      params: { meeting_key: meetingKey },
    });

    return data.map((s: any): F1Session => ({
      sessionKey: s.session_key,
      sessionName: s.session_name,
      dateStart: new Date(s.date_start),
      dateEnd: new Date(s.date_end),
      gmtOffset: s.gmt_offset,
      sessionType: s.session_type,
      meetingKey: s.meeting_key,
      location: s.location,
      countryName: s.country_name,
      circuitShortName: s.circuit_short_name,
      year: s.year,
      roundNumber: s.round_number ?? 0,
    }));
  }

  async getCurrentWeekSessions(): Promise<F1Session[]> {
    const meeting = await this.getCurrentMeeting();
    if (!meeting) return [];

    const now = dayjs.utc();
    const meetingDate = dayjs.utc(meeting.dateStart);

    // Verifica se o GP é nessa semana (seg a dom)
    const startOfWeek = now.startOf('week');
    const endOfWeek = now.endOf('week');

    if (meetingDate.isBefore(startOfWeek) || meetingDate.isAfter(endOfWeek)) {
      return [];
    }

    return this.getSessions(meeting.meetingKey);
  }

  async getNextSession(): Promise<F1Session | null> {
    const sessions = await this.getCurrentWeekSessions();
    const now = new Date();

    const upcoming = sessions
      .filter((s) => s.dateStart > now)
      .sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime());

    return upcoming[0] ?? null;
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  async getSessionResults(sessionKey: number): Promise<DriverResult[]> {
    const [positionsData, driversData] = await Promise.all([
      this.client.get('/position', { params: { session_key: sessionKey } }),
      this.client.get('/drivers', { params: { session_key: sessionKey } }),
    ]);

    // Pega a posição final de cada piloto
    const finalPositions = new Map<number, number>();
    for (const pos of positionsData.data) {
      finalPositions.set(pos.driver_number, pos.position);
    }

    const drivers: DriverResult[] = driversData.data.map((d: any): DriverResult => ({
      position: finalPositions.get(d.driver_number) ?? 99,
      driverNumber: d.driver_number,
      driverAcronym: d.name_acronym,
      fullName: d.full_name,
      teamName: d.team_name,
      teamColour: d.team_colour ?? '888888',
      lapsDiff: undefined,
      fastestLap: undefined,
      isFastestLap: false,
    }));

    return drivers.sort((a, b) => a.position - b.position);
  }

  async getLatestSessionResult(): Promise<SessionResult | null> {
    const { data: sessionData } = await this.client.get('/sessions', {
      params: { session_key: 'latest' },
    });

    if (!sessionData.length) return null;

    const s = sessionData[0];
    const session: F1Session = {
      sessionKey: s.session_key,
      sessionName: s.session_name,
      dateStart: new Date(s.date_start),
      dateEnd: new Date(s.date_end),
      gmtOffset: s.gmt_offset,
      sessionType: s.session_type,
      meetingKey: s.meeting_key,
      location: s.location,
      countryName: s.country_name,
      circuitShortName: s.circuit_short_name,
      year: s.year,
      roundNumber: s.round_number ?? 0,
    };

    const results = await this.getSessionResults(session.sessionKey);
    return { session, results };
  }

  // ─── Standings (via JOLPICA) ───────────────────────────────────────────────

  async getDriverStandings(year?: number): Promise<DriverStanding[]> {
    const targetYear = year ?? new Date().getFullYear();
    const { data } = await axios.get(
      `${JOLPICA_URL}/${targetYear}/driverStandings.json`
    );

    const standings =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

    return standings.map((s: any): DriverStanding => ({
      position: parseInt(s.position),
      driverNumber: parseInt(s.Driver?.permanentNumber ?? '0'),
      driverAcronym: s.Driver?.code ?? '???',
      fullName: `${s.Driver?.givenName} ${s.Driver?.familyName}`,
      teamName: s.Constructors?.[0]?.name ?? 'Unknown',
      teamColour: '888888', // Ergast não tem cor, usaremos fallback
      points: parseFloat(s.points),
      wins: parseInt(s.wins),
    }));
  }

  async getConstructorStandings(year?: number): Promise<ConstructorStanding[]> {
    const targetYear = year ?? new Date().getFullYear();
    const { data } = await axios.get(
      `${JOLPICA_URL}/${targetYear}/constructorStandings.json`
    );

    const standings =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

    return standings.map((s: any): ConstructorStanding => ({
      position: parseInt(s.position),
      teamName: s.Constructor?.name ?? 'Unknown',
      teamColour: '888888',
      points: parseFloat(s.points),
      wins: parseInt(s.wins),
    }));
  }
}

export const openF1Service = new OpenF1Service();
