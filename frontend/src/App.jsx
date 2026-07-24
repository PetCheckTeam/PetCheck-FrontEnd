import { useState } from 'react';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Results from './pages/Results';
import Scanner from './pages/Scanner';
import Setup from './pages/Setup';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [petProfile, setPetProfile] = useState({
    petType: '',
    petName: '',
    allergies: [],
  });

  if (currentPage === 'signup') {
    return <Signup onMoveToLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'welcome') {
    return (
      <Welcome
        onBackToLogin={() => setCurrentPage('login')}
        onStartSetup={() => setCurrentPage('setup')}
      />
    );
  }

  if (currentPage === 'setup') {
    return (
      <Setup
        onBackToWelcome={() => setCurrentPage('welcome')}
        onStartScanner={(profile) => {
          setPetProfile(profile);
          setCurrentPage('scanner');
        }}
      />
    );
  }

  if (currentPage === 'scanner') {
    return (
      <Scanner
        onBackToSetup={() => setCurrentPage('setup')}
        onViewResults={() => setCurrentPage('results')}
      />
    );
  }

  if (currentPage === 'results') {
    return (
      <Results
        petProfile={petProfile}
        onScanAgain={() => setCurrentPage('scanner')}
        onGoHome={() => setCurrentPage('welcome')}
        onAskAI={() => setCurrentPage('chatbot')}
      />
    );
  }

  if (currentPage === 'chatbot') {
    return (
      <Chatbot
        petProfile={petProfile}
        onBackToResults={() => setCurrentPage('results')}
      />
    );
  }

  return (
    <Login
      onMoveToSignup={() => setCurrentPage('signup')}
      onLoginSuccess={() => setCurrentPage('welcome')}
    />
  );
}

export default App;
