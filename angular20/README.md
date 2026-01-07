# Angular 20 App

This is an Angular 20 application built with modern Angular 20 features including signals, standalone components, and control flow syntax.

## Features

- **Login Page**: Modern login page with JWT authentication
- **Reusable Components**: Form input and button components
- **Signals**: Using Angular signals for reactive state management
- **Control Flow**: Using new @if, @for syntax (Angular 17+)
- **Standalone Components**: No NgModules, all components are standalone
- **Modern Routing**: Angular Router with standalone components

## Installation

```bash
npm install
# or
pnpm install
```

## Development server

Run `ng serve` or `npm start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Architecture

### Pages
- **LoginPage** (`pages/login/`): Login page using signals and modern Angular patterns

### Components
- **FormInputComponent** (`components/form-input/`): Reusable form input component
- **ButtonComponent** (`components/button/`): Reusable button component with variants

### Services
- **AuthService**: Authentication service using signals
- **ApiService**: HTTP service for API communication

### Modern Angular 20 Features
- **Signals**: Reactive state management with `signal()` and `computed()`
- **Control Flow**: Using `@if`, `@for` instead of `*ngIf`, `*ngFor`
- **Input/Output Functions**: Using `input()` and `output()` functions
- **Standalone Components**: All components are standalone
- **Modern Bootstrap**: Using `bootstrapApplication()` instead of NgModules

