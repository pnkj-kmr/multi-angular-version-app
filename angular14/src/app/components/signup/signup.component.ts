import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  userData: SignupRequest = {
    username: '',
    email: '',
    password: '',
    full_name: ''
  };
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.userData.username || !this.userData.email || !this.userData.password || !this.userData.full_name) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signup(this.userData).subscribe({
      next: () => {
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        this.isLoading = false;
        // Handle FastAPI validation errors (422 status)
        if (
          error.status === 422 &&
          error.error?.detail &&
          Array.isArray(error.error.detail)
        ) {
          // Extract validation error messages
          const errorMessages = error.error.detail.map((err: any) => {
            const field =
              err.loc && err.loc.length > 1
                ? err.loc[err.loc.length - 1]
                : "field";
            return `${field}: ${err.msg}`;
          });
          this.errorMessage = errorMessages.join(", ");
        } else if (error.error?.detail) {
          // Handle other error formats
          if (typeof error.error.detail === "string") {
            this.errorMessage = error.error.detail;
          } else if (
            Array.isArray(error.error.detail) &&
            error.error.detail.length > 0
          ) {
            this.errorMessage =
              error.error.detail[0].msg || "Validation error";
          } else {
            this.errorMessage = "Signup failed. Please try again.";
          }
        } else {
          this.errorMessage = "Signup failed. Please try again.";
        }
      },
    });
  }
}

