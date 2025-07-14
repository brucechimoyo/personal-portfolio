import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from '../../core/services/api.service';

export interface Driver {
  id?: number;
  name: string;
  license: string;
  status: 'Active' | 'Inactive';
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverFilters {
  page?: number;
  per_page?: number;
  status?: string;
  online_only?: boolean;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class DriversService {
  constructor(private apiService: ApiService) {}

  // Get all drivers with pagination and filtering
  getDrivers(filters?: DriverFilters): Observable<PaginatedResponse<Driver>> {
    return this.apiService.get<PaginatedResponse<Driver>>('/drivers', filters);
  }

  // Get a specific driver by ID
  getDriver(id: number): Observable<Driver> {
    return this.apiService.get<Driver>(`/drivers/${id}`);
  }

  // Create a new driver
  createDriver(driver: Driver): Observable<Driver> {
    return this.apiService.post<Driver>('/drivers', driver);
  }

  // Update a driver
  updateDriver(id: number, driver: Partial<Driver>): Observable<Driver> {
    return this.apiService.put<Driver>(`/drivers/${id}`, driver);
  }

  // Delete a driver
  deleteDriver(id: number): Observable<any> {
    return this.apiService.delete<any>(`/drivers/${id}`);
  }

  // Get online drivers
  getOnlineDrivers(): Observable<Driver[]> {
    return this.apiService.get<Driver[]>('/drivers/online');
  }

  // Update driver location
  updateDriverLocation(id: number, location: LocationUpdate): Observable<Driver> {
    return this.apiService.put<Driver>(`/drivers/${id}/location`, location);
  }

  // Set driver as online
  setDriverOnline(id: number): Observable<Driver> {
    return this.apiService.post<Driver>(`/drivers/${id}/online`, {});
  }

  // Set driver as offline
  setDriverOffline(id: number): Observable<Driver> {
    return this.apiService.post<Driver>(`/drivers/${id}/offline`, {});
  }
} 