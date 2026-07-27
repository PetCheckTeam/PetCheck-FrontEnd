import { useEffect, useState } from 'react';
import { authApi, petsApi, tokenStorage, usersApi } from './api/petcheckApi';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Results from './pages/Results';
import Scanner from './pages/Scanner';
import Setup from './pages/Setup';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';

const normalizeUser = (user) => ({ ...user, name: user?.nickname ?? user?.name ?? '' });
const toArray = (value) => (
  Array.isArray(value) ? value : value?.content ?? value?.items ?? []
);
const normalizePet = (pet) => ({
  ...pet,
  id: pet?.id ?? pet?.petId,
  petName: pet?.name ?? pet?.petName ?? '',
  petType: pet?.type?.toLowerCase?.() ?? pet?.petType ?? '',
  allergies: toArray(pet?.avoidIngredients ?? pet?.allergies)
    .map((item) => (typeof item === 'string' ? item : item.name)),
});

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('loading');
  const [petProfiles, setPetProfiles] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatbotReturnPage, setChatbotReturnPage] = useState('welcome');

  const selectedPet = petProfiles.find(
    (profile) => String(profile.id) === String(selectedPetId),
  ) ?? petProfiles[0] ?? null;

  const loadAccount = async () => {
    await authApi.me();
    const [user, pets] = await Promise.all([usersApi.me(), petsApi.list()]);
    const petList = toArray(pets);
    const avoidIngredientResults = await Promise.allSettled(
      petList.map((pet) => petsApi.listAvoidIngredients(pet.id ?? pet.petId)),
    );
    setUserProfile(normalizeUser(user));
    setPetProfiles(petList.map((pet, index) => normalizePet({
      ...pet,
      avoidIngredients: avoidIngredientResults[index].status === 'fulfilled'
        ? toArray(avoidIngredientResults[index].value)
        : pet.avoidIngredients,
    })));
  };

  useEffect(() => {
    if (!tokenStorage.get()) {
      setCurrentPage('login');
      return;
    }
    loadAccount()
      .then(() => setCurrentPage('welcome'))
      .catch(() => {
        tokenStorage.clear();
        setCurrentPage('login');
      });
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 세션 정리에 실패해도 로컬 로그인 정보는 반드시 제거합니다.
    }
    tokenStorage.clear();
    setUserProfile(null);
    setPetProfiles([]);
    setCurrentPage('login');
  };

  const updateUser = async (profile) => {
    const user = await usersApi.updateMe(profile.name);
    setUserProfile(normalizeUser(user));
  };

  if (currentPage === 'loading') {
    return <main className="app-loading">로그인 정보를 확인하고 있어요...</main>;
  }

  if (currentPage === 'signup') {
    return <Signup onMoveToLogin={() => setCurrentPage('login')} />;
  }

  const welcome = (
    <Welcome
      userProfile={userProfile}
      petProfiles={petProfiles}
      onUpdateUser={updateUser}
      onLogout={handleLogout}
      onDeleteAccount={async () => {
        await usersApi.deleteMe();
        tokenStorage.clear();
        setUserProfile(null);
        setPetProfiles([]);
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
      onDeletePet={async (petId) => {
        await petsApi.remove(petId);
        setPetProfiles((previous) => previous.filter(
          (pet) => String(pet.id) !== String(petId),
        ));
        if (String(selectedPetId) === String(petId)) setSelectedPetId(null);
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

  if (currentPage === 'welcome') return welcome;

  if (currentPage === 'setup') {
    return (
      <Setup
        initialProfile={editingPet}
        onBackToWelcome={() => setCurrentPage('welcome')}
        onRegister={async (profile) => {
          const payload = {
            name: profile.petName,
            type: profile.petType.toUpperCase(),
            breed: profile.breed,
            age: Number(profile.age),
          };
          const saved = profile.id
            ? await petsApi.update(profile.id, payload)
            : await petsApi.create(payload);
          const normalized = normalizePet({ ...profile, ...saved });
          setPetProfiles((previous) => (
            profile.id
              ? previous.map((pet) => (
                String(pet.id) === String(profile.id) ? normalized : pet
              ))
              : [...previous, normalized]
          ));
          setSelectedPetId(normalized.id);
        }}
        onStartScanner={() => setCurrentPage('scanner')}
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
        onViewResults={(result) => {
          setAnalysisResult(result);
          setCurrentPage('results');
        }}
      />
    );
  }

  const results = (
    <Results
      petProfile={selectedPet ?? { petType: '', petName: '', allergies: [] }}
      analysisResult={analysisResult}
      onScanAgain={() => setCurrentPage('scanner')}
      onGoHome={() => setCurrentPage('welcome')}
      onAskAI={() => {
        setChatbotReturnPage('results');
        setCurrentPage('chatbot');
      }}
    />
  );

  if (currentPage === 'results') return results;

  if (currentPage === 'chatbot') {
    return (
      <>
        {chatbotReturnPage === 'results' ? results : welcome}
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
      onLoginSuccess={async (credentials) => {
        await authApi.login(credentials);
        await loadAccount();
        setCurrentPage('welcome');
      }}
    />
  );
}

export default App;
