# Backend Developer Test

This project was completed as a take-home task, it is a full-stack app that supports

- Patients
  - List all patients
  - Creating patients
  - Viewing patient bookings
  - Searching for, and booking, an appointment slot with a doctor
- Doctors
  - List all doctors
  - Creating doctors
  - Creating one-time and repeating appointment slots
  - Viewing, managing doctor slots and bookings

## Application Setup - With Docker

This application is simple to setup with docker, simply run the command below to deploy the full-stack app and database

```
docker-compose up --build
```

## Application Setup - Manually

Outside of docker, you'll need to create a `.env` file with the following values:

```
DATABASE_URL="postgresql://example:example@localhost:5432/example"
```

and then run the following commands to build the app

```
npm install
npm run build
npm run db:push
```

and then run the following command to start it

```
npm start
```

## API Documentation

The repo has a Postman collection, `api_doc.postman_collection.json` that you can import to view all API routes and how to interact with them

As a note - when you query slot availability and a repeating slot rule applies, the slots are created dynamically and sent back to the client without being saved in teh database. Depending on whether the slot is one-time (saved already with an ID in the `slots` table), or repeating, you need to interact with the API to book it in a different way. This is handled by the frontend.

For example, to book a slot already saved

```json
{
  "slot_type": "present_in_database",
  "slot_id": "ly1um3rz5g3ztrn94mtbekra"
}
```

or to book a repeating slot

```json
{
  "slot_type": "rule_generated",
  "rule_slot": {
    "rule_id": "j1k3hugyaz0qgqcgtlhagybo",
    "starts_at": "2014-12-25T12:00:00.000Z",
    "ends_at": "2014-12-25T12:15:00.000Z"
  }
}
```

## Technologies Used

- **NextJS** - React framework hosting the Frontend and Backend API
- **ShadCN, Tailwind** - UI Library for the frontend
- **Drizzle** - Provide type safety while interacting with Postgres
- **Postgres** - Database

## Frontend interface access instructions

Once the app has started, simply visit `{your_base_url}/` to view the frontend. For example, `http://localhost:3000/`
