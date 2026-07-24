import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  if (currentPage === 'signup') {
    return <Signup onMoveToLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'welcome') {
    return <Welcome onLogout={() => setCurrentPage('login')} />;
  }

  return (
    <Login
      onMoveToSignup={() => setCurrentPage('signup')}
      onLoginSuccess={() => setCurrentPage('welcome')}
    />
  );
}

export default App;
