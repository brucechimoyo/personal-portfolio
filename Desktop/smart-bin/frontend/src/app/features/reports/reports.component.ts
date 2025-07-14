import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

interface Report {
  id: number;
  title: string;
  date: string;
  status: 'Draft' | 'Finalized';
  description?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ConfirmationModalComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  reports: Report[] = [
    { id: 1, title: 'Weekly Summary', date: '2024-06-27', status: 'Finalized', description: 'Covers all bin activity for the week.' },
    { id: 2, title: 'Incident Report', date: '2024-06-26', status: 'Draft', description: 'Pending review by supervisor.' }
  ];
  showModal = false;
  editMode = false;
  modalReport: Report = this.emptyReport();

  // Confirmation modal state
  showConfirmModal = false;
  reportToDelete: Report | null = null;

  emptyReport(): Report {
    return { id: 0, title: '', date: '', status: 'Draft', description: '' };
  }

  openAdd() {
    this.editMode = false;
    this.modalReport = this.emptyReport();
    this.showModal = true;
  }
  openEdit(report: Report) {
    this.editMode = true;
    this.modalReport = { ...report };
    this.showModal = true;
  }
  saveReport() {
    if (this.editMode) {
      const idx = this.reports.findIndex(r => r.id === this.modalReport.id);
      if (idx > -1) this.reports[idx] = { ...this.modalReport };
    } else {
      this.modalReport.id = Date.now();
      this.reports.push({ ...this.modalReport });
    }
    this.showModal = false;
  }
  deleteReport(report: Report) {
    this.reportToDelete = report;
    this.showConfirmModal = true;
  }

  confirmDeleteReport() {
    if (this.reportToDelete) {
      this.reports = this.reports.filter(r => r.id !== this.reportToDelete!.id);
    }
    this.showConfirmModal = false;
    this.reportToDelete = null;
  }

  cancelDeleteReport() {
    this.showConfirmModal = false;
    this.reportToDelete = null;
  }

  viewReport(report: Report) {
    // TODO: Implement view logic (e.g., open modal or navigate to details page)
    alert('View Report: ' + report.title);
  }
  closeModal() {
    this.showModal = false;
  }
}
