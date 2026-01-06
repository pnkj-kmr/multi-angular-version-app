# Multi-Angular Version App

A full-stack user management application built with Angular 14 and FastAPI. This project demonstrates a modern web application with user authentication, CRUD operations, and comprehensive audit logging.

## 🏗️ Project Structure

```
multi-angular-version-app/
├── angular14/          # Angular 14 frontend application
│   ├── src/
│   │   └── app/
│   │       ├── components/    # Reusable components (login, signup, user-form, user-list)
│   │       ├── pages/         # Page components (home, audit)
│   │       ├── services/      # API services (auth, user, audit, api)
│   │       ├── guards/        # Route guards (auth guard)
│   │       └── models/        # TypeScript interfaces
│   └── package.json
│
└── apiserver/          # FastAPI backend application
    ├── main.py         # Main API application
    ├── models.py      # SQLAlchemy database models
    ├── database.py    # Database configuration
    ├── requirements.txt
    └── users.db       # SQLite database (auto-generated)
```

## ✨ Features

### Frontend (Angular 14)
- **User Authentication**
  - Login page with JWT token-based authentication
  - Signup page for new user registration
  - Protected routes with authentication guard

- **User Management**
  - View all users in a table
  - Add new users with password
  - Edit existing users
  - Delete users with confirmation

- **Audit Logs**
  - View comprehensive activity logs
  - Filter by action type (login, signup, create, update, delete)
  - Filter by username
  - View detailed change information

- **Reusable Components**
  - Modular component architecture
  - Shared services for API communication
  - Consistent styling and UI patterns

### Backend (FastAPI)
- **RESTful API**
  - User CRUD operations
  - JWT-based authentication
  - Password hashing with bcrypt (SHA256 pre-hashing for long passwords)

- **Database**
  - SQLite database for data persistence
  - User table with authentication fields
  - Audit log table for activity tracking

- **Audit Logging**
  - Automatic logging of all user activities
  - Tracks login attempts (successful and failed)
  - Records user creation, updates, and deletions
  - Captures IP addresses and timestamps
  - Stores detailed change information

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) and **npm** or **pnpm**
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Backend Setup

1. Navigate to the API server directory:
   ```bash
   cd apiserver
   ```

2. Create a virtual environment (if not already created):
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the server:
   ```bash
   # Using the provided script:
   ./run.sh
   
   # Or directly with uvicorn:
   uvicorn main:app --reload --port 8000
   ```

The API server will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the Angular application directory:
   ```bash
   cd angular14
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   pnpm start
   ```

The Angular application will be available at `http://localhost:4200`

## 🏗️ Building for Production

### Frontend Build

To build the Angular application for production:

1. Navigate to the Angular application directory:
   ```bash
   cd angular14
   ```

2. Build the application:
   ```bash
   npm run build
   # or
   pnpm build
   ```

3. The production build will be created in the `dist/angular14-app` directory.

4. The built files can be served using any static file server, such as:
   - **nginx**: Configure nginx to serve files from `dist/angular14-app`
   - **Apache**: Configure Apache to serve files from `dist/angular14-app`
   - **Node.js**: Use `serve` package: `npx serve -s dist/angular14-app`

### Backend Production Deployment

For production deployment of the FastAPI backend:

1. Set environment variables:
   ```bash
   export SECRET_KEY="your-secret-key-here"
   ```

2. Run with a production ASGI server:
   ```bash
   # Using uvicorn with multiple workers
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   
   # Or using gunicorn with uvicorn workers
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

3. **Recommended**: Use a reverse proxy (nginx or Apache) in front of the FastAPI application.

4. **Security Considerations**:
   - Change the default `SECRET_KEY` in production
   - Use HTTPS in production
   - Configure proper CORS origins
   - Use environment variables for sensitive configuration
   - Consider using a production database (PostgreSQL, MySQL) instead of SQLite

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users (Protected - Requires Authentication)
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/{user_id}` - Update a user
- `DELETE /api/users/{user_id}` - Delete a user

### Audit Logs (Protected - Requires Authentication)
- `GET /api/audit-logs` - Get audit logs
  - Query parameters:
    - `skip` - Number of records to skip (default: 0)
    - `limit` - Maximum number of records (default: 100)
    - `action` - Filter by action type (optional)
    - `username` - Filter by username (optional)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users sign up or log in through the frontend
2. The backend returns a JWT access token
3. The token is stored in localStorage
4. All protected API requests include the token in the Authorization header
5. The backend validates the token for each protected endpoint

## 🗄️ Database

The application uses SQLite for simplicity. The database file (`users.db`) is automatically created when you first run the server.

### Tables

- **users**: Stores user information
  - id, username, email, full_name, hashed_password, created_at

- **audit_logs**: Stores activity logs
  - id, user_id, username, action, resource_type, resource_id, details, ip_address, created_at

## 🎨 Frontend Architecture

### Components
- **LoginComponent**: User login form
- **SignupComponent**: User registration form
- **UserFormComponent**: Reusable form for adding/editing users
- **UserListComponent**: Displays list of users
- **HomeComponent**: Main page with user management
- **AuditComponent**: Audit log viewer with filtering

### Services
- **AuthService**: Handles authentication (login, signup, logout)
- **UserService**: Manages user CRUD operations
- **AuditService**: Fetches audit logs
- **ApiService**: Base HTTP service with token management

### Guards
- **AuthGuard**: Protects routes requiring authentication

## 🔍 Audit Logging

The system automatically logs the following activities:

- **login**: Successful user login
- **login_failed**: Failed login attempts
- **signup**: New user registration
- **create_user**: User creation by admin
- **update_user**: User information updates (includes old/new values)
- **delete_user**: User deletion (includes deleted user info)

Each audit log entry includes:
- User who performed the action
- Action type
- Resource affected
- Timestamp
- IP address
- Additional details (JSON format)

## 🛠️ Technology Stack

### Frontend
- **Angular 14** - Frontend framework
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **Angular Router** - Routing
- **Angular Forms** - Form handling

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Pydantic** - Data validation

## 📝 Development Notes

- The Angular app uses TypeScript with strict mode enabled
- The backend uses type hints and Pydantic models for validation
- CORS is enabled for the Angular dev server (`http://localhost:4200`)
- Passwords are pre-hashed with SHA256 before bcrypt to handle passwords longer than 72 bytes
- The database schema is automatically created on first run

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a sample application for demonstration purposes. Feel free to use it as a starting point for your own projects.

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

