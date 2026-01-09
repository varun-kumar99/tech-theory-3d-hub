import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookmarksPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/profile?tab=bookmarks', { replace: true });
  }, [navigate]);

  return null;
};

export default BookmarksPage;
