# Keyzoo MERN (Backend)

> REST API backend for **Keyzoo**, a full-stack MERN application.
> [One-line description of what Keyzoo does, e.g. "an online store for ..."]

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=white)

**Live API:** https://keyzoo-mern-backend-1.onrender.com

> **Note:** If the API is hosted on Render's free tier, the first request after a period of inactivity can take 30-60 seconds while the server wakes up.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

This repository contains the **backend** of Keyzoo. It exposes a REST API that the frontend consumes and handles [authentication, data storage, file/media handling, etc. - edit to match your project].

The frontend lives in a separate repository: [link to your frontend repo].

## Features

- [Feature 1, e.g. User registration and login with JWT authentication]
- [Feature 2, e.g. Product / item management (create, read, update, delete)]
- [Feature 3, e.g. Image and media handling]
- [Feature 4, e.g. Cart and order handling]
- MongoDB data storage
- Deployed and reachable over the internet via Render

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js                            |
| Framework  | Express.js                         |
| Database   | MongoDB                            |
| Hosting    | Render                             |
| Other      | [e.g. Mongoose, JWT, bcrypt, dotenv, multer, CORS] |

## Project Structure

```
Keyzoo-MERN-Backend-/
├── media/          # Static media files
├── scripts/        # Utility scripts
├── src/            # Application source code
├── .gitignore
├── package.json
└── README.md
```

> Expand `src/` here once you're happy with the layout, for example:
> `controllers/`, `models/`, `routes/`, `middleware/`, `config/`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm
- A MongoDB database, either local or a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/NipponOG/Keyzoo-MERN-Backend-.git

# 2. Move into the project folder
cd Keyzoo-MERN-Backend-

# 3. Install dependencies
npm install

# 4. Create your environment file (see the next section)
cp .env.example .env    # or create .env manually

# 5. Start the server
npm start
```

The server will run at `http://localhost:[PORT]`.

## Environment Variables

Create a `.env` file in the project root. **Never commit this file.**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
# Add any others your code uses, e.g. CLIENT_URL, CLOUDINARY_*, etc.
```

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `PORT`       | Port the server listens on           |
| `MONGO_URI`  | MongoDB connection string            |
| `JWT_SECRET` | Secret used to sign auth tokens      |
| `NODE_ENV`   | `development` or `production`        |

## Available Scripts

Check `package.json` and keep only the scripts that exist:

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Start the server                         |
| `npm run dev`   | Start the server with auto-reload (nodemon) |

## API Endpoints

Base URL: `https://keyzoo-mern-backend-1.onrender.com`

> Replace the examples below with your real routes.

| Method | Endpoint              | Description               | Auth |
| ------ | --------------------- | ------------------------- | ---- |
| GET    | `/api/[resource]`     | Get all items             | No   |
| GET    | `/api/[resource]/:id` | Get a single item         | No   |
| POST   | `/api/[resource]`     | Create an item            | Yes  |
| PUT    | `/api/[resource]/:id` | Update an item            | Yes  |
| DELETE | `/api/[resource]/:id` | Delete an item            | Yes  |

### Example request

```bash
curl https://keyzoo-mern-backend-1.onrender.com/api/[resource]
```

## Deployment

The backend is deployed on [Render](https://render.com/).

1. Push your code to GitHub.
2. Create a new **Web Service** on Render and connect this repository.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add your environment variables in the Render dashboard.
5. Deploy.

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE). *(Add a `LICENSE` file, or change this line to match your license.)*

## Contact

**NipponOG** - [github.com/NipponOG](https://github.com/NipponOG)

Project link: [github.com/NipponOG/Keyzoo-MERN-Backend-](https://github.com/NipponOG/Keyzoo-MERN-Backend-)
