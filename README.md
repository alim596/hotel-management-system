# Hotel Management System

A comprehensive hotel management system built with React, Node.js, and PostgreSQL.

## Features

### For Guests

- Account registration and profile management
- Hotel search with advanced filters
- Room booking and management
- Review and rating system
- Secure payment processing
- Email notifications

### For Hotel Managers

- Hotel profile management
- Room inventory management
- Pricing management
- Reservation dashboard
- Performance analytics
- Staff management

### For Administrators

- System-wide management
- User access control
- Analytics and reporting
- Dispute resolution
- Payment processing oversight

## Tech Stack

### Frontend

- React.js with TypeScript
- Redux for state management
- Tailwind CSS for styling
- React Router for navigation

### Backend

- Node.js with Express
- PostgreSQL database
- Redis for caching
- JWT authentication

### Third-party Services

- Stripe (payments)
- SendGrid (email)
- AWS S3 (storage)
- Google Maps API

## Setup Instructions

1. Clone the repository

```bash
git clone [repository-url]
cd hotel-management-system
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers

```bash
# Start backend server
npm run server:dev

# Start frontend development server
npm run client:dev
```

5. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── client/           # Frontend React application
│   ├── components/   # Reusable React components
│   ├── pages/        # Page components
│   ├── styles/       # CSS and style files
│   └── utils/        # Utility functions
├── server/           # Backend Node.js application
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── config/       # Configuration files
│   └── utils/        # Utility functions
└── shared/          # Shared types and utilities
    └── types/       # TypeScript type definitions
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
