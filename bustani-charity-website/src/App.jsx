import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Campaigns from './components/Campaigns/Campaigns';
import Zakat from './components/Zakat/Zakat';
import Projects from './components/Projects/Projects';
import OrphanSponsorship from './components/OrphanSponsorship/OrphanSponsorship';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
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
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;

