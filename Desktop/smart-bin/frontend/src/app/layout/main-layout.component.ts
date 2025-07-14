import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { NgIf } from '@angular/common';
import { NotificationComponent } from '../shared/notification.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    NgIf,
    NotificationComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarVisible = true; // Show by default on desktop
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial sidebar state based on screen size
    this.updateSidebarVisibility();
    
    // Subscribe to router events to close sidebar on navigation (mobile only)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Close sidebar on navigation (for mobile/tablet)
        if (window.innerWidth <= 768) {
          this.sidebarVisible = false;
        }
      });

    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.updateSidebarVisibility();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  private updateSidebarVisibility() {
    // Show sidebar by default on desktop, hide on mobile
    if (window.innerWidth > 768) {
      this.sidebarVisible = true;
    } else {
      this.sidebarVisible = false;
    }
  }
} 