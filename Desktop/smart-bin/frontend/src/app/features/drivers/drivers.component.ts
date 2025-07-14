import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

interface Driver {
  id: number;
  name: string;
  license: string;
  status: 'Active' | 'Inactive';
  description?: string;
}

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ConfirmationModalComponent],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css'
})
export class DriversComponent {
  drivers: Driver[] = [
    { id: 1, name: 'John Doe', license: 'A12345', status: 'Active', description: 'Senior driver, 5 years experience.' },
    { id: 2, name: 'Jane Smith', license: 'B67890', status: 'Inactive', description: 'On leave.' }
    // Add more drivers as needed for testing pagination
  ];
  showModal = false;
  editMode = false;
  modalDriver: Driver = this.emptyDriver();

  // Confirmation modal state
  showConfirmModal = false;
  driverToDelete: Driver | null = null;

  // Pagination
  page = 1;
  pageSize = 8;
  paginatedDrivers() {
    const start = (this.page - 1) * this.pageSize;
    return this.drivers.slice(start, start + this.pageSize);
  }
  totalPages() {
    return Math.max(1, Math.ceil(this.drivers.length / this.pageSize));
  }
  nextPage() {
    if (this.page < this.totalPages()) this.page++;
  }
  prevPage() {
    if (this.page > 1) this.page--;
  }

  emptyDriver(): Driver {
    return { id: 0, name: '', license: '', status: 'Active', description: '' };
  }

  openAdd() {
    this.editMode = false;
    this.modalDriver = this.emptyDriver();
    this.showModal = true;
  }
  openEdit(driver: Driver) {
    this.editMode = true;
    this.modalDriver = { ...driver };
    this.showModal = true;
  }
  saveDriver() {
    if (this.editMode) {
      const idx = this.drivers.findIndex(d => d.id === this.modalDriver.id);
      if (idx > -1) this.drivers[idx] = { ...this.modalDriver };
    } else {
      this.modalDriver.id = Date.now();
      this.drivers.push({ ...this.modalDriver });
    }
    this.showModal = false;
  }
  deleteDriver(driver: Driver) {
    this.driverToDelete = driver;
    this.showConfirmModal = true;
  }
  confirmDeleteDriver() {
    if (this.driverToDelete) {
      this.drivers = this.drivers.filter(d => d.id !== this.driverToDelete!.id);
      if (this.page > this.totalPages()) this.page = this.totalPages();
    }
    this.showConfirmModal = false;
    this.driverToDelete = null;
  }

  cancelDeleteDriver() {
    this.showConfirmModal = false;
    this.driverToDelete = null;
  }

  viewDriver(driver: Driver) {
    // TODO: Implement view logic (e.g., open modal or navigate to details page)
    alert('View Driver: ' + driver.name);
  }
  closeModal() {
    this.showModal = false;
  }
}
