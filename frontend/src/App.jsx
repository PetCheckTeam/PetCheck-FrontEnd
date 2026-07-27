import { useEffect, useState } from 'react';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Results from './pages/Results';
import Scanner from './pages/Scanner';
import Setup from './pages/Setup';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

function App() {
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('petcheck-user-profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [currentPage, setCurrentPage] = useState(() => (
    localStorage.getItem('petcheck-user-profile') ? 'welcome' : 'login'
  ));
  const [petProfiles, setPetProfiles] = useState(() => {
    const savedProfiles = localStorage.getItem('petcheck-pet-profiles');
    return savedProfiles ? JSON.parse(savedProfiles) : [];
  });
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [chatbotReturnPage, setChatbotReturnPage] = useState('welcome');

  const selectedPet =
    petProfiles.find((profile) => profile.id === selectedPetId) ?? petProfiles[0] ?? null;

  useEffect(() => {
    localStorage.setItem('petcheck-pet-profiles', JSON.stringify(petProfiles));
  }, [petProfiles]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('petcheck-user-profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('petcheck-user-profile');
    }
  }, [userProfile]);

  if (currentPage === 'signup') {
    return <Signup onMoveToLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'welcome') {
    return (
      <Welcome
        userProfile={userProfile}
        petProfiles={petProfiles}
        onUpdateUser={setUserProfile}
        onLogout={() => {
          setUserProfile(null);
          setCurrentPage('login');
        }}
        onStartSetup={() => {
          setEditingPet(null);
          setCurrentPage('setup');
        }}
        onEditPet={(pet) => {
          setEditingPet(pet);
          setCurrentPage('setup');
        }}
        onStartChatbot={(petId) => {
          setSelectedPetId(petId);
          setChatbotReturnPage('welcome');
          setCurrentPage('chatbot');
        }}
        onStartScanner={(petId) => {
          setSelectedPetId(petId);
          setCurrentPage('scanner');
        }}
      />
    );
  }

  if (currentPage === 'setup') {
    return (
      <Setup
        initialProfile={editingPet}
        onBackToWelcome={() => setCurrentPage('welcome')}
        onRegister={(profile) => {
          const savedProfile = {
            ...profile,
            id: profile.id ?? crypto.randomUUID(),
          };
          setPetProfiles((previous) => (
            profile.id
              ? previous.map((pet) => (pet.id === profile.id ? savedProfile : pet))
              : [...previous, savedProfile]
          ));
          setSelectedPetId(savedProfile.id);
        }}
        onStartScanner={() => {
          setCurrentPage('scanner');
        }}
      />
    );
  }

  if (currentPage === 'scanner') {
    return (
      <Scanner
        petProfiles={petProfiles}
        selectedPetId={selectedPet?.id}
        onSelectPet={setSelectedPetId}
        onBack={() => setCurrentPage('welcome')}
        onViewResults={() => setCurrentPage('results')}
      />
    );
  }

  if (currentPage === 'results') {
    return (
      <Results
        petProfile={selectedPet ?? { petType: '', petName: '', allergies: [] }}
        onScanAgain={() => setCurrentPage('scanner')}
        onGoHome={() => setCurrentPage('welcome')}
        onAskAI={() => {
          setChatbotReturnPage('results');
          setCurrentPage('chatbot');
        }}
      />
    );
  }

  if (currentPage === 'chatbot') {
    return (
      <>
        {chatbotReturnPage === 'results' ? (
          <Results
            petProfile={selectedPet ?? { petType: '', petName: '', allergies: [] }}
            onScanAgain={() => setCurrentPage('scanner')}
            onGoHome={() => setCurrentPage('welcome')}
            onAskAI={() => {}}
          />
        ) : (
          <Welcome
            userProfile={userProfile}
            petProfiles={petProfiles}
            onUpdateUser={setUserProfile}
            onLogout={() => {
              setUserProfile(null);
              setCurrentPage('login');
            }}
            onStartSetup={() => {
              setEditingPet(null);
              setCurrentPage('setup');
            }}
            onEditPet={(pet) => {
              setEditingPet(pet);
              setCurrentPage('setup');
            }}
            onStartChatbot={() => {}}
            onStartScanner={(petId) => {
              setSelectedPetId(petId);
              setCurrentPage('scanner');
            }}
          />
        )}
        <div className="chatbot-popup-layer" role="dialog" aria-modal="true" aria-label="PetCheck AI 챗봇">
          <button
            className="chatbot-popup-layer__backdrop"
            type="button"
            aria-label="챗봇 닫기"
            onClick={() => setCurrentPage(chatbotReturnPage)}
          />
          <Chatbot
            petProfile={selectedPet ?? { petType: '', petName: '', allergies: [] }}
            petProfiles={petProfiles}
            selectedPetId={selectedPet?.id}
            onSelectPet={setSelectedPetId}
            onBackToResults={() => setCurrentPage(chatbotReturnPage)}
          />
        </div>
      </>
    );
  }

  return (
    <Login
      onMoveToSignup={() => setCurrentPage('signup')}
      onLoginSuccess={({ email }) => {
        const savedName = userProfile?.email === email ? userProfile.name : email.split('@')[0];
        setUserProfile({ name: savedName, email });
        setCurrentPage('welcome');
      }}
    />
  );
}

export default App;
