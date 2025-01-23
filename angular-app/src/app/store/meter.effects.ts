import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import * as MeterActions from './meter.actions';

@Injectable()
export class MeterEffects {
  loadMeterData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.loadMeterData),
      mergeMap(() =>
        this.dataService.getData('MeterTable').pipe(
          map(data => MeterActions.loadMeterDataSuccess({ data })),
          catchError(error => of(MeterActions.loadMeterDataFailure({ error })))
        )
      )
    )
  );

  loadFirmwareData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.loadFirmwareData),
      mergeMap(({ unitNo }) =>
        this.dataService.getFirmwareData(unitNo).pipe(
          map(data => MeterActions.loadFirmwareDataSuccess({ data })),
          catchError(error => of(MeterActions.loadFirmwareDataFailure({ error })))
        )
      )
    )
  );

  updateFirmware$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.updateFirmware),
      mergeMap(({ data }) =>
        this.dataService.updateFirmwareData(data).pipe(
          map(updatedData => MeterActions.updateFirmwareSuccess({ data: updatedData })),
          catchError(error => of(MeterActions.updateFirmwareFailure({ error })))
        )
      )
    )
  );

  loadStateData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.loadStateData),
      mergeMap(({ unitNo }) =>
        this.dataService.getStateData(unitNo).pipe(
          map(data => MeterActions.loadStateDataSuccess({ data })),
          catchError(error => of(MeterActions.loadStateDataFailure({ error })))
        )
      )
    )
  );

  updateState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.updateState),
      mergeMap(({ data }) =>
        this.dataService.updateStateData(data).pipe(
          map(updatedData => MeterActions.updateStateSuccess({ data: updatedData })),
          catchError(error => of(MeterActions.updateStateFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) {}
}