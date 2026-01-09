from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
import os
import hashlib
import json

from database import SessionLocal, engine, Base
from models import User as DBUser, AuditLog as DBAuditLog

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:8008",
        "http://localhost:8008",
    ],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Pydantic models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    username: str
    action: str
    resource_type: Optional[str]
    resource_id: Optional[int]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Password utilities
def _pre_hash_password(password: str) -> str:
    """
    Pre-hash password with SHA256 to handle bcrypt's 72-byte limit.
    This allows passwords of any length while maintaining security.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Pre-hash the plain password to match the stored hash
    pre_hashed = _pre_hash_password(plain_password)
    # Convert to bytes for bcrypt
    pre_hashed_bytes = pre_hashed.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pre_hashed_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    # Pre-hash with SHA256 to handle bcrypt's 72-byte limit
    pre_hashed = _pre_hash_password(password)
    # Convert to bytes and hash with bcrypt
    pre_hashed_bytes = pre_hashed.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed_bytes, salt)
    return hashed.decode("utf-8")


# Audit logging utilities
def create_audit_log(
    db: Session,
    username: str,
    action: str,
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
):
    """Create an audit log entry"""
    audit_log = DBAuditLog(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None,
        ip_address=ip_address,
    )
    db.add(audit_log)
    db.commit()


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP address from request"""
    if request.client:
        return request.client.host
    return None


# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(DBUser).filter(DBUser.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


# Authentication endpoints
@app.post("/api/auth/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate, request: Request, db: Session = Depends(get_db)
):
    # Check if username already exists
    db_user = db.query(DBUser).filter(DBUser.username == user_data.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    db_user = db.query(DBUser).filter(DBUser.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = DBUser(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )

    # Log audit
    create_audit_log(
        db=db,
        username=user_data.username,
        action="signup",
        user_id=db_user.id,
        resource_type="user",
        resource_id=db_user.id,
        details={"email": user_data.email, "full_name": user_data.full_name},
        ip_address=get_client_ip(request),
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
async def login(
    login_data: LoginRequest, request: Request, db: Session = Depends(get_db)
):
    user = db.query(DBUser).filter(DBUser.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Log failed login attempt
        create_audit_log(
            db=db,
            username=login_data.username,
            action="login_failed",
            resource_type="auth",
            details={"reason": "Invalid credentials"},
            ip_address=get_client_ip(request),
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Log successful login
    create_audit_log(
        db=db,
        username=user.username,
        action="login",
        user_id=user.id,
        resource_type="auth",
        ip_address=get_client_ip(request),
    )

    return {"access_token": access_token, "token_type": "bearer"}


# User CRUD endpoints
@app.get("/api/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    users = db.query(DBUser).offset(skip).limit(limit).all()
    return users


@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post(
    "/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def create_user(
    user: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    # Check if username already exists
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log audit
    create_audit_log(
        db=db,
        username=current_user.username,
        action="create_user",
        user_id=current_user.id,
        resource_type="user",
        resource_id=db_user.id,
        details={
            "created_username": user.username,
            "created_email": user.email,
            "created_full_name": user.full_name,
        },
        ip_address=get_client_ip(request),
    )

    return db_user


@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Store old values for audit
    old_values = {
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
    }

    # Check if username is being updated and already exists
    if user_update.username and user_update.username != db_user.username:
        existing_user = (
            db.query(DBUser).filter(DBUser.username == user_update.username).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )
        db_user.username = user_update.username

    # Check if email is being updated and already exists
    if user_update.email and user_update.email != db_user.email:
        existing_user = (
            db.query(DBUser).filter(DBUser.email == user_update.email).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        db_user.email = user_update.email

    if user_update.full_name:
        db_user.full_name = user_update.full_name

    db.commit()
    db.refresh(db_user)

    # Log audit
    create_audit_log(
        db=db,
        username=current_user.username,
        action="update_user",
        user_id=current_user.id,
        resource_type="user",
        resource_id=user_id,
        details={
            "old_values": old_values,
            "new_values": user_update.dict(exclude_unset=True),
        },
        ip_address=get_client_ip(request),
    )

    return db_user


@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Store user info for audit before deletion
    deleted_user_info = {
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
    }

    db.delete(db_user)
    db.commit()

    # Log audit
    create_audit_log(
        db=db,
        username=current_user.username,
        action="delete_user",
        user_id=current_user.id,
        resource_type="user",
        resource_id=user_id,
        details={"deleted_user": deleted_user_info},
        ip_address=get_client_ip(request),
    )

    return None


# Audit endpoints
@app.get("/api/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    username: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    """Get audit logs with optional filtering"""
    query = db.query(DBAuditLog)

    if action:
        query = query.filter(DBAuditLog.action == action)
    if username:
        query = query.filter(DBAuditLog.username == username)

    audit_logs = (
        query.order_by(DBAuditLog.created_at.desc()).offset(skip).limit(limit).all()
    )
    return audit_logs


@app.get("/")
async def root():
    return {"message": "User Management API"}
