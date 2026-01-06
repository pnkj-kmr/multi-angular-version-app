# FastAPI Backend

FastAPI backend server for user management with SQLite database.

## Features

- User authentication (login/signup) with JWT tokens
- User CRUD operations (Create, Read, Update, Delete)
- SQLite database for data storage
- CORS enabled for Angular frontend

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get access token

### Users (Requires Authentication)
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/{user_id}` - Update a user
- `DELETE /api/users/{user_id}` - Delete a user

## Database

The SQLite database file (`users.db`) will be created automatically when you first run the server.

