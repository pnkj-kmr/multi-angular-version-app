import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";

@Component({
  selector: "app-user-form",
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.css"],
})
export class UserFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() isEditMode: boolean = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData: Partial<User> = {
    username: "",
    email: "",
    full_name: "",
  };
  password: string = "";
  errorMessage: string = "";
  isLoading: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (this.user && this.isEditMode) {
      this.formData = {
        username: this.user.username,
        email: this.user.email,
        full_name: this.user.full_name,
      };
      this.password = ""; // Clear password in edit mode
    } else {
      this.password = ""; // Initialize password for new user
    }
  }

  onSubmit(): void {
    if (
      !this.formData.username ||
      !this.formData.email ||
      !this.formData.full_name
    ) {
      this.errorMessage = "Please fill in all fields";
      return;
    }

    // Validate password for new users
    if (!this.isEditMode && !this.password) {
      this.errorMessage = "Password is required";
      return;
    }

    if (!this.isEditMode && this.password.length < 6) {
      this.errorMessage = "Password must be at least 6 characters long";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    if (this.isEditMode && this.user?.id) {
      this.userService.updateUser(this.user.id, this.formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
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
              this.errorMessage = "Failed to update user. Please try again.";
            }
          } else {
            this.errorMessage = "Failed to update user. Please try again.";
          }
        },
      });
    } else {
      // Include password when creating a new user
      const userData = {
        ...this.formData,
        password: this.password,
      } as Omit<User, "id" | "created_at"> & { password: string };

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
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
              this.errorMessage = "Failed to create user. Please try again.";
            }
          } else {
            this.errorMessage = "Failed to create user. Please try again.";
          }
        },
      });
    }
  }

  onCancel(): void {
    this.formData = {
      username: "",
      email: "",
      full_name: "",
    };
    this.password = "";
    this.errorMessage = "";
    this.cancelled.emit();
  }
}
