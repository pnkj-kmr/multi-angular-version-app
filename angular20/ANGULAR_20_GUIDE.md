# Angular 20 Guide for Angular 14 Developers

This guide explains the key differences between Angular 14 and Angular 20, using the codebase examples.

## Table of Contents
1. [Architecture Changes](#architecture-changes)
2. [Standalone Components](#standalone-components)
3. [Signals](#signals)
4. [Control Flow Syntax](#control-flow-syntax)
5. [Input/Output Functions](#inputoutput-functions)
6. [Bootstrap Changes](#bootstrap-changes)
7. [Routing](#routing)
8. [Services](#services)
9. [Build Tools](#build-tools)

---

## Architecture Changes

### Angular 14 (Module-Based)
```typescript
// app.module.ts
@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [BrowserModule, FormsModule, RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Angular 20 (Standalone)
```typescript
// No NgModule needed! Components are standalone
// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,  // ← Key difference
  imports: [RouterOutlet],  // ← Direct imports
  template: `<router-outlet></router-outlet>`
})
export class AppComponent { }
```

**Key Points:**
- ❌ No `@NgModule` decorator needed
- ✅ Components import dependencies directly
- ✅ More tree-shakable and performant
- ✅ Simpler mental model

---

## Standalone Components

### Angular 14 Pattern
```typescript
// login.component.ts
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent { }

// Must be declared in app.module.ts
@NgModule({
  declarations: [LoginComponent],  // ← Required
  imports: [CommonModule, FormsModule]
})
```

### Angular 20 Pattern
```typescript
// login.page.ts
@Component({
  selector: 'app-login-page',
  standalone: true,  // ← Standalone flag
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InfraonButtonComponent,  // ← Direct component imports
    InfraonFormInputComponent
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage { }
```

**Benefits:**
- ✅ No module declarations needed
- ✅ Components are self-contained
- ✅ Better code splitting
- ✅ Easier to understand dependencies

---

## Signals

### Angular 14 (RxJS Observables)
```typescript
// auth.service.ts (Angular 14)
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  login() {
    this.isAuthenticatedSubject.next(true);
  }
}

// component.ts (Angular 14)
export class LoginComponent {
  isAuthenticated$ = this.authService.isAuthenticated$;
}

// template (Angular 14)
<div *ngIf="isAuthenticated$ | async">Content</div>
```

### Angular 20 (Signals)
```typescript
// auth.service.ts (Angular 20)
export class AuthService {
  private token = signal<string | null>(null);
  
  // Computed signal - automatically updates when token changes
  isAuthenticated = computed(() => !!this.token());
  
  login() {
    this.token.set('new-token');
    // isAuthenticated automatically updates!
  }
}

// component.ts (Angular 20)
export class LoginPage {
  credentials = signal<LoginRequest>({
    username: '',
    password: ''
  });
  
  updateUsername(value: string): void {
    // Update signal immutably
    this.credentials.update(c => ({ ...c, username: value }));
  }
}

// template (Angular 20)
<div>{{ credentials().username }}</div>  <!-- Call signal as function -->
```

**Key Differences:**
- ✅ Signals are synchronous (no async pipe needed)
- ✅ Better performance (fine-grained reactivity)
- ✅ Simpler syntax: `signal()` instead of `new BehaviorSubject()`
- ✅ Computed signals automatically track dependencies
- ✅ No subscription management needed

**Signal Methods:**
```typescript
// Create
const count = signal(0);

// Read
const value = count();  // Call as function

// Update
count.set(10);  // Set new value
count.update(v => v + 1);  // Update based on current value

// Computed (derived signal)
const doubled = computed(() => count() * 2);
```

---

## Control Flow Syntax

### Angular 14 (@if, @for, @switch)
```html
<!-- Angular 14 -->
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let item of items">{{ item }}</div>
<div [ngSwitch]="status">
  <div *ngSwitchCase="'active'">Active</div>
</div>
```

### Angular 20 (New Control Flow)
```html
<!-- Angular 20 - New syntax -->
@if (isLoading()) {
  <div>Loading...</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <div>No items found</div>
}

@switch (status()) {
  @case ('active') {
    <div>Active</div>
  }
  @default {
    <div>Inactive</div>
  }
}
```

**Benefits:**
- ✅ Better performance (built into Angular)
- ✅ More readable
- ✅ Better type checking
- ✅ `@empty` block for empty lists
- ✅ `track` function for better list rendering

**Example from Login Page:**
```html
@if (errorMessage()) {
  <div class="error-message">
    {{ errorMessage() }}
  </div>
}
```

---

## Input/Output Functions

### Angular 14
```typescript
// form-input.component.ts
@Component({...})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Output() valueChange = new EventEmitter<string>();
}
```

### Angular 20
```typescript
// form-input.component.ts
@Component({...})
export class FormInputComponent {
  // Input function - type-safe and required by default
  label = input.required<string>();
  type = input<string>('text');  // Optional with default
  placeholder = input<string>('');
  required = input<boolean>(false);
  value = input<string>('');
  
  // Output function
  valueChange = output<string>();
}
```

**Benefits:**
- ✅ Type-safe inputs
- ✅ `input.required<T>()` for required inputs
- ✅ Default values in input definition
- ✅ Better IntelliSense support
- ✅ Simpler output syntax

**Usage:**
```html
<!-- Angular 20 -->
<infraon-form-input
  label="Username"
  [value]="credentials().username"
  (valueChange)="updateUsername($event)"
/>
```

---

## Bootstrap Changes

### Angular 14
```typescript
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

### Angular 20
```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),  // ← Instead of HttpClientModule
    provideAnimations()   // ← Instead of BrowserAnimationsModule
  ]
}).catch(err => console.error(err));
```

**Key Changes:**
- ✅ `bootstrapApplication()` instead of `bootstrapModule()`
- ✅ `provide*` functions instead of modules
- ✅ No `AppModule` needed
- ✅ More explicit dependency injection

**Common Providers:**
```typescript
provideRouter(routes)           // Router
provideHttpClient()             // HTTP client
provideAnimations()             // Animations
provideZoneChangeDetection()    // Zone.js (optional in future)
```

---

## Routing

### Angular 14
```typescript
// app-routing.module.ts
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### Angular 20
```typescript
// app.routes.ts (no module!)
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { SignupPage } from './pages/signup/signup.page';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: '**', redirectTo: '/login' }
];
```

**Usage in Component:**
```typescript
// Angular 20 - Import RouterLink directly
@Component({
  standalone: true,
  imports: [RouterLink],  // ← Direct import
  template: `<a routerLink="/login">Login</a>`
})
```

---

## Services

### Angular 14 vs Angular 20

**Both use `@Injectable({ providedIn: 'root' })`**, but Angular 20 can use signals:

```typescript
// Angular 20 Service with Signals
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal for reactive state
  private token = signal<string | null>(localStorage.getItem('token'));
  
  // Computed signal - automatically updates
  isAuthenticated = computed(() => !!this.token());
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post('/api/auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.token.set(response.access_token);  // ← Updates computed signal
      })
    );
  }
}
```

**In Component:**
```typescript
// Angular 20
export class LoginPage {
  constructor(private authService: AuthService) {}
  
  // No subscription needed! Just read the computed signal
  get isAuth() {
    return this.authService.isAuthenticated();
  }
}
```

---

## Build Tools

### Angular 14
- Uses Webpack (via Angular CLI)
- `ng serve` and `ng build`
- Slower builds

### Angular 20
- Can use Vite (faster builds)
- `vite.config.ts` for configuration
- Much faster HMR (Hot Module Replacement)

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4200
  }
});
```

---

## Code Comparison Examples

### Component State Management

**Angular 14:**
```typescript
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';
  isLoading = false;
  
  updateUsername(value: string) {
    this.credentials.username = value;  // Direct mutation
  }
}
```

**Angular 20:**
```typescript
export class LoginPage {
  credentials = signal<LoginRequest>({
    username: '',
    password: ''
  });
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  
  updateUsername(value: string) {
    // Immutable update
    this.credentials.update(c => ({ ...c, username: value }));
  }
}
```

### Template Syntax

**Angular 14:**
```html
<div *ngIf="errorMessage">{{ errorMessage }}</div>
<input [(ngModel)]="credentials.username" />
<div *ngFor="let item of items">{{ item }}</div>
```

**Angular 20:**
```html
@if (errorMessage()) {
  <div>{{ errorMessage() }}</div>
}
<input [value]="credentials().username" (input)="updateUsername($event)" />
@for (item of items(); track item.id) {
  <div>{{ item }}</div>
}
```

---

## Migration Tips

### 1. Convert Components to Standalone
```typescript
// Before (Angular 14)
@Component({...})
export class MyComponent { }

// After (Angular 20)
@Component({
  standalone: true,  // ← Add this
  imports: [CommonModule, ...],  // ← Add imports
  ...
})
export class MyComponent { }
```

### 2. Replace Observables with Signals
```typescript
// Before
private subject = new BehaviorSubject(false);
value$ = this.subject.asObservable();

// After
value = signal(false);
// Use value() to read, value.set() to update
```

### 3. Update Control Flow
```html
<!-- Before -->
<div *ngIf="condition">Content</div>

<!-- After -->
@if (condition()) {
  <div>Content</div>
}
```

### 4. Update Inputs/Outputs
```typescript
// Before
@Input() name: string = '';
@Output() change = new EventEmitter();

// After
name = input<string>('');
change = output();
```

---

## Best Practices in Angular 20

1. **Use Signals for Component State**
   ```typescript
   // ✅ Good
   count = signal(0);
   doubled = computed(() => count() * 2);
   
   // ❌ Avoid (unless needed for async operations)
   count$ = new BehaviorSubject(0);
   ```

2. **Use Standalone Components**
   ```typescript
   // ✅ Good - Standalone
   @Component({ standalone: true, ... })
   
   // ❌ Avoid - Module-based (unless migrating legacy code)
   @Component({ ... })
   @NgModule({ declarations: [...] })
   ```

3. **Use New Control Flow**
   ```html
   <!-- ✅ Good -->
   @if (condition()) { ... }
   
   <!-- ❌ Avoid -->
   <div *ngIf="condition">...</div>
   ```

4. **Use Input/Output Functions**
   ```typescript
   // ✅ Good
   label = input.required<string>();
   
   // ❌ Avoid (unless needed for compatibility)
   @Input() label: string = '';
   ```

---

## Common Patterns in This Codebase

### 1. Form Handling with Signals
```typescript
// login.page.ts
credentials = signal<LoginRequest>({ username: '', password: '' });

updateUsername(value: string): void {
  this.credentials.update(c => ({ ...c, username: value }));
}
```

### 2. Error Handling
```typescript
error: (error) => {
  if (error.status === 422 && Array.isArray(error.error?.detail)) {
    const messages = error.error.detail.map(err => 
      `${err.loc[err.loc.length - 1]}: ${err.msg}`
    );
    this.errorMessage.set(messages.join(', '));
  }
}
```

### 3. Loading States
```typescript
isLoading = signal<boolean>(false);

this.isLoading.set(true);
this.service.call().subscribe({
  next: () => this.isLoading.set(false),
  error: () => this.isLoading.set(false)
});
```

---

## Summary

| Feature | Angular 14 | Angular 20 |
|---------|-----------|------------|
| Architecture | NgModules | Standalone Components |
| State Management | RxJS Observables | Signals |
| Control Flow | `*ngIf`, `*ngFor` | `@if`, `@for` |
| Inputs/Outputs | `@Input()`, `@Output()` | `input()`, `output()` |
| Bootstrap | `bootstrapModule()` | `bootstrapApplication()` |
| Providers | Modules | `provide*()` functions |
| Build Tool | Webpack | Vite (optional) |

**Key Takeaway:** Angular 20 is simpler, more performant, and has better developer experience than Angular 14. The main concepts remain the same, but the syntax and patterns are more modern and efficient.

