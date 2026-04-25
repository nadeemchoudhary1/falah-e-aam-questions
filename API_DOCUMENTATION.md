# 📚 API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

## Authentication

Currently using session-based authentication. Future versions will implement JWT tokens.

## Endpoints

### 1. Login

**Endpoint:** `POST /login`

**Description:** Authenticate user with email and password

**Request:**
```json
{
  "email": "user1@test.com",
  "password": "pass123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user1@test.com",
    "name": "User One",
    "questionSet": 1
  },
  "message": "Login successful"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Validation:**
- Email must be valid format
- Password minimum 3 characters
- Email and password required

---

### 2. Get Questions

**Endpoint:** `GET /questions/:questionSetId`

**Description:** Fetch quiz questions for a specific question set

**Parameters:**
- `questionSetId` (path param, integer 1-4): The question set ID

**Response (Success - 200):**
```json
{
  "success": true,
  "questions": {
    "id": 1,
    "subject": "Anatomy",
    "totalMarks": 100,
    "questions": [
      {
        "id": 1,
        "question": "What is the unit of life?",
        "options": ["Atom", "Cell", "Organ", "Tissue"]
      },
      {
        "id": 2,
        "question": "How many bones are in the adult human body?",
        "options": ["186", "206", "216", "226"]
      }
    ]
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Question set not found"
}
```

**Notes:**
- Correct answers are never sent to frontend
- Answers are validated server-side
- Maximum 20 questions per set

---

### 3. Submit Quiz

**Endpoint:** `POST /submit`

**Description:** Submit quiz answers and calculate score. Triggers email to admin.

**Request:**
```json
{
  "userId": 1,
  "questionSetId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "Cell"
    },
    {
      "questionId": 2,
      "selectedAnswer": "206"
    }
  ],
  "personalDetails": {
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "courseName": "MBBS",
    "age": 25,
    "address": "123 Main Street",
    "email": "user1@test.com",
    "subject": "Anatomy"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "score": {
    "correct": 15,
    "total": 20,
    "percentage": 75.00
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "message": "Error processing submission"
}
```

**Validation:**
- All answers required
- Personal details required
- Phone number must be 10 digits
- Age must be 15-120
- Email required

**Side Effects:**
- Sends HTML email to admin
- Includes complete answer details
- Includes score breakdown
- Logs submission

---

### 4. Health Check

**Endpoint:** `GET /health`

**Description:** Check if server is running

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

All endpoints are rate limited to prevent abuse.

**Limits:**
- 100 requests per 15 minutes per IP address
- Applies to all endpoints

**Response (429):**
```json
{
  "message": "Too many requests, please try again later"
}
```

---

## CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Your frontend URL (configure in .env)

**Allowed Methods:**
- GET
- POST
- OPTIONS

**Allowed Headers:**
- Content-Type
- Authorization (future)

---

## Request/Response Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"pass123"}'

# Get Questions
curl http://localhost:5000/api/questions/1

# Submit Quiz
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d @submit-data.json

# Health Check
curl http://localhost:5000/api/health
```

### Using Axios (JavaScript)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Login
const loginResponse = await api.post('/login', {
  email: 'user1@test.com',
  password: 'pass123'
});

// Get Questions
const questionsResponse = await api.get('/questions/1');

// Submit Quiz
const submitResponse = await api.post('/submit', {
  userId: 1,
  questionSetId: 1,
  answers: [...],
  personalDetails: {...}
});
```

### Using Fetch API

```javascript
// Login
const response = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user1@test.com',
    password: 'pass123'
  })
});

const data = await response.json();
```

---

## WebSocket Support (Future)

Not currently implemented. Planned for real-time features:
- Live timer synchronization
- Real-time submission confirmations
- Admin dashboard updates

---

## Authentication (Future)

JWT token-based authentication will be implemented with:

```
Authorization: Bearer <token>
```

Token refresh mechanism and role-based access control planned.

---

## Pagination (Future)

When implementing database:

```
GET /api/submissions?page=1&limit=20
```

---

## Versioning

Current API Version: **v1**

Future: `/api/v2/` structure for backward compatibility

---

## Data Types

```javascript
// User ID
userId: number (1-5)

// Question Set ID
questionSetId: number (1-4)

// Question ID
questionId: number (1-20)

// Email
email: string (valid email format)

// Password
password: string (min 3 characters)

// Phone Number
phoneNumber: string (exactly 10 digits)

// Age
age: number (15-120)

// Score
percentage: number (0-100)
```

---

## Common Response Times

| Endpoint | Time |
|----------|------|
| /login | < 100ms |
| /questions/:id | < 50ms |
| /submit | 500ms-2s (email sending) |
| /health | < 10ms |

---

## Future API Enhancements

- [ ] JWT Authentication
- [ ] Pagination support
- [ ] Filtering and sorting
- [ ] WebSocket for real-time updates
- [ ] Admin endpoints
- [ ] Analytics endpoints
- [ ] User profile endpoint
- [ ] Quiz history endpoint
- [ ] Leaderboard endpoint

---

## Support

For API issues:
1. Check error message
2. Review request format
3. Verify authentication
4. Check server logs
5. Contact: admin@coachingcenter.com

---

**API Version:** 1.0.0
**Last Updated:** January 2024
**Status:** ✅ Stable
