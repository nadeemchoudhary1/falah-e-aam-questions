# 🎯 Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### Windows Users
```powershell
# PowerShell
.\setup.ps1

# Or Batch
.\setup.bat
```

### macOS/Linux Users
```bash
bash setup.sh
```

### Manual Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Update .env with email credentials
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## 📍 URLs

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend | http://localhost:5000 | Express API |
| Health Check | http://localhost:5000/api/health | Server status |

## 🔐 Demo Credentials

| Email | Password | Question Set |
|-------|----------|--------------|
| user1@test.com | pass123 | 1 (Anatomy) |
| user2@test.com | pass456 | 2 (Physiology) |
| user3@test.com | pass789 | 3 (Biochemistry) |
| user4@test.com | pass101 | 4 (Pathology) |
| user5@test.com | pass202 | 1 |

## 📝 Key Files to Edit

### Configuration
- `backend/.env` - Email & database settings
- `frontend/.env.local` - API URL
- `backend/config/users.js` - Add/modify users
- `backend/config/questions.js` - Add/modify questions

### Frontend Components
- `frontend/src/components/Splash.jsx` - Change logo/timing
- `frontend/src/components/Quiz.jsx` - Modify quiz logic
- `frontend/tailwind.config.js` - Customize colors

### Backend Services
- `backend/services/emailService.js` - Customize email template
- `backend/routes/api.js` - Add new endpoints

## 🐳 Docker Commands

```bash
# Build and run
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Individual containers
docker build -t quiz-backend ./backend
docker run -p 5000:5000 quiz-backend
```

## 📋 API Endpoints Cheat Sheet

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
  -d '{
    "userId": 1,
    "questionSetId": 1,
    "answers": [{"questionId": 1, "selectedAnswer": "Cell"}],
    "personalDetails": {...}
  }'

# Health Check
curl http://localhost:5000/api/health
```

## 🛠️ NPM Scripts

### Backend
```bash
npm start          # Production server
npm run dev        # Development with auto-reload
npm test           # Run tests
npm run lint       # Linting
```

### Frontend
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Linting
npm run eject      # Eject from CRA (irreversible!)
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create pull request on GitHub
```

## 🐛 Debugging

### Frontend Issues
```javascript
// Check console.log
console.log('Debug:', data);

// Check Redux DevTools (Zustand)
localStorage.getItem('quiz-state');

// Clear cache
localStorage.clear();
```

### Backend Issues
```bash
# View logs
npm run dev

# Check .env
cat backend/.env

# Test endpoint
curl -v http://localhost:5000/api/health
```

## 📦 Project Structure

```
quiz-app/
├── backend/          # Express API
├── frontend/         # React app
├── docker-compose.yml
├── README.md
├── DEPLOYMENT.md
└── setup.sh/.bat/.ps1
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Hash passwords if storing users
- [ ] Rate limit enabled
- [ ] Input validation active
- [ ] Security headers enabled (Helmet)

## 📊 Performance Tips

### Frontend
- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Lazy load components
- Enable code splitting

### Backend
- Use database indexes
- Implement caching
- Add pagination
- Monitor with PM2

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend won't start | Check PORT 5000 isn't in use, verify .env |
| Can't connect to backend | Verify REACT_APP_API_URL and backend running |
| Email not sending | Check email credentials, enable app password for Gmail |
| Timer not working | Clear cache, restart browser, check console |
| Questions not loading | Verify quiz API response, check network tab |

## 📞 Important Numbers

- Backend Port: `5000`
- Frontend Port: `3000`
- Quiz Duration: `70 minutes` (4200 seconds)
- Timer Warning: `5 minutes` (300 seconds)
- Total Questions: `20 per set`
- Total Users: `5 demo users`
- Total Subjects: `4 subjects`

## 🌐 Deployment Quick Links

- **Heroku**: https://www.heroku.com
- **Vercel**: https://vercel.com
- **AWS**: https://aws.amazon.com
- **Docker Hub**: https://hub.docker.com
- **GitHub Actions**: https://github.com/features/actions

## 📚 Documentation Links

- Main README: `README.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Deployment Guide: `DEPLOYMENT.md`
- Development Guide: `DEVELOPMENT.md`
- Contributing: `CONTRIBUTING.md`
- Project Structure: `PROJECT_STRUCTURE.md`

## 🎓 Learning Resources

- React: https://react.dev
- Express: https://expressjs.com
- Tailwind: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- Docker: https://docs.docker.com

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
