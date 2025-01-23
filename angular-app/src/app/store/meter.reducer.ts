import { Action, createReducer, on } from '@ngrx/store';
import * as MeterActions from './meter.actions';

export interface MeterState {
  meterData: any[];
  firmwareData: any;
  stateData: any;
  loading: boolean;
  error: any;
}

export const initialState: MeterState = {
  meterData: [],
  firmwareData: null,
  stateData: null,
  loading: false,
  error: null
};

const meterReducer = createReducer(
  initialState,
  on(MeterActions.loadMeterData, state => ({ ...state, loading: true })),
  on(MeterActions.loadMeterDataSuccess, (state, { data }) => ({ ...state, meterData: data, loading: false })),
  on(MeterActions.loadMeterDataFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(MeterActions.loadFirmwareData, state => ({ ...state, loading: true })),
  on(MeterActions.loadFirmwareDataSuccess, (state, { data }) => ({ ...state, firmwareData: data, loading: false })),
  on(MeterActions.loadFirmwareDataFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(MeterActions.updateFirmware, state => ({ ...state, loading: true })),
  on(MeterActions.updateFirmwareSuccess, (state, { data }) => ({ ...state, firmwareData: data, loading: false })),
  on(MeterActions.updateFirmwareFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(MeterActions.loadStateData, state => ({ ...state, loading: true })),
  on(MeterActions.loadStateDataSuccess, (state, { data }) => ({ ...state, stateData: data, loading: false })),
  on(MeterActions.loadStateDataFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(MeterActions.updateState, state => ({ ...state, loading: true })),
  on(MeterActions.updateStateSuccess, (state, { data }) => ({ ...state, stateData: data, loading: false })),
  on(MeterActions.updateStateFailure, (state, { error }) => ({ ...state, error, loading: false }))
);

export function reducer(state: MeterState | undefined, action: Action) {
  return meterReducer(state, action);
}