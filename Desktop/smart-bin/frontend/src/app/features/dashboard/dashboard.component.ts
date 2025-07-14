import { Component, AfterViewInit, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router } from '@angular/router';
// Removed Leaflet imports
import { DashboardService, DashboardStats, RecentActivity } from './dashboard.service';
import { NotificationService } from '../../shared/notification.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('harareMap', { static: false }) harareMapRef!: ElementRef<HTMLDivElement>;
  private mapInitialized = false;
  private googleMap: any = null;
  private googleMarkers: any[] = [];

  loading = false;
  stats: DashboardStats | null = null;
  recentActivity: RecentActivity | null = null;
  recentActivityList: any[] = [];
  showAllActivityModal = false;

  // Sample bin locations (Harare) - will be replaced with API data
  binLocations = [
    { lat: -17.8292, lng: 31.0522, label: 'Main St.', status: 'full', fill_level: 85 },
    { lat: -17.8200, lng: 31.0400, label: '2nd Ave.', status: 'empty', fill_level: 15 },
    { lat: -17.8150, lng: 31.0600, label: 'Park Lane', status: 'half', fill_level: 65 }
  ];

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Load stats
    this.dashboardService.getDashboardStats().pipe(
      catchError(error => {
        this.notificationService.error(
          'Error',
          error || 'Failed to load dashboard statistics'
        );
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(response => {
      if (response) {
        this.stats = response;
        // Update bin locations with real data
        if (response.bin_locations) {
          this.binLocations = response.bin_locations.map(bin => ({
            lat: bin.lat,
            lng: bin.lng,
            label: bin.label,
            status: bin.status,
            fill_level: bin.fill_level
          }));
          // If map is already initialized, update markers
          if (this.mapInitialized) {
            this.updateGoogleMarkers();
          }
        }
      }
    });

    // Load recent activity
    this.dashboardService.getRecentActivity().pipe(
      catchError(error => {
        this.notificationService.error(
          'Error',
          error || 'Failed to load recent activity'
        );
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.recentActivity = response;
        // Combine and sort all activity types
        const dispatches = (response.recent_dispatches || []).map((item: any) => ({
          ...item,
          type: 'dispatch',
          activityTime: item.timestamp || item.date
        }));
        const reports = (response.recent_reports || []).map((item: any) => ({
          ...item,
          type: 'report',
          activityTime: item.timestamp || item.date
        }));
        const bins = (response.bins_needing_attention || []).map((item: any) => ({
          ...item,
          type: 'bin',
          activityTime: item.timestamp || item.date
        }));
        this.recentActivityList = [...dispatches, ...reports, ...bins]
          .filter(a => a.activityTime)
          .sort((a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime())
          .slice(0, 8);
      }
    });
  }

  ngAfterViewInit() {
    // Initialize map after view is initialized
    this.loadGoogleMapsScript().then(() => {
      this.initializeGoogleMap();
    });
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }
      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script is already loading
        (document.getElementById(scriptId) as HTMLScriptElement).addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBa5uHp3NM8B_EqU0RSRvW9Z9l5n_i7i6M&loading=async&libraries=marker';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.ngZone.run(() => resolve());
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  private initializeGoogleMap(retryCount = 0) {
    if (this.harareMapRef && !this.mapInitialized) {
      const center = { lat: -17.8292, lng: 31.0522 };
      const google = (window as any).google;
      if (!google?.maps?.Map) {
        if (retryCount < 10) {
          setTimeout(() => this.initializeGoogleMap(retryCount + 1), 100);
        } else {
          this.notificationService.error('Error', 'Google Maps failed to load.');
        }
        return;
      }
      this.googleMap = new google.maps.Map(this.harareMapRef.nativeElement, {
        center,
        zoom: 13,
        mapId: '78adf2e852d49beee754eb91'
      });
      this.updateGoogleMarkers();
      this.mapInitialized = true;
    }
  }

  private updateGoogleMarkers() {
    if (!this.googleMap) return;
    // Remove old markers
    this.googleMarkers.forEach(marker => marker.setMap(null));
    this.googleMarkers = [];
    // Add new markers using AdvancedMarkerElement
    const markerLib = (window as any).google.maps.marker;
    this.binLocations.forEach(bin => {
      // Choose color based on status
      let color = '#28a745'; // green for empty
      if (bin.status === 'half') color = '#ffc107'; // yellow
      if (bin.status === 'full') color = '#dc3545'; // red
      // Create icon element
      const div = document.createElement('div');
      div.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid ${color};">
          <i class="bi bi-trash-fill" style="font-size: 2rem; color: ${color};"></i>
        </div>
      `;
      const marker = new markerLib.AdvancedMarkerElement({
        map: this.googleMap,
        position: { lat: bin.lat, lng: bin.lng },
        title: bin.label,
        content: div
      });
      this.googleMarkers.push(marker);
    });
  }

  // Calculate system uptime as % of active_bins / total_bins
  getSystemUptime(): number {
    if (!this.stats?.stats) return 0;
    const { total_bins, active_bins } = this.stats.stats as any;
    return total_bins > 0 ? Math.round((active_bins / total_bins) * 100) : 0;
  }

  // Calculate driver online rate as % of active_drivers / total_drivers
  getDriverOnlineRate(): number {
    if (!this.stats?.stats) return 0;
    const { total_drivers, active_drivers } = this.stats.stats as any;
    return total_drivers > 0 ? Math.round((active_drivers / total_drivers) * 100) : 0;
  }

  // Calculate collection efficiency as % of completed_dispatches / (pending + completed)
  getCollectionRate(): number {
    if (!this.stats?.stats) return 0;
    const { completed_dispatches, pending_dispatches } = this.stats.stats as any;
    const total = completed_dispatches + pending_dispatches;
    return total > 0 ? Math.round((completed_dispatches / total) * 100) : 0;
  }

  openAllActivityModal() {
    this.showAllActivityModal = true;
  }
  closeAllActivityModal() {
    this.showAllActivityModal = false;
  }

  goToAllActivity() {
    this.router.navigate(['/dashboard/activity']);
  }
}
