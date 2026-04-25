# Quiz App Frontend

React-based mobile-first frontend for the Coaching Institute Quiz Submission System.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local` file
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

App will run on `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Features

- 🎬 **Animated Splash Screen** - Professional intro animation
- 🔐 **Secure Login** - Hardcoded user authentication
- 📝 **Personal Details Form** - Enhanced with validation
- 📘 **Interactive Quiz System** - MCQ based questions with instant feedback
- ⏱️ **Timer Display** - Real-time countdown with warnings
- 📊 **Answer Review** - Review answers before final submission
- 📧 **Submission Confirmation** - Score display and email confirmation
- 📱 **Mobile-First Design** - Fully responsive across all devices

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Splash.jsx
│   │   ├── Login.jsx
│   │   ├── PersonalDetailsForm.jsx
│   │   ├── Quiz.jsx
│   │   ├── Submission.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── quizStore.js         # Zustand store
│   ├── utils/
│   │   ├── api.js               # API calls
│   │   └── helpers.js           # Utility functions
│   ├── hooks/
│   │   └── useCustomHooks.js    # Custom React hooks
│   ├── styles/
│   │   └── index.css            # Global styles
│   ├── App.jsx
│   └── index.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## Technology Stack

- **React 18** - UI library
- **React Router v6** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

## Environment Variables

Create `.env.local` in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update to your backend URL.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables:
   - `REACT_APP_API_URL`: Your production backend URL
4. Deploy automatically on push

### Netlify

1. Build locally: `npm run build`
2. Connect GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables

### Docker

```bash
docker build -t quiz-app-frontend .
docker run -p 3000:3000 quiz-app-frontend
```

### Traditional Hosting (Nginx)

1. Build: `npm run build`
2. Upload contents of `build/` folder to server
3. Configure Nginx to serve index.html for all routes

## Responsive Design

- **Mobile** (< 640px): Single column layout, full-width buttons
- **Tablet** (640px - 1024px): Enhanced spacing and touch targets
- **Desktop** (> 1024px): Optimal reading width with centered layout

## Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Minified production builds
- CSS bundling with Tailwind
- Lazy component loading

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Can't connect to backend
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env.local`
- Verify CORS settings in backend

### Quiz timer not working
- Check browser console for errors
- Ensure JavaScript is enabled
- Try in incognito/private mode

### Answers not saving
- Check localStorage is enabled
- Verify browser allows local storage
- Check network tab for API errors
