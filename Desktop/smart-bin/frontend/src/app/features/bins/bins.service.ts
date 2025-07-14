import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from '../../core/services/api.service';

export interface Bin {
  id?: number;
  location: string;
  status: 'Active' | 'Inactive' | 'Full';
  fillLevel: number;
  markedForCollection: boolean;
  lastEmptied?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BinFilters {
  page?: number;
  per_page?: number;
  status?: string;
  marked_for_collection?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BinsService {
  constructor(private apiService: ApiService) {}

  // Get all bins with pagination and filtering
  getBins(filters?: BinFilters): Observable<PaginatedResponse<Bin>> {
    return this.apiService.get<PaginatedResponse<Bin>>('/bins/', filters);
  }

  // Get a specific bin by ID
  getBin(id: number): Observable<Bin> {
    return this.apiService.get<Bin>(`/bins/${id}`);
  }

  // Create a new bin
  createBin(bin: Bin): Observable<Bin> {
    return this.apiService.post<Bin>('/bins', bin);
  }

  // Update a bin
  updateBin(id: number, bin: Partial<Bin>): Observable<Bin> {
    return this.apiService.put<Bin>(`/bins/${id}`, bin);
  }

  // Delete a bin
  deleteBin(id: number): Observable<any> {
    return this.apiService.delete<any>(`/bins/${id}`);
  }

  // Get bins marked for collection
  getBinsMarkedForCollection(): Observable<Bin[]> {
    return this.apiService.get<Bin[]>('/bins/marked-for-collection');
  }

  // Mark a bin for collection
  markBinForCollection(id: number): Observable<Bin> {
    return this.apiService.post<Bin>(`/bins/${id}/mark-for-collection`, {});
  }

  // Clear collection mark from a bin
  clearBinCollectionMark(id: number): Observable<Bin> {
    return this.apiService.post<Bin>(`/bins/${id}/clear-collection-mark`, {});
  }

  // Update bin fill level and auto-mark for collection if full
  updateBinFillLevel(id: number, fillLevel: number): Observable<Bin> {
    return this.updateBin(id, { fillLevel });
  }
} 