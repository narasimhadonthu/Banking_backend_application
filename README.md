# Banking & Digital Wallet Backend System

A secure and scalable REST API backend for a banking and digital wallet application built using Node.js, Express.js, and MongoDB. The system supports user authentication, multiple bank accounts, fund transfers, and ledger-based transaction management.

## Features

- **User Authentication:** Secure registration and login using JWT access and refresh tokens.
- **Password Security:** Password hashing using bcrypt.
- **Account Management:** Users can create and manage multiple bank accounts.
- **Fund Transfers:** Transfer funds between accounts securely.
- **Ledger-Based Accounting:** Maintains immutable CREDIT and DEBIT entries instead of directly storing account balances.
- **Balance Calculation:** Calculates account balances dynamically using MongoDB aggregation pipelines.
- **Atomic Transactions:** Uses MongoDB transactions to ensure debit and credit operations succeed or fail together.
- **Idempotency:** Uses unique idempotency keys to prevent duplicate transfers.
- **Role-Based Authorization:** Restricts sensitive operations to authorized system users.
- **Email Notifications:** Sends email notifications using Nodemailer and Gmail OAuth2.
- **Transaction History:** Maintains a detailed history of financial transactions.

## Tech Stack

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**Authentication & Security:** JWT, bcrypt, HTTP-only Cookies

**Email Service:** Nodemailer, Gmail OAuth2

**Development Tools:** Git, GitHub, Postman, VS Code

## Project Architecture

```text
BANK/
│
├── src/
│   ├── configs/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blackList.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── accounts.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   │
│   ├── services/
│   │   └── email.service.js
│   │
│   └── app.js
│
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## API Endpoints

Base URL: `http://localhost:3000`

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/refresh` | Generate a new access token |
| POST | `/api/auth/logout` | Logout and invalidate the refresh token |

### Account APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts` | Create a bank account |
| GET | `/api/accounts` | Get all user accounts |
| GET | `/api/accounts/:accountId/balance` | Get account balance |

### Transaction APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions/transfer` | Transfer funds between accounts |
| GET | `/api/transactions/:transactionId` | Get transaction details |
| POST | `/api/transactions/initial-funds` | Add initial funds through an authorized system user |

*Protected endpoints require valid authentication and appropriate authorization.*

## Ledger-Based Accounting

This application follows a ledger-based accounting approach to maintain financial consistency.

Instead of storing account balances directly, every transfer generates two ledger entries:

- **DEBIT:** Deducts the transfer amount from the sender's account.
- **CREDIT:** Adds the transfer amount to the receiver's account.

The account balance is calculated using MongoDB aggregation:

**Balance = Total Credits - Total Debits**

This approach provides a detailed financial history and helps maintain transaction consistency.

## Transaction Workflow

1. Validate sender and receiver account details.
2. Check account status and available balance.
3. Validate the idempotency key.
4. Create a pending transaction.
5. Create DEBIT and CREDIT ledger entries.
6. Mark the transaction as completed.
7. Commit all database operations using a MongoDB transaction.
8. Send email notification after successful transaction completion.

MongoDB sessions and transactions ensure that related database operations are committed together or rolled back if an error occurs.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/narasimhadonthu/Banking_backend_application.git
```

### 2. Navigate to the Project Directory

```bash
cd Banking_backend_application
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

Add any additional email service credentials required by your implementation.

**Important:** Never commit your `.env` file or expose your database credentials and secret keys.

### 5. Start the Server

```bash
node server.js
```

The backend server will run at:

```text
http://localhost:3000
```

## Testing

Use Postman to test the REST APIs.

Test the following functionalities:

- User registration and login.
- JWT authentication and authorization.
- Account creation and balance calculation.
- Fund transfers between accounts.
- Duplicate transfer prevention using idempotency keys.
- Transaction consistency and rollback.
- Transaction history and email notifications.

## Future Improvements

- Add pagination and filtering for transaction history.
- Implement rate limiting and additional security controls.
- Add comprehensive unit and integration tests.
- Deploy the backend and connect it to a cloud-hosted MongoDB database.
- Implement transaction reversal and reconciliation workflows.

## Author

**Donthu Lakshmi Narasimha**

GitHub: [narasimhadonthu](https://github.com/narasimhadonthu)

LinkedIn: [Donthu Narasimha](https://linkedin.com/in/donthu-narasimha-1b5734440/)
