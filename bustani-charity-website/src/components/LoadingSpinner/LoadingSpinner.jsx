import { useTheme } from '../../context/ThemeContext';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fadeOut = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`loading-spinner-overlay ${isDarkMode ? 'dark' : 'light'} ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-spinner-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-spinner-logo">
          <div className="logo-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

