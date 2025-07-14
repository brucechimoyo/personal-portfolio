import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './auth.service';
import { NotificationService } from '../shared/notification.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      
      this.auth.login(username, password).pipe(
        catchError(error => {
          this.notificationService.error(
            'Login Failed',
            error || 'Invalid username or password'
          );
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe(response => {
        if (response?.success) {
          this.notificationService.success(
            'Login Successful',
            'Welcome back!'
          );
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.notificationService.warning(
        'Form Validation',
        'Please fill in all required fields'
      );
    }
  }
}
