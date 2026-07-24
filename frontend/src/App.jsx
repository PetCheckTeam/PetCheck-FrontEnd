import { useState } from 'react';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import Setup from './pages/Setup';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

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
        onStartScanner={() => setCurrentPage('scanner')}
      />
    );
  }

  if (currentPage === 'scanner') {
    return <Scanner onBackToSetup={() => setCurrentPage('setup')} />;
  }

  return (
    <Login
      onMoveToSignup={() => setCurrentPage('signup')}
      onLoginSuccess={() => setCurrentPage('welcome')}
    />
  );
}

export default App;
