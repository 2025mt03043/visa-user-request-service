# Visa User & Request Service

Node.js and Express microservice for user authentication, profile management, and visa appointment requests.

## Features
- Supabase user registration and login
- User profile management
- Create and retrieve appointment requests
- Cancel eligible appointment requests
- Validate preferred dates through the Slot Availability Service

## Technology
- Node.js
- Express.js
- Supabase Auth and PostgreSQL
- Zod
- Supertest

## Local Setup

    npm install

Configure your environment variables using `.env.example`.

Start the service:

    npm run dev

Run tests:

    npm test

## API

Base URL: `http://localhost:5051/api`

Health check: `GET /health`
