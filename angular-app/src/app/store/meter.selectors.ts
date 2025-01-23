import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MeterState } from './meter.reducer';

export const selectMeterState = createFeatureSelector<MeterState>('meter');

export const selectMeterData = createSelector(
  selectMeterState,
  (state: MeterState) => state.meterData
);

export const selectFirmwareData = createSelector(
  selectMeterState,
  (state: MeterState) => state.firmwareData
);

export const selectStateData = createSelector(
  selectMeterState,
  (state: MeterState) => state.stateData
);

export const selectLoading = createSelector(
  selectMeterState,
  (state: MeterState) => state.loading
);

export const selectError = createSelector(
  selectMeterState,
  (state: MeterState) => state.error
);