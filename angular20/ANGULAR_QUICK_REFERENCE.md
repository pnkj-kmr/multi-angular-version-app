# Angular 14 → Angular 20 Quick Reference

## Component Declaration

### Angular 14
```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent { }

// Must declare in module
@NgModule({
  declarations: [LoginComponent]
})
```

### Angular 20
```typescript
@Component({
  selector: 'app-login',
  standalone: true,  // ← Add this
  imports: [CommonModule, FormsModule],  // ← Add imports here
  templateUrl: './login.component.html'
})
export class LoginComponent { }
// No module needed!
```

---

## State Management

### Angular 14
```typescript
// Service
private subject = new BehaviorSubject(false);
value$ = this.subject.asObservable();

// Component
value$ = this.service.value$;

// Template
<div *ngIf="value$ | async">Content</div>
```

### Angular 20
```typescript
// Service
value = signal(false);
computedValue = computed(() => value() * 2);

// Component
value = signal(0);
updateValue() {
  this.value.set(10);
  // or
  this.value.update(v => v + 1);
}

// Template
<div>{{ value() }}</div>  <!-- Call as function -->
@if (value()) { ... }
```

---

## Control Flow

### Angular 14
```html
<div *ngIf="condition">Show</div>
<div *ngFor="let item of items">{{ item }}</div>
<div [ngSwitch]="value">
  <div *ngSwitchCase="'a'">A</div>
</div>
```

### Angular 20
```html
@if (condition()) {
  <div>Show</div>
}

@for (item of items(); track item.id) {
  <div>{{ item }}</div>
} @empty {
  <div>No items</div>
}

@switch (value()) {
  @case ('a') {
    <div>A</div>
  }
  @default {
    <div>Other</div>
  }
}
```

---

## Inputs & Outputs

### Angular 14
```typescript
@Input() name: string = '';
@Input('alias') title: string = '';
@Output() change = new EventEmitter<string>();
```

### Angular 20
```typescript
name = input<string>('');  // Optional with default
name = input.required<string>();  // Required
title = input<string>('', { alias: 'alias' });
change = output<string>();
```

---

## Forms

### Angular 14
```html
<input [(ngModel)]="username" name="username" />
```

### Angular 20
```html
<input 
  [value]="username()" 
  (input)="updateUsername($event.target.value)" 
/>
```

Or with signals:
```typescript
username = signal('');
updateUsername(value: string) {
  this.username.set(value);
}
```

---

## Routing

### Angular 14
```typescript
// app-routing.module.ts
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### Angular 20
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'login', component: LoginPage }
];

// In main.ts
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});
```

---

## Bootstrap

### Angular 14
```typescript
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

### Angular 20
```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
}).catch(err => console.error(err));
```

---

## Common Patterns

### Loading State
```typescript
// Angular 20
isLoading = signal(false);

this.isLoading.set(true);
this.service.call().subscribe({
  next: () => this.isLoading.set(false),
  error: () => this.isLoading.set(false)
});
```

### Error Handling
```typescript
// Angular 20
errorMessage = signal('');

error: (error) => {
  if (error.status === 422 && Array.isArray(error.error?.detail)) {
    const messages = error.error.detail.map(err => 
      `${err.loc[err.loc.length - 1]}: ${err.msg}`
    );
    this.errorMessage.set(messages.join(', '));
  }
}
```

### Form Updates
```typescript
// Angular 20
formData = signal({ username: '', email: '' });

updateUsername(value: string) {
  this.formData.update(f => ({ ...f, username: value }));
}
```

---

## Signal Cheat Sheet

```typescript
// Create
const count = signal(0);
const name = signal<string>('');

// Read
const value = count();  // Call as function

// Update
count.set(10);
count.update(v => v + 1);

// Computed (derived)
const doubled = computed(() => count() * 2);

// Effect (side effects)
effect(() => {
  console.log('Count changed:', count());
});
```

---

## File Structure Comparison

### Angular 14
```
src/app/
  app.module.ts          ← Required
  app-routing.module.ts  ← Required
  components/
    login/
      login.component.ts
```

### Angular 20
```
src/app/
  app.component.ts       ← Standalone
  app.routes.ts          ← No module wrapper
  pages/
    login/
      login.page.ts      ← Standalone
```

---

## Key Differences Summary

| Concept | Angular 14 | Angular 20 |
|---------|-----------|------------|
| **Components** | Module-based | Standalone |
| **State** | RxJS | Signals |
| **Conditional** | `*ngIf` | `@if` |
| **Loop** | `*ngFor` | `@for` |
| **Input** | `@Input()` | `input()` |
| **Output** | `@Output()` | `output()` |
| **Bootstrap** | `bootstrapModule()` | `bootstrapApplication()` |
| **HTTP** | `HttpClientModule` | `provideHttpClient()` |
| **Router** | `RouterModule` | `provideRouter()` |

---

## Migration Checklist

- [ ] Convert components to `standalone: true`
- [ ] Add `imports` array to components
- [ ] Replace `*ngIf` with `@if`
- [ ] Replace `*ngFor` with `@for`
- [ ] Replace `BehaviorSubject` with `signal()`
- [ ] Replace `@Input()` with `input()`
- [ ] Replace `@Output()` with `output()`
- [ ] Update bootstrap to `bootstrapApplication()`
- [ ] Replace modules with `provide*()` functions
- [ ] Remove `AppModule` and routing module

