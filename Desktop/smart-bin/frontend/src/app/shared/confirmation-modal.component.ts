import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  template: `
    <div class="modal-overlay-fullscreen">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Action</h5>
            <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="button" class="btn btn-danger" (click)="confirm()">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay-fullscreen {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.3);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-footer{
        display: flex;
        justify-content: flex-end;
        gap:10px;
    }
    .modal-content {
      background: #fff !important;
      padding: 18px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    /* The modal-dialog and modal-content use Bootstrap's default sizing and centering */
  `]
})
export class ConfirmationModalComponent {
  @Input() message = 'Are you sure?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() { this.confirmed.emit(); }
  cancel() { this.cancelled.emit(); }
} 