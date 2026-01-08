# SeroChat Backend

ASP.NET Core Web API for SeroChat application.

## Features

- RESTful API endpoints for chat messages
- User management
- CORS enabled for frontend integration
- Swagger/OpenAPI documentation

## Prerequisites

- .NET 8.0 SDK or later

## Getting Started

### Build the project

```bash
dotnet build
```

### Run the project

```bash
dotnet run
```

The API will be available at:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001

### API Documentation

Swagger UI is available at: https://localhost:5001/swagger

## API Endpoints

### Chat
- `GET /api/chat/messages` - Get all messages
- `POST /api/chat/messages` - Send a new message
- `DELETE /api/chat/messages/{id}` - Delete a message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create a new user
