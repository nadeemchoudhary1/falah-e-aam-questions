# Quiz App Backend

Backend API for the Coaching Institute Quiz Submission System.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Edit `.env`:
- `EMAIL_USER`: Your Gmail or email service account
- `EMAIL_PASSWORD`: Your email password or app password
- `ADMIN_EMAIL`: Admin email to receive submissions
- `JWT_SECRET`: Change to a secure random string
- `CORS_ORIGIN`: Frontend URL

### 3. Email Configuration (Gmail Example)
1. Enable 2-step verification in your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use this app password in `.env`

### 4. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### POST `/api/login`
- Login with email and password
- Request: `{ email, password }`
- Response: `{ success, user: { id, email, name, questionSet } }`

### GET `/api/questions/:questionSetId`
- Fetch questions for a specific set
- Response: `{ success, questions: { id, subject, questions: [...] } }`

### POST `/api/submit`
- Submit quiz answers
- Request: `{ userId, questionSetId, answers, personalDetails }`
- Response: `{ success, score: { correct, total, percentage } }`

### GET `/api/health`
- Health check endpoint
- Response: `{ success, message }`

## Project Structure

```
backend/
├── config/
│   ├── users.js          # Mock user data
│   └── questions.js      # Mock question sets
├── routes/
│   └── api.js            # API routes
├── services/
│   ├── authService.js    # Authentication logic
│   └── emailService.js   # Email sending logic
├── middleware/
│   └── validation.js     # Request validation
├── utils/
├── server.js             # Main server file
├── package.json
├── .env                  # Environment variables
└── .env.example          # Example env file
```

## Deployment

### Heroku Deployment

1. Install Heroku CLI
2. Create Procfile:
```
web: npm start
```

3. Deploy:
```bash
heroku create quiz-app-backend
git push heroku main
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASSWORD=your-app-password
heroku config:set ADMIN_EMAIL=admin@coachingcenter.com
heroku config:set CORS_ORIGIN=https://your-frontend-url
```

### Environment Checklist for Production
- [ ] NODE_ENV=production
- [ ] Secure JWT_SECRET (use strong random string)
- [ ] Email credentials configured
- [ ] CORS_ORIGIN set to production frontend URL
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled
- [ ] Error logs configured
