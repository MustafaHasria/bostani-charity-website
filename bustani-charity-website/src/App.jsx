import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { HomeDataProvider } from './context/HomeDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Campaigns from './components/Campaigns/Campaigns';
import Zakat from './components/Zakat/Zakat';
import Projects from './components/Projects/Projects';
import OrphanSponsorship from './components/OrphanSponsorship/OrphanSponsorship';
import Footer from './components/Footer/Footer';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import ProjectsPage from './pages/ProjectsPage';
import ZakatPage from './pages/ZakatPage';
import ZakatCalculatorPage from './pages/ZakatCalculatorPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Disable scroll restoration to prevent browser from restoring scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll to top immediately on mount with auto behavior to prevent smooth scroll delay
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    // Simulate page load time
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
        // Re-enable smooth scroll after page is loaded
        document.documentElement.classList.add('loaded');
        document.body.classList.add('loaded');
      }, 300); // Wait for fade out animation
    }, 1200); // Show spinner for 1.2 seconds

    // Also hide spinner when page is fully loaded
    const handleLoad = () => {
      // Ensure scroll position is at top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
          // Re-enable smooth scroll after page is loaded
          document.documentElement.classList.add('loaded');
          document.body.classList.add('loaded');
        }, 300);
      }, 300);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <HomeDataProvider>
            {isLoading && <LoadingSpinner fadeOut={isFadingOut} />}
            <Router>
              <Routes>
                {/* Login Route */}
                <Route
                  path="/login"
                  element={<LoginRoute />}
                />
                
                {/* Public Routes */}
                <Route
                  path="/"
                  element={(
                    <div className="App">
                      <Navbar />
                      <Hero />
                      <About />
                      <Campaigns />
                      <Zakat />
                      <Projects />
                      <OrphanSponsorship />
                      <Footer />
                    </div>
                  )}
                />
                <Route 
                  path="/campaigns" 
                  element={(
                    <div className="App">
                      <Navbar />
                      <CampaignsPage />
                      <Footer />
                    </div>
                  )} 
                />
                <Route 
                  path="/campaigns/:id" 
                  element={(
                    <div className="App">
                      <Navbar />
                      <CampaignDetailsPage />
                      <Footer />
                    </div>
                  )} 
                />
                <Route 
                  path="/projects" 
                  element={(
                    <div className="App">
                      <Navbar />
                      <ProjectsPage />
                      <Footer />
                    </div>
                  )} 
                />
                <Route 
                  path="/zakat" 
                  element={(
                    <div className="App">
                      <Navbar />
                      <ZakatPage />
                      <Footer />
                    </div>
                  )} 
                />
                <Route 
                  path="/zakat/calculator" 
                  element={(
                    <div className="App">
                      <Navbar />
                      <ZakatCalculatorPage />
                      <Footer />
                    </div>
                  )} 
                />

                {/* Protected Routes - يمكن إضافة الصفحات المحمية هنا */}
                {/* مثال:
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <div className="App">
                        <Navbar />
                        <Dashboard />
                        <Footer />
                      </div>
                    </ProtectedRoute>
                  } 
                />
                */}
              </Routes>
            </Router>
          </HomeDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

// Component to handle login route - redirect if already authenticated
const LoginRoute = () => {
  try {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <LoadingSpinner />
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return <Login />;
  } catch (error) {
    console.error('LoginRoute error:', error);
    return <Login />;
  }
};

export default App;
