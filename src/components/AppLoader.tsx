import { useEffect, useState } from 'react';
import { Box, LinearProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AppLoader = () => {
  const location = useLocation();
  const appLoader = useSelector((state: any) => state.app.appLoader);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger when Redux appLoader changes
  useEffect(() => {
    if (!appLoader) {
      // smoothly close loader if state becomes false
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(100);
      const hide = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(hide);
    }

    // When appLoader = true → start loader
    setLoading(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 10));
    }, 150);

    return () => clearInterval(timer);
  }, [appLoader, location.pathname]);

  if (!loading) return null;

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

export default AppLoader;
