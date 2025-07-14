import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

interface Dispatch {
  id: number;
  bin: string;
  driver: string;
  date: string;
  status: 'Pending' | 'Completed';
  description?: string;
}

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ConfirmationModalComponent],
  templateUrl: './dispatch.component.html',
  styleUrl: './dispatch.component.css'
})
export class DispatchComponent {
  dispatches: Dispatch[] = [
    { id: 1, bin: 'Bin 1', driver: 'John Doe', date: '2024-06-27', status: 'Pending', description: 'Urgent pickup required.' },
    { id: 2, bin: 'Bin 2', driver: 'Jane Smith', date: '2024-06-26', status: 'Completed', description: 'Completed on time.' }
  ];
  showModal = false;
  editMode = false;
  modalDispatch: Dispatch = this.emptyDispatch();

  // Confirmation modal state
  showConfirmModal = false;
  dispatchToDelete: Dispatch | null = null;

  emptyDispatch(): Dispatch {
    return { id: 0, bin: '', driver: '', date: '', status: 'Pending', description: '' };
  }

  openAdd() {
    this.editMode = false;
    this.modalDispatch = this.emptyDispatch();
    this.showModal = true;
  }
  openEdit(dispatch: Dispatch) {
    this.editMode = true;
    this.modalDispatch = { ...dispatch };
    this.showModal = true;
  }
  saveDispatch() {
    if (this.editMode) {
      const idx = this.dispatches.findIndex(d => d.id === this.modalDispatch.id);
      if (idx > -1) this.dispatches[idx] = { ...this.modalDispatch };
    } else {
      this.modalDispatch.id = Date.now();
      this.dispatches.push({ ...this.modalDispatch });
    }
    this.showModal = false;
  }
  deleteDispatch(dispatch: Dispatch) {
    this.dispatchToDelete = dispatch;
    this.showConfirmModal = true;
  }
  confirmDeleteDispatch() {
    if (this.dispatchToDelete) {
      this.dispatches = this.dispatches.filter(d => d.id !== this.dispatchToDelete!.id);
    }
    this.showConfirmModal = false;
    this.dispatchToDelete = null;
  }

  cancelDeleteDispatch() {
    this.showConfirmModal = false;
    this.dispatchToDelete = null;
  }

  viewDispatch(dispatch: Dispatch) {
    // TODO: Implement view logic (e.g., open modal or navigate to details page)
    alert('View Dispatch: ' + dispatch.id);
  }
  closeModal() {
    this.showModal = false;
  }
}
