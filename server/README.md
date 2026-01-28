# API Server

## Setup

1. Create a MySQL database (default name: `debt_portal`).
2. Copy `.env.example` to `.env` and update the credentials.
3. Run the schema migration:

```bash
mysql -u <user> -p debt_portal < server/sql/schema.sql
```

## Start the API

```bash
npm run server
```

The API will be available at `http://localhost:4000/api` by default.
