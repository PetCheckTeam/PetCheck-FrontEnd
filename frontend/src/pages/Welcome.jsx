import { useState } from 'react';
import PetIllustration from '../components/PetIllustration';

function Welcome({
  userProfile,
  petProfiles,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
  onStartSetup,
  onEditPet,
  onDeletePet,
  onStartChatbot,
  onStartScanner,
}) {
  const hasPetProfile = petProfiles.length > 0;
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isManagingPets, setIsManagingPets] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    name: userProfile?.name ?? '',
    email: userProfile?.email ?? '',
  });
  const [ownerMessage, setOwnerMessage] = useState('');
  const [petMessage, setPetMessage] = useState('');
  const handleOwnerSubmit = async (event) => {
    event.preventDefault();
    setOwnerMessage('');

    if (!ownerForm.name.trim() || !ownerForm.email.trim()) {
      setOwnerMessage('이름과 이메일을 모두 입력해 주세요.');
      return;
    }

    try {
      await onUpdateUser({
        ...userProfile,
        name: ownerForm.name.trim(),
      });
    } catch (error) {
      setOwnerMessage(error.message);
      return;
    }
    setOwnerMessage('닉네임을 변경했어요.');
  };

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <button type="button" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <section className="dashboard" aria-labelledby="dashboard-heading">
        <div className="dashboard__intro">
          <div className="dashboard__heading">
            <span className="eyebrow">오늘의 PetCheck</span>
            <h1 id="dashboard-heading">
              {hasPetProfile
                ? `${petProfiles[0].petName}와 오늘도 건강하게`
                : `${userProfile?.name ?? '회원'}님, 반가워요`}
            </h1>
            <p>
              {hasPetProfile
                ? '우리 아이에게 맞는 사료인지 지금 바로 확인해 보세요.'
                : '반려동물을 등록하고 맞춤 사료 분석을 시작해 보세요.'}
            </p>
          </div>
          <div className="dashboard__pet-guide" aria-label="PetCheck 반려동물 안내">
            <div className="dashboard__pet-bubble">
              {hasPetProfile
                ? `${petProfiles[0].petName}, 오늘 사료도 확인해볼까?`
                : '먼저 내 정보를 등록해 주세요!'}
            </div>
            <PetIllustration
              className="dashboard__guide-pet"
              type={hasPetProfile ? petProfiles[0].petType : 'dog'}
            />
          </div>
          <div className="dashboard__hero-action">
            <div className="dashboard__active-pet">
              <span>{hasPetProfile ? '분석 대상' : '시작하기'}</span>
              <strong>
                {hasPetProfile
                  ? `${petProfiles[0].petName} · ${
                    petProfiles[0].petType === 'dog' ? '강아지' : '고양이'
                  }`
                  : '반려동물 정보 등록'}
              </strong>
              <small>
                {hasPetProfile && petProfiles[0].allergies.length > 0
                  ? `알러지 ${petProfiles[0].allergies.length}개 등록됨`
                  : hasPetProfile
                    ? '등록된 알러지 없음'
                    : '최초 한 번만 등록하면 돼요'}
              </small>
            </div>
            <button
              className="welcome-next dashboard__analyze-button"
              type="button"
              onClick={() => (
                hasPetProfile ? onStartScanner(petProfiles[0].id) : onStartSetup()
              )}
            >
              <strong>{hasPetProfile ? '사료 분석 시작' : '반려동물 등록하기'}</strong>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="dashboard__quick-stats" aria-label="등록 정보 요약">
          <article>
            <span>함께하는 반려동물</span>
            <div>
              <strong>{petProfiles.length}</strong>
              <small>마리</small>
            </div>
          </article>
          <article>
            <span>기억 중인 알러지</span>
            <div>
              <strong>
                {petProfiles.reduce(
                  (total, pet) => total + (pet.allergies?.length ?? 0),
                  0,
                )}
              </strong>
              <small>개</small>
            </div>
          </article>
        </div>

        <div className="dashboard__grid">
          <div className="dashboard__owner-column">
            <article className="profile-card">
              <div className="profile-card__icon" aria-hidden="true">👤</div>
              <div className="profile-card__owner">
                <span>보호자 정보</span>
                <h2>{userProfile?.name ?? '회원'}</h2>
                <p>{userProfile?.email}</p>
                <button
                  type="button"
                  aria-label={isEditingOwner ? '보호자 정보 수정 닫기' : '보호자 정보 수정'}
                  onClick={() => {
                    setIsEditingOwner((previous) => !previous);
                    setOwnerMessage('');
                  }}
                >
                  {isEditingOwner ? '닫기' : '수정'}
                </button>
              </div>
            </article>

            {hasPetProfile && (
              <button
                className="pet-management-trigger"
                type="button"
                onClick={() => setIsManagingPets((previous) => !previous)}
              >
                <span aria-hidden="true">🐾</span>
                <div>
                  <strong>반려동물 정보 관리</strong>
                  <small>수정 및 추가 등록</small>
                </div>
                <span aria-hidden="true">{isManagingPets ? '↑' : '→'}</span>
              </button>
            )}
          </div>

          <article className="profile-card profile-card--pet">
            {hasPetProfile ? (
              <>
                <div className="profile-card__pet-list">
                  <span>반려동물 정보</span>
                  <div className="profile-card__pets">
                    {petProfiles.map((pet) => (
                      <div className="profile-card__pet-item" key={pet.id}>
                        <PetIllustration
                          className="profile-card__pet"
                          type={pet.petType}
                        />
                        <div>
                          <h2>{pet.petName}</h2>
                          <p>
                            {pet.petType === 'dog' ? '강아지' : '고양이'}
                            {' · '}
                            {pet.allergies.length > 0
                              ? `알러지 ${pet.allergies.join(', ')}`
                              : '알러지 없음'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="profile-card__icon" aria-hidden="true">🐾</div>
                <div>
                  <span>반려동물 정보</span>
                  <h2>아직 등록되지 않았어요</h2>
                  <p>최초 한 번만 등록하면 계속 불러올 수 있어요.</p>
                </div>
              </>
            )}
          </article>
        </div>

        {isManagingPets && (
          <section className="pet-management" aria-labelledby="pet-management-heading">
            <div className="pet-management__heading">
              <div>
                <span className="eyebrow">반려동물 설정</span>
                <h2 id="pet-management-heading">반려동물 정보 관리</h2>
                <p>등록한 정보를 수정하거나 새로운 반려동물을 추가할 수 있어요.</p>
              </div>
              <button type="button" onClick={() => setIsManagingPets(false)}>닫기</button>
            </div>

            <div className="pet-management__list">
              {petProfiles.map((pet) => (
                <article className="pet-management__item" key={pet.id}>
                  <PetIllustration
                    className="pet-management__pet"
                    type={pet.petType}
                  />
                  <div>
                    <strong>{pet.petName}</strong>
                    <span>
                      {pet.petType === 'dog' ? '강아지' : '고양이'}
                      {' · '}
                      {pet.allergies.length > 0
                        ? `알러지 ${pet.allergies.join(', ')}`
                        : '알러지 없음'}
                    </span>
                  </div>
                  <button type="button" onClick={() => onEditPet(pet)}>
                    정보 수정
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`${pet.petName}의 정보를 삭제할까요?`)) return;
                      setPetMessage('');
                      try {
                        await onDeletePet(pet.id);
                      } catch (error) {
                        setPetMessage(error.message);
                      }
                    }}
                  >
                    삭제
                  </button>
                </article>
              ))}
            </div>
            {petMessage && <p className="owner-settings__message" role="alert">{petMessage}</p>}

            <button
              className="pet-management__add"
              type="button"
              onClick={onStartSetup}
            >
              <span aria-hidden="true">＋</span>
              새 반려동물 추가 등록
            </button>
          </section>
        )}

        {isEditingOwner && (
          <form className="owner-settings" onSubmit={handleOwnerSubmit}>
            <div className="owner-settings__heading">
              <div>
                <span className="eyebrow">계정 설정</span>
                <h2>보호자 정보 수정</h2>
              </div>
              <button type="button" onClick={() => setIsEditingOwner(false)}>닫기</button>
            </div>
            <div className="owner-settings__fields">
              <label>
                <span>이름</span>
                <input
                  type="text"
                  value={ownerForm.name}
                  onChange={(event) => setOwnerForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))}
                />
              </label>
              <label>
                <span>이메일</span>
                <input
                  type="email"
                  value={ownerForm.email}
                  readOnly
                />
                <small>이메일은 현재 API에서 변경할 수 없어요.</small>
              </label>
            </div>
            {ownerMessage && <p className="owner-settings__message">{ownerMessage}</p>}
            <button className="owner-settings__submit" type="submit">변경사항 저장</button>
            <button
              className="setup-complete__back"
              type="button"
              onClick={async () => {
                if (!window.confirm('회원 탈퇴 시 모든 정보를 되돌릴 수 없습니다. 탈퇴할까요?')) return;
                setOwnerMessage('');
                try {
                  await onDeleteAccount();
                } catch (error) {
                  setOwnerMessage(error.message);
                }
              }}
            >
              회원 탈퇴
            </button>
          </form>
        )}

      </section>

      {hasPetProfile && (
        <button
          className="chatbot-launcher"
          type="button"
          aria-label="AI 챗봇 열기"
          onClick={() => onStartChatbot(petProfiles[0].id)}
        >
          <span aria-hidden="true">💬</span>
          <strong>AI 챗봇</strong>
        </button>
      )}

    </main>
  );
}

export default Welcome;
