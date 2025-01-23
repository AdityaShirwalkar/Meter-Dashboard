import { createAction, props } from '@ngrx/store';

export const loadMeterData = createAction('[Meter] Load Meter Data');
export const loadMeterDataSuccess = createAction('[Meter] Load Meter Data Success', props<{ data: any[] }>());
export const loadMeterDataFailure = createAction('[Meter] Load Meter Data Failure', props<{ error: any }>());

export const loadFirmwareData = createAction('[Meter] Load Firmware Data', props<{ unitNo: number }>());
export const loadFirmwareDataSuccess = createAction('[Meter] Load Firmware Data Success', props<{ data: any }>());
export const loadFirmwareDataFailure = createAction('[Meter] Load Firmware Data Failure', props<{ error: any }>());

export const updateFirmware = createAction('[Meter] Update Firmware', props<{ data: any }>());
export const updateFirmwareSuccess = createAction('[Meter] Update Firmware Success', props<{ data: any }>());
export const updateFirmwareFailure = createAction('[Meter] Update Firmware Failure', props<{ error: any }>());

export const loadStateData = createAction('[Meter] Load State Data', props<{ unitNo: number }>());
export const loadStateDataSuccess = createAction('[Meter] Load State Data Success', props<{ data: any }>());
export const loadStateDataFailure = createAction('[Meter] Load State Data Failure', props<{ error: any }>());

export const updateState = createAction('[Meter] Update State', props<{ data: any }>());
export const updateStateSuccess = createAction('[Meter] Update State Success', props<{ data: any }>());
export const updateStateFailure = createAction('[Meter] Update State Failure', props<{ error: any }>());