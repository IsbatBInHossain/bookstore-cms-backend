# Bookstore CMS Backend (Development)

This repository contains the backend service for the Bookstore CMS project. It provides APIs for managing books, inventory, orders, users, and payments.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose (usually included with Docker Desktop) installed and running.
- A code editor (e.g., VS Code).
- Git for version control.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/IsbatBInHossain/bookstore-cms-backend
    cd bookstore-cms-backend
    ```

2.  **Create Environment File:**

    - Make a copy of the `.env.example` file (or create a new file) named `.env` in the project root directory.
    - Fill in the required environment variables, especially:
      - `PORT` (e.g., `3000`)
      - `POSTGRES_USER`
      - `POSTGRES_PASSWORD`
      - `POSTGRES_DB`
      - `DATABASE_URL` (Format: `postgresql://USER:PASSWORD@db:5432/DATABASE`)
      - `NODE_ENV` (set to `development`)
      - _(Add other variables like `JWT_SECRET` as needed)_

    **Important:** Ensure the database credentials in `.env` match the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` variables used for the `db` service in `docker-compose.yml`. The `DATABASE_URL` _must_ use `db` as the hostname to connect to the database container.

## Running the Application (Development)

1.  **Build and Start Containers:**

    - From the project root directory, run:
      ```bash
      docker compose up --build
      ```
    - The `--build` flag is needed the first time or if you change the `Dockerfile`. Subsequent runs can often just use `docker compose up`.
    - This command will:
      - Build the `backend` Docker image (if necessary).
      - Pull the `postgres` image (if necessary).
      - Start both the `backend` and `db` containers.
      - The backend will use `nodemon` for live reloading on code changes.

2.  **Accessing the API:**
    - The backend service will be available on your host machine at the port specified in your `.env` file (e.g., `http://localhost:3000`).
    - You can test the heartbeat endpoint: `http://localhost:3000/heartbeat`

## Stopping the Application

1.  Press `Ctrl + C` in the terminal where `docker compose up` is running.
2.  Alternatively, open another terminal in the project root and run:
    ```bash
    docker compose down
    ```
    _(Use `docker compose down -v` to also remove the database volume, deleting all data.)_

## Tech Stack (Planned)

- Node.js
- Express.js
- PostgreSQL
- Prisma (ORM)
- Docker
- Meilisearch/Typesense (for search - TBD)
- React (for Admin Frontend - separate project)

---
