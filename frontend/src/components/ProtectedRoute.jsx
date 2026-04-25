import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../context/quizStore';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated);
  const user = useQuizStore((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return children;
};

export default ProtectedRoute;
