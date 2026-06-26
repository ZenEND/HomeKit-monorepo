import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  F1Constructor,
  F1ConstructorApiItem,
  F1Driver,
  F1DriverApiItem,
  F1DriverStanding,
  F1DriverStandingApiItem,
  F1DriverStandingsApiResponse,
  F1DriverStandingsResponse,
} from './f1.types';

const DRIVER_STANDINGS_URL = 'https://api.jolpi.ca/ergast/f1/2026/driverstandings';

@Injectable()
export class F1Service {
  async getF1(): Promise<F1DriverStandingsResponse> {
    const response = await axios.get<F1DriverStandingsApiResponse>(DRIVER_STANDINGS_URL);

    return this.mapDriverStandingsResponse(response.data);
  }

  private mapDriverStandingsResponse(
    response: F1DriverStandingsApiResponse,
  ): F1DriverStandingsResponse {
    const standingsTable = response.MRData.StandingsTable;
    const standingsList = standingsTable.StandingsLists[0];

    return {
      season: standingsTable.season,
      round: standingsTable.round,
      total: Number(response.MRData.total),
      standings: standingsList?.DriverStandings.map((standing) =>
        this.mapDriverStanding(standing),
      ) ?? [],
    };
  }

  private mapDriverStanding(standing: F1DriverStandingApiItem): F1DriverStanding {
    return {
      position: Number(standing.position),
      positionText: standing.positionText,
      points: Number(standing.points),
      wins: Number(standing.wins),
      driver: this.mapDriver(standing.Driver),
      constructors: standing.Constructors.map((constructorItem) =>
        this.mapConstructor(constructorItem),
      ),
    };
  }

  private mapDriver(driver: F1DriverApiItem): F1Driver {
    return {
      id: driver.driverId,
      permanentNumber: driver.permanentNumber,
      code: driver.code,
      url: driver.url,
      firstName: driver.givenName,
      lastName: driver.familyName,
      dateOfBirth: driver.dateOfBirth,
      nationality: driver.nationality,
    };
  }

  private mapConstructor(constructorItem: F1ConstructorApiItem): F1Constructor {
    return {
      id: constructorItem.constructorId,
      url: constructorItem.url,
      name: constructorItem.name,
      nationality: constructorItem.nationality,
    };
  }
}