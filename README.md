# Digital Notice Board System

A complete B.Tech CSE Backend Development project based on Case Study 142.

## Technology

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT authentication
- React + Vite frontend
- Axios

## Features

- Student, staff and admin roles
- JWT authentication
- Staff/admin-only notice creation
- Owner/admin-only update and delete
- Academic, event and exam categories
- Category filtering
- Date sorting
- Mongoose validation
- MongoDB Atlas support
- React notice-board frontend
- Postman collection
- Seeded demo accounts

## Project Structure

```text
digital-notice-board/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── client/
├── postman/
├── .env.example
├── package.json
├── seed.js
├── server.js
└── README.md
```

## 1. Backend setup

Install Node.js 18+.

```bash
npm install
```

Copy `.env.example` to `.env` and set your MongoDB Atlas URI and JWT secret.

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/digital_notice_board?retryWrites=true&w=majority
JWT_SECRET=your_long_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

## 2. Seed demo data

```bash
npm run seed
```

Demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| Staff | staff@example.com | password123 |
| Student | student@example.com | password123 |

Public registration always creates a student account. This prevents users from registering themselves as staff/admin.

## 3. Start backend

```bash
npm run server
```

Backend:

```text
http://localhost:5000
```

## 4. Start frontend

```bash
npm --prefix client install
npm --prefix client run dev
```

Frontend:

```text
http://localhost:5173
```

Or run both together:

```bash
npm run install-all
npm run dev
```

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Notices

```text
GET    /api/notices
GET    /api/notices/:id
POST   /api/notices
PATCH  /api/notices/:id
DELETE /api/notices/:id
```

Filtering:

```text
GET /api/notices?category=academic
GET /api/notices?category=event
GET /api/notices?category=exam
```

Sorting:

```text
GET /api/notices?sort=-postedDate
GET /api/notices?sort=postedDate
```

## Authorization

### POST /api/notices

Requires JWT and role:

```text
staff
admin
```

### PATCH /api/notices/:id

Requires JWT and:

```text
notice owner OR admin
```

### DELETE /api/notices/:id

Requires JWT and:

```text
notice owner OR admin
```

Students can view and filter notices but cannot create notices.

## Postman

Import:

```text
postman/Digital-Notice-Board.postman_collection.json
```

Set `baseUrl` to:

```text
http://localhost:5000/api
```

The login requests automatically save the returned JWT into the collection variable.

## Deployment

For Render/Railway:

- Set `MONGO_URI`
- Set `JWT_SECRET`
- Set `PORT` if required
- Set `CLIENT_URL` to the deployed frontend URL

For Vercel/Netlify frontend, set:

```env
VITE_API_URL=https://your-backend-domain.com/api
```
