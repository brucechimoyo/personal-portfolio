import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BinsService, Bin, BinFilters } from './bins.service';
import { NotificationService } from '../../shared/notification.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

@Component({
  selector: 'app-bins',
  standalone: true,
  imports: [
    NgIf, 
    NgFor, 
    DatePipe,
    FormsModule,
    ConfirmationModalComponent
  ],
  templateUrl: './bins.component.html',
  styleUrl: './bins.component.css'
})
export class BinsComponent implements OnInit {
  bins: Bin[] = [];
  loading = false;
  showModal = false;
  editMode = false;
  modalBin: Bin = this.emptyBin();

  // Confirmation modal state
  showConfirmModal = false;
  binToDelete: Bin | null = null;

  // Pagination
  page = 1;
  pageSize = 8;
  totalItems = 0;
  totalPages = 0;

  // Filters
  filters: BinFilters = {
    page: 1,
    per_page: 8
  };

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Full', value: 'Full' }
  ];

  constructor(
    private binsService: BinsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadBins();
  }

  loadBins() {
    this.loading = true;
    this.filters.page = this.page;
    this.filters.per_page = this.pageSize;

    this.binsService.getBins(this.filters).pipe(
      catchError(error => {
        this.notificationService.error(
          'Error',
          error || 'Failed to load bins'
        );
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(response => {
      if (response) {
        this.bins = response.bins || [];
        this.totalItems = response.total || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      }
    });
  }

  openAdd() {
    this.editMode = false;
    this.modalBin = this.emptyBin();
    this.showModal = true;
  }

  openEdit(bin: Bin) {
    this.editMode = true;
    this.modalBin = { ...bin };
    this.showModal = true;
  }

  saveBin() {
    if (this.editMode && this.modalBin.id) {
      this.binsService.updateBin(this.modalBin.id, this.modalBin).pipe(
        catchError(error => {
          this.notificationService.error(
            'Error',
            error || 'Failed to update bin'
          );
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.notificationService.success(
            'Success',
            'Bin updated successfully'
          );
          this.showModal = false;
          this.loadBins();
        }
      });
    } else {
      this.binsService.createBin(this.modalBin).pipe(
        catchError(error => {
          this.notificationService.error(
            'Error',
            error || 'Failed to create bin'
          );
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.notificationService.success(
            'Success',
            'Bin created successfully'
          );
          this.showModal = false;
          this.loadBins();
        }
      });
    }
  }

  deleteBin(bin: Bin) {
    this.binToDelete = bin;
    this.showConfirmModal = true;
  }

  confirmDeleteBin() {
    if (this.binToDelete && this.binToDelete.id) {
      this.binsService.deleteBin(this.binToDelete.id).pipe(
        catchError(error => {
          this.notificationService.error(
            'Error',
            error || 'Failed to delete bin'
          );
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.notificationService.success(
            'Success',
            'Bin deleted successfully'
          );
          this.loadBins();
        }
        this.showConfirmModal = false;
        this.binToDelete = null;
      });
    } else {
      this.showConfirmModal = false;
      this.binToDelete = null;
    }
  }

  cancelDeleteBin() {
    this.showConfirmModal = false;
    this.binToDelete = null;
  }

  viewBin(bin: Bin) {
    // TODO: Implement view logic (e.g., open modal or navigate to details page)
    this.notificationService.info('View Bin', `Bin ID: ${bin.id}`);
  }

  emptyBin(): Bin {
    return {
      id: 0,
      location: '',
      status: 'Active',
      fillLevel: 0,
      markedForCollection: false,
      description: ''
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Inactive': return 'bg-secondary';
      case 'Full': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getCollectionStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'In Progress': return 'bg-warning';
      case 'Pending': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getFillLevelColor(level: number): string {
    if (level >= 80) return 'bg-danger';
    if (level >= 60) return 'bg-warning';
    return 'bg-success';
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadBins();
  }

  closeModal() {
    this.showModal = false;
  }

  markForCollection(bin: Bin) {
    if (bin.id) {
      this.binsService.markBinForCollection(bin.id).pipe(
        catchError(error => {
          this.notificationService.error(
            'Error',
            error || 'Failed to mark bin for collection'
          );
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.notificationService.success(
            'Success',
            'Bin marked for collection'
          );
          this.loadBins();
        }
      });
    }
  }

  clearCollectionMark(bin: Bin) {
    if (bin.id) {
      this.binsService.clearBinCollectionMark(bin.id).pipe(
        catchError(error => {
          this.notificationService.error(
            'Error',
            error || 'Failed to clear collection mark'
          );
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.notificationService.success(
            'Success',
            'Collection mark cleared'
          );
          this.loadBins();
        }
      });
    }
  }
}
