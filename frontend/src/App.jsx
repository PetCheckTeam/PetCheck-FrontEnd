import { useEffect, useState } from 'react';
import { authApi, petsApi, tokenStorage, usersApi } from './api/petcheckApi';
import { INGREDIENTS } from './constants/ingredients';
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
const normalizeAvoidIngredient = (ingredient) => (
  typeof ingredient === 'string'
    ? { ingredientId: null, standardName: ingredient }
    : {
        ...ingredient,
        ingredientId:
          ingredient?.ingredientId
          ?? ingredient?.ingredient?.id
          ?? ingredient?.id
          ?? null,
        standardName:
          ingredient?.standardName
          ?? ingredient?.ingredient?.standardName
          ?? ingredient?.name
          ?? ingredient?.ingredientName
          ?? '',
      }
);
const normalizePet = (pet) => {
  const avoidIngredients = toArray(pet?.avoidIngredients ?? pet?.allergies)
    .map(normalizeAvoidIngredient)
    .filter((ingredient) => ingredient.standardName);

  return {
    ...pet,
    id: pet?.id ?? pet?.petId,
    petName: pet?.name ?? pet?.petName ?? '',
    petType: (
      pet?.species
      ?? pet?.type
      ?? pet?.petType
      ?? ''
    ).toLowerCase(),
    avoidIngredients,
    allergies: avoidIngredients.map((ingredient) => ingredient.standardName),
  };
};

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

  const getIngredientCatalog = () => {
    const catalog = new Map(
      INGREDIENTS.map((ingredient) => [ingredient.standardName, ingredient]),
    );
    petProfiles
      .flatMap((pet) => pet.avoidIngredients ?? [])
      .forEach((ingredient) => {
        if (ingredient.standardName && ingredient.ingredientId != null) {
          catalog.set(ingredient.standardName, ingredient);
        }
      });
    return catalog;
  };

  const syncAvoidIngredients = async (petId, knownIngredients, selectedNames) => {
    const currentIngredients = toArray(await petsApi.listAvoidIngredients(petId))
      .map(normalizeAvoidIngredient)
      .filter((ingredient) => ingredient.standardName);
    const currentByName = new Map(
      currentIngredients.map((ingredient) => [ingredient.standardName, ingredient]),
    );
    const selectedNameSet = new Set(selectedNames);
    const catalog = getIngredientCatalog();
    [...knownIngredients, ...currentIngredients].forEach((ingredient) => {
      if (ingredient.standardName && ingredient.ingredientId != null) {
        catalog.set(ingredient.standardName, ingredient);
      }
    });

    const namesToAdd = selectedNames.filter((name) => !currentByName.has(name));
    const unresolvedNames = namesToAdd.filter(
      (name) => catalog.get(name)?.ingredientId == null,
    );
    if (unresolvedNames.length > 0) {
      throw new Error(
        `${unresolvedNames.join(', ')} 성분의 ID를 백엔드에서 조회할 수 없습니다. `
        + '전체 성분 목록 조회 API가 필요합니다.',
      );
    }

    const ingredientsToRemove = currentIngredients.filter(
      (ingredient) => (
        !selectedNameSet.has(ingredient.standardName)
        && ingredient.ingredientId != null
      ),
    );

    await Promise.all([
      ...ingredientsToRemove.map((ingredient) => (
        petsApi.removeAvoidIngredient(petId, ingredient.ingredientId)
      )),
      ...namesToAdd.map((name) => (
        petsApi.addAvoidIngredient(petId, catalog.get(name).ingredientId)
      )),
    ]);

    return toArray(await petsApi.listAvoidIngredients(petId))
      .map(normalizeAvoidIngredient)
      .filter((ingredient) => ingredient.standardName);
  };

  const loadAccount = async () => {
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
    setAnalysisResult(null);
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
        setAnalysisResult(null);
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
        setAnalysisResult(null);
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
          const currentPet = petProfiles.find(
            (pet) => String(pet.id) === String(profile.id),
          );
          const currentIngredients = currentPet?.avoidIngredients ?? [];

          // 저장 전에 신규 선택 성분의 ID를 확인하여 반려동물만 저장되는 반쪽 성공을 막습니다.
          if (profile.allergies.some(
            (name) => (
              !currentIngredients.some((item) => item.standardName === name)
              && getIngredientCatalog().get(name)?.ingredientId == null
            ),
          )) {
            const unresolvedNames = profile.allergies.filter(
              (name) => (
                !currentIngredients.some((item) => item.standardName === name)
                && getIngredientCatalog().get(name)?.ingredientId == null
              ),
            );
            throw new Error(
              `${unresolvedNames.join(', ')} 성분의 ID를 백엔드에서 조회할 수 없습니다. `
              + '전체 성분 목록 조회 API가 필요합니다.',
            );
          }

          const payload = {
            name: profile.petName,
            species: profile.petType.toUpperCase(),
          };
          const saved = profile.id
            ? await petsApi.update(profile.id, payload)
            : await petsApi.create(payload);
          const petId = saved?.id ?? saved?.petId ?? profile.id;
          const avoidIngredients = await syncAvoidIngredients(
            petId,
            currentIngredients,
            profile.allergies,
          );
          const normalized = normalizePet({
            ...profile,
            ...saved,
            avoidIngredients,
          });
          setPetProfiles((previous) => (
            profile.id
              ? previous.map((pet) => (
                String(pet.id) === String(profile.id) ? normalized : pet
              ))
              : [...previous, normalized]
          ));
          setSelectedPetId(normalized.id);
        }}
        onStartScanner={() => {
          setAnalysisResult(null);
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
        onSelectPet={(petId) => {
          setAnalysisResult(null);
          setSelectedPetId(petId);
        }}
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
      onScanAgain={() => {
        setAnalysisResult(null);
        setCurrentPage('scanner');
      }}
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
            key={analysisResult?.analysisId ?? analysisResult?.id ?? 'no-analysis'}
            petProfile={selectedPet ?? { petType: '', petName: '', allergies: [] }}
            analysisResult={analysisResult}
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
