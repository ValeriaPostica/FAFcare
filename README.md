# FAFCare

FAFCare is an application with:

- a React + Vite frontend;
- a Node.js + Express backend;
- a PostgreSQL database;
- authentication for patients, doctors, and administrators.

## 1. Setup
### Docker setup

Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/), then open PowerShell in the project root, the folder containing `docker-compose.yml`:

```powershell
docker compose up --build -d
```

Open [http://localhost:5174](http://localhost:5174).

The application uses this internal flow:

```text
browser -> frontend/Nginx -> backend/Express -> PostgreSQL
```

The frontend is available at port `5174`. The backend is not exposed directly to the host; Nginx forwards `/api` requests to it inside Docker. PostgreSQL is exposed on port `5432` for optional database tools.

#### Daily Docker workflow

You do not need to stop and start the containers every time. If Docker Desktop and the containers are still running, open [http://localhost:5174](http://localhost:5174). After restarting the computer or Docker Desktop, run:

```powershell
docker compose up -d
```

Use `--build` after changing a Dockerfile, `docker-compose.yml`, dependencies, Vite configuration, or source code included in the production image:

```powershell
docker compose up --build -d
```

#### Docker commands

```powershell
# check container status
docker compose ps

# follow logs from all services
docker compose logs -f

# follow only backend logs
docker compose logs -f backend

# stop containers and keep the database volume
docker compose down

# start existing containers again
docker compose up -d

# stop containers and delete the database volume
# use this only when you want a completely fresh database
docker compose down -v
docker compose up --build -d
```

`docker compose down` does not delete the PostgreSQL data. `docker compose down -v` deletes the local database volume, so the schema and demo data are recreated on the next startup.

Default Docker database credentials are:

```text
Database: fafcare
User: postgres
Password: postgres
PostgreSQL port: 5432
Frontend URL: http://localhost:5174
```

Seeded demo accounts use the password `Password123!`. The Compose defaults are suitable for local development only. Do not use them in production. To override them, create a root `.env` file next to `docker-compose.yml`:

```env
POSTGRES_PASSWORD=your-local-password
SEED_PASSWORD=your-demo-password
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5174
```

`JWT_SECRET` is mandatory for Docker startup and must be long, random, and private. Do not commit `.env` to Git.

#### Docker troubleshooting

If a port is already in use, change the host side of the mapping in `docker-compose.yml`. For example, change `5174:80` to `5175:80`, then open `http://localhost:5175`.

If the frontend or API does not respond, inspect the logs:

```powershell
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

If the database was created incorrectly or you need to reimport all demo data, recreate the volume:

```powershell
docker compose down -v
docker compose up --build -d
```

During PostgreSQL installation, remember the password you choose for the `postgres` user and keep the default port:

```text
5432
```

You do not need `psql` in your PATH if you use pgAdmin.

During PostgreSQL installation, remember the password you choose for the `postgres` user and keep the default port:

```text
5432
```

You do not need `psql` in your PATH if you use pgAdmin.

## 2. Create the PostgreSQL database

### Recommended method: pgAdmin

1. Open **pgAdmin 4** from the Windows Start menu.
2. Enter the **Master Password**, if pgAdmin asks for it.
3. Expand **Servers** on the left.
4. Select the installed PostgreSQL server, for example **PostgreSQL 16**.
5. Enter the `postgres` password chosen during installation.
6. Right-click **Databases**.
7. Select **Create -> Database...**.
8. In the **Database** field, enter exactly:

```text
fafcare
```

9. Set **Owner** to `postgres`.
10. Click **Save**.

If no server is listed in pgAdmin:

1. Right-click **Servers** -> **Register** -> **Server...**.
2. In the **General** tab, set **Name** to `Local PostgreSQL`.
3. In the **Connection** tab, enter:

```text
Host name/address: localhost
Port: 5432
Maintenance database: postgres
Username: postgres
Password: your PostgreSQL password
```

4. Click **Save**, then create the `fafcare` database as described above.

## 3. Run the SQL schema

The schema creates the `users`, `patients`, `doctors`, `specialties`, `doctor_schedules`, `appointments`, `conversations`, `messages`, and `medical_records` tables.

In pgAdmin:

1. Right-click the `fafcare` database.
2. Select **Query Tool**.
3. Open `backend/src/config/schema.sql` in VS Code.
4. Copy the entire file.
5. Paste it into Query Tool.
6. Click **Execute** or press `F5`.
7. Confirm the success message, then refresh **Schemas -> public -> Tables**.

## 4. Configure the backend

Open a terminal in the project root and run:

```powershell
cd backend
npm install
copy .env.example .env
```

Open `backend/.env` and replace `YOUR_POSTGRES_PASSWORD` with your own PostgreSQL password. Every developer can use a different password because `.env` is local and is not committed:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/fafcare?sslmode=disable
PORT=5000
SEED_PASSWORD=Password123!
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=2h
CLIENT_URL=http://localhost:5174
MFA_RETURN_OTP=false
PGSSLMODE=disable
```

If your password contains URL characters such as `@`, `:`, `/`, or `#`, URL-encode them in `DATABASE_URL`. For example, `pa@ss` becomes `pa%40ss`. Do not commit `.env` to Git.

## 5. Import the CSV data

From the `backend` folder, run:

```powershell
node src/config/seed.js
```

The final output should be:

```text
Seed completed. Test password: Password123!
```

The seed script:

- reads the files from the `data` folder;
- inserts data in foreign-key order;
- creates users for patients and doctors;
- creates the administrator account;
- hashes passwords with `bcrypt`;
- assigns each seeded patient a unique deterministic demo password in the format `SEED_PASSWORD-<patient CSV id>-Patient!`;
- can be run again without duplicating the main records.

The current CSV files do not include blood type, allergies, or chronic conditions. For the demo environment, `seed.js` generates deterministic sample values for those fields for every patient. These values are test data, not real medical information, and existing non-empty values are preserved.

CSV data for which there are no tables in the current schema, such as payments, notifications, and attachments, is not imported.

## 6. Start the backend

In a terminal, run:

```powershell
cd backend
npm run dev
```

The backend should be available at:

```text
http://localhost:5000
```

Quickly verify it in a browser:

```text
http://localhost:5000/api/health
```

The expected response is:

```json
{"status":"ok"}
```

Keep this terminal open.

## 7. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the address shown by Vite, usually:

```text
http://localhost:5173
```

The frontend automatically calls the API at `http://localhost:5000/api`. To use a different backend address, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

## 8. Test accounts

All accounts imported by the seed script use this password:

```text
Password123!
```

### Patient

```text
Email: tatiana.braga1@example.md
Password: Password123!-1-Patient!
```

Seeded patients use a unique password based on their CSV `id`. For example, patient `id=2` uses
`Password123!-2-Patient!`. After the password, the login flow requires a 6-digit MFA code. For local
testing only, set `MFA_RETURN_OTP=true`; never enable this in production.

After signing in, you should see the patient dashboard, the patient's appointments, and the option to book an appointment.

### Doctor

```text
Email: doctor.1@fafcare.local
Password: Password123!
```

After signing in, you should see the doctor dashboard and the appointments assigned to that doctor.

Doctor emails are generated by the seed script in the format `doctor.N@fafcare.local`, where `N` is the doctor's ID from `doctors.csv`.

### Administrator

```text
Email: admin@fafcare.com
Password: Password123!
```

After signing in, you should see the administrator dashboard with a summary of doctors, specialties, and appointments.

To test all roles, click **Log out** after each test and sign in with the next account.

## 9. Test booking as a patient

1. Sign in with the patient account.
2. Click **Book appointment**.
3. Select a medical specialty.
4. Select a doctor.
5. Choose a date and time.
6. Click **Confirm appointment**.
7. Open **Appointments** and verify the new appointment.

The appointment is sent through the API with `patient_id`, `doctor_id`, and `schedule_slot_id`, then saved in PostgreSQL.

## 10. Useful commands

```powershell
# backend
cd backend
npm install
npm run dev

# reimport the data
node src/config/seed.js

# frontend, in a second terminal
cd frontend
npm install
npm run dev

# verify the frontend build
npm run build
```

Ports used:

```text
PostgreSQL: 5432
Backend API: 5000
Frontend Vite: 5173
```
