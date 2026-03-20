# DoctorInbox Backend

This is the backend repository for the DoctorInbox project.

## Technology Stack

* **Node.js** & **Express** - Core API framework
* **JSON Web Token (JWT)** - Authentication and authorization
* **Zod** - Schema validation
* **dotenv** - Environment variable management
* **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites

* Node.js installed

### Installation

1. Clone the repository and navigate to the backend directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root of the backend directory. You may need to define variables such as:
* `PORT` (e.g., 5000)
* `JWT_SECRET` (for authenticating users)

### Running the Application

* **Development mode** (with nodemon for hot-reloading):
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm start
  ```
