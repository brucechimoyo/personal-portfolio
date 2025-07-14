import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from '../../core/services/api.service';

export interface Dispatch {
  id?: number;
  bin_id: number;
  driver_id?: number;
  date: string;
  status: 'Pending' | 'Assigned' | 'Completed';
  assignedAt?: string;
  completedAt?: string;
  description?: string;
  bin?: string;
  driver?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DispatchFilters {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface SmartDispatchRequest {
  bin_id: number;
  description?: string;
}

export interface DriverAssignment {
  driver_id: number;
}

export interface DriverNearBin {
  driver: {
    id: number;
    name: string;
    license: string;
    isOnline: boolean;
    latitude?: number;
    longitude?: number;
  };
  distance_km: number;
}

export interface DriversNearBinResponse {
  bin_id: number;
  bin_location: {
    latitude: number;
    longitude: number;
  };
  drivers: DriverNearBin[];
}

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  constructor(private apiService: ApiService) {}

  // Get all dispatches with pagination and filtering
  getDispatches(filters?: DispatchFilters): Observable<PaginatedResponse<Dispatch>> {
    return this.apiService.get<PaginatedResponse<Dispatch>>('/dispatches', filters);
  }

  // Get a specific dispatch by ID
  getDispatch(id: number): Observable<Dispatch> {
    return this.apiService.get<Dispatch>(`/dispatches/${id}`);
  }

  // Create a new dispatch (manual assignment)
  createDispatch(dispatch: Dispatch): Observable<Dispatch> {
    return this.apiService.post<Dispatch>('/dispatches', dispatch);
  }

  // Create a smart dispatch (automatic driver assignment)
  createSmartDispatch(request: SmartDispatchRequest): Observable<Dispatch> {
    return this.apiService.post<Dispatch>('/dispatches/smart', request);
  }

  // Update a dispatch
  updateDispatch(id: number, dispatch: Partial<Dispatch>): Observable<Dispatch> {
    return this.apiService.put<Dispatch>(`/dispatches/${id}`, dispatch);
  }

  // Delete a dispatch
  deleteDispatch(id: number): Observable<any> {
    return this.apiService.delete<any>(`/dispatches/${id}`);
  }

  // Get pending dispatches
  getPendingDispatches(): Observable<Dispatch[]> {
    return this.apiService.get<Dispatch[]>('/dispatches/pending');
  }

  // Get drivers near a specific bin
  getDriversNearBin(binId: number, limit?: number): Observable<DriversNearBinResponse> {
    const params = limit ? { limit } : undefined;
    return this.apiService.get<DriversNearBinResponse>(`/dispatches/drivers-near-bin/${binId}`, params);
  }

  // Assign a driver to a pending dispatch
  assignDriver(dispatchId: number, driverId: number): Observable<Dispatch> {
    return this.apiService.post<Dispatch>(`/dispatches/${dispatchId}/assign`, { driver_id: driverId });
  }

  // Complete a dispatch
  completeDispatch(dispatchId: number): Observable<Dispatch> {
    return this.apiService.post<Dispatch>(`/dispatches/${dispatchId}/complete`, {});
  }
} 