# Quiz App - Development Setup

## Initial Setup

### 1. Install Project Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment

**Backend - Create backend/.env:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
- Set `EMAIL_USER` to your email
- Set `EMAIL_PASSWORD` to your app password
- Set `ADMIN_EMAIL` to admin email
- Set `JWT_SECRET` to a random string

**Frontend - Create frontend/.env.local:**
```bash
echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env.local
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App runs on: `http://localhost:3000`

## NPM Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with auto-reload (requires nodemon)
- `npm test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run lint` - Run linter

## Database Setup (When Using MongoDB)

```bash
# Install MongoDB locally or use MongoDB Atlas

# Connect string in backend/.env:
MONGODB_URI=mongodb://localhost:27017/quiz-app
```

## Common Issues

### Backend fails to start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Or use different port
PORT=5001 npm run dev
```

### Frontend can't connect to backend
```bash
# Check REACT_APP_API_URL
cat frontend/.env.local

# Should be:
REACT_APP_API_URL=http://localhost:5000/api
```

### Email not working
```bash
# Verify credentials in backend/.env
# For Gmail, use App Password not your actual password
# https://myaccount.google.com/apppasswords
```

## Useful Tools

- **VS Code Extensions:**
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)
  - REST Client

- **Tools:**
  - Postman (API testing)
  - MongoDB Compass (database management)
  - npm-check-updates (`npm-check-updates -u`)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to origin
git push origin feature/your-feature

# Create pull request on GitHub
```

## Testing

### Manual Testing Checklist
- [ ] Splash screen animation plays
- [ ] Login with demo credentials works
- [ ] Personal details form validates
- [ ] Quiz loads questions correctly
- [ ] Timer counts down properly
- [ ] Can select and change answers
- [ ] Can navigate between questions
- [ ] Submit button appears on last question
- [ ] Submission sends email
- [ ] Score displays correctly
- [ ] Mobile responsiveness works

### API Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"pass123"}'

# Get questions
curl http://localhost:5000/api/questions/1

# Submit quiz
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Performance Testing

```bash
# Frontend build size
npm run build
du -sh build/

# Lighthouse CI
npm install -g @lhci/cli@
lhci autorun
```

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] API input validation enabled
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] HTTPS ready
- [ ] No sensitive data in logs
- [ ] Password properly hashed (if storing)
- [ ] CSRF protection enabled (if using sessions)

---

Happy coding! 🚀
