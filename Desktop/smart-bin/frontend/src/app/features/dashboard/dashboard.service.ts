import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface DashboardStats {
  stats: {
    total_bins: number;
    active_bins: number;
    total_drivers: number;
    active_drivers: number;
    pending_dispatches: number;
    completed_dispatches: number;
    avg_fill_level: number;
  };
  bin_locations: BinLocation[];
}

export interface BinLocation {
  lat: number;
  lng: number;
  label: string;
  status: 'empty' | 'half' | 'full';
  fill_level: number;
}

export interface RecentActivity {
  recent_dispatches: any[];
  recent_reports: any[];
  bins_needing_attention: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  // Get dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('/dashboard/stats');
  }

  // Get recent activity
  getRecentActivity(): Observable<RecentActivity> {
    return this.apiService.get<RecentActivity>('/dashboard/recent-activity');
  }
} 