import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, tap } from 'rxjs';

interface FirmwareData {
  MeterNo: number;
  Firmware_version: string;
  available_version: string;
  activation_date: string;
  firmware_availability: boolean;
}

interface StateData {
  unit_no: number;
  state: string;
  reason: string;
  mode: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api/data';

  constructor(private http: HttpClient) {}

getData(tableName: string): Observable<any[]> {
  const adjustedTableName = tableName === 'MeterTable' ? 'metertable' : tableName;
  return this.http.get<any[]>(`${this.apiUrl}/${adjustedTableName}`).pipe(
    tap(response => console.log('Response:', response)),
    catchError(error => {
      console.error(`Error fetching ${tableName} data:`, error);
      throw error;
    })
  );
}
  getFirmwareList(): Observable<FirmwareData[]> {
    return this.http.get<FirmwareData[]>(`${this.apiUrl}/firmware`).pipe(
      map(response => {
        console.log('Raw firmware list response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error in getFirmwareList:', error);
        throw error;
      })
    );
  }
  getStateList(): Observable<StateData[]> {
    return this.http.get<StateData[]>(`${this.apiUrl}/state`).pipe(
      map(response => {
        console.log('Raw State list response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error in getStateList:', error);
        throw error;
      })
    );
  }

  getFirmwareData(unitNo: number): Observable<FirmwareData> {
    return this.http.get<FirmwareData>(`${this.apiUrl}/firmware/${unitNo}`).pipe(
      map(response => {
        console.log('Raw firmware response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error in getFirmwareData:', error);
        throw error;
      })
    );
  }

  updateFirmwareData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/firmware/${data.MeterNo}`, data).pipe(
      map(response => {
        return { ...response, isVisible: true };
      }),
      catchError(error => {
        console.error('Error in updateFirmwareData:', error);
        throw error;
      })
    );
  }

  // getExistingFirmwareVersions(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/firmware-versions`).pipe(
  //     map(response => {
  //       console.log('Existing firmware versions:', response);
  //       return response;
  //     }),
  //     catchError(error => {
  //       console.error('Error in getExistingFirmwareVersions:', error);
  //       throw error;
  //     })
  //   );
  // }

  getVersion(tableName: string): Observable<any[]> {
    const adjustedTable = tableName === 'firmware_versions' ? 'firmware_version' : tableName;
    return this.http.get<any[]>(`${this.apiUrl}/${adjustedTable}`).pipe(
      tap(response=>console.log('Response:',response)),
      catchError(error => {
        console.error(`Error fetching ${tableName} data:`, error);
        throw error;
      })
    );
  }

  createNewVersion(data:any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/firmware_versions `,data).pipe(
      catchError(error => {
        console.error('Error in creating new version: ',error);
        throw error;
      })
    );
  }

  updateExistingVersion(data: any): Observable<any> {
  return this.http.patch<any>(`${this.apiUrl}/firmware_versions`, data).pipe(
    catchError(error => {
      console.error('Error in updating existing version: ', error);
      throw error;
    })
  );
}

  getStateData(unitNo: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/state/${unitNo}`).pipe(
      map(response => {
        console.log('Raw state response:', response);
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        return response;
      }),
      catchError(error => {
        console.error('Error in getStateData:', error);
        throw error;
      })
    );
  }

  updateStateData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/state/${data.unit_no}`, data).pipe(
      map(response => {
        return { ...response, isVisible: true };
      }),
      catchError(error => {
        console.error('Error in updateStateData:', error);
        throw error;
      })
    );
  }

  createNewMeter(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meter`, data).pipe(
      catchError(error => {
        console.error('Error in createNewMeter:', error);
        throw error;
      })
    );
  }

  softDeleteFirmware(meterNo: number): Observable<any> {
    const emptyFirmware = {
      MeterNo: meterNo,
      Firmware_version: null,
      activation_date: null,
      firmware_availability: false
    };
    
    return this.http.put<any>(`${this.apiUrl}/firmware/${meterNo}`, emptyFirmware).pipe(
      catchError(error => {
        console.error('Error in softDeleteFirmware:', error);
        throw error;
      })
    );
  }

  softDeleteState(unitNo: number): Observable<any> {
    const emptyState = {
      unit_no: unitNo,
      state: null,
      reason: null,
      mode: null
    };
    
    return this.http.put<any>(`${this.apiUrl}/state/${unitNo}`, emptyState).pipe(
      catchError(error => {
        console.error('Error in softDeleteState:', error);
        throw error;
      })
    );
  }
  
}