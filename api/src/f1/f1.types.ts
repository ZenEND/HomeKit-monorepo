export interface F1DriverStandingsApiResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: F1StandingsList[];
    };
  };
}

export interface F1StandingsList {
  season: string;
  round: string;
  DriverStandings: F1DriverStandingApiItem[];
}

export interface F1DriverStandingApiItem {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: F1DriverApiItem;
  Constructors: F1ConstructorApiItem[];
}

export interface F1DriverApiItem {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface F1ConstructorApiItem {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface F1DriverStandingsResponse {
  season: string;
  round: string;
  total: number;
  standings: F1DriverStanding[];
}

export interface F1DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driver: F1Driver;
  constructors: F1Constructor[];
}

export interface F1Driver {
  id: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface F1Constructor {
  id: string;
  url: string;
  name: string;
  nationality: string;
}
