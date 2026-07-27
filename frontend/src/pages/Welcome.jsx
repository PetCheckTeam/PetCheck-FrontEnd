import { useState } from 'react';
import PetIllustration from '../components/PetIllustration';

const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

function Welcome({
  userProfile,
  petProfiles,
  onUpdateUser,
  onLogout,
  onStartSetup,
  onEditPet,
  onStartChatbot,
  onStartScanner,
}) {
  const hasPetProfile = petProfiles.length > 0;
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    name: userProfile?.name ?? '',
    email: userProfile?.email ?? '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [ownerMessage, setOwnerMessage] = useState('');
  const handleOwnerSubmit = (event) => {
    event.preventDefault();
    setOwnerMessage('');

    if (!ownerForm.name.trim() || !ownerForm.email.trim()) {
      setOwnerMessage('이름과 이메일을 모두 입력해 주세요.');
      return;
    }

    if (
      ownerForm.newPassword
      && ownerForm.newPassword !== ownerForm.newPasswordConfirm
    ) {
      setOwnerMessage('새 비밀번호가 일치하지 않아요.');
      return;
    }

    if (ownerForm.newPassword && !ownerForm.currentPassword) {
      setOwnerMessage('현재 비밀번호를 입력해 주세요.');
      return;
    }

    if (
      ownerForm.newPassword
      && !SPECIAL_CHARACTER_PATTERN.test(ownerForm.newPassword)
    ) {
      setOwnerMessage('새 비밀번호에 특수문자를 1개 이상 포함해 주세요.');
      return;
    }

    onUpdateUser({
      ...userProfile,
      name: ownerForm.name.trim(),
      email: ownerForm.email.trim(),
    });
    setOwnerForm((previous) => ({
      ...previous,
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    }));
    setOwnerMessage(
      ownerForm.newPassword
        ? '보호자 정보와 비밀번호를 변경했어요.'
        : '보호자 정보를 변경했어요.',
    );
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
            <span className="eyebrow">내 정보</span>
            <h1 id="dashboard-heading">{userProfile?.name ?? '회원'}님, 반가워요 👋</h1>
            <p>로그인한 계정과 등록된 반려동물 정보를 바로 확인하세요.</p>
          </div>
          <div className="dashboard__pet-guide" aria-label="PetCheck 반려동물 안내">
            <div className="dashboard__pet-bubble">
              이 사료 나한테 맞아? <span aria-hidden="true">🤔</span>
            </div>
            <PetIllustration
              className="dashboard__guide-pet"
              type={hasPetProfile ? petProfiles[0].petType : 'dog'}
            />
          </div>
        </div>

        <div className="dashboard__grid">
          <article className="profile-card">
            <div className="profile-card__icon" aria-hidden="true">👤</div>
            <div className="profile-card__owner">
              <span>보호자 정보</span>
              <h2>{userProfile?.name ?? '회원'}</h2>
              <p>{userProfile?.email}</p>
              <button
                type="button"
                onClick={() => {
                  setIsEditingOwner((previous) => !previous);
                  setOwnerMessage('');
                }}
              >
                {isEditingOwner ? '닫기' : '정보 수정'}
              </button>
            </div>
          </article>

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
                              ? `알레르기 ${pet.allergies.join(', ')}`
                              : '알레르기 없음'}
                          </p>
                        </div>
                        <div className="profile-card__pet-actions">
                          <button type="button" onClick={() => onEditPet(pet)}>
                            수정
                          </button>
                          <button type="button" onClick={() => onStartScanner(pet.id)}>
                            분석하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="profile-card__add-pet"
                    type="button"
                    onClick={onStartSetup}
                  >
                    + 반려동물 추가 등록
                  </button>
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
                  onChange={(event) => setOwnerForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))}
                />
              </label>
              <label>
                <span>현재 비밀번호</span>
                <input
                  type="password"
                  placeholder="비밀번호 변경 시 입력"
                  value={ownerForm.currentPassword}
                  onChange={(event) => setOwnerForm((previous) => ({
                    ...previous,
                    currentPassword: event.target.value,
                  }))}
                />
              </label>
              <label>
                <span>새 비밀번호</span>
                <input
                  type="password"
                  placeholder="새 비밀번호"
                  value={ownerForm.newPassword}
                  onChange={(event) => setOwnerForm((previous) => ({
                    ...previous,
                    newPassword: event.target.value,
                  }))}
                />
                <small>특수문자를 1개 이상 포함해 주세요. 예: !, @, #</small>
              </label>
              <label>
                <span>새 비밀번호 확인</span>
                <input
                  type="password"
                  placeholder="새 비밀번호 다시 입력"
                  value={ownerForm.newPasswordConfirm}
                  onChange={(event) => setOwnerForm((previous) => ({
                    ...previous,
                    newPasswordConfirm: event.target.value,
                  }))}
                />
              </label>
            </div>
            {ownerMessage && <p className="owner-settings__message">{ownerMessage}</p>}
            <button className="owner-settings__submit" type="submit">변경사항 저장</button>
          </form>
        )}

        <div className="dashboard__action">
          <div>
            <strong>{hasPetProfile ? '사료를 분석해 볼까요?' : '반려동물을 먼저 등록해 주세요'}</strong>
            <span>
              {hasPetProfile
                ? '분석할 반려동물은 다음 화면에서 선택할 수 있어요.'
                : '각 반려동물의 정보는 최초 한 번만 등록하면 됩니다.'}
            </span>
          </div>
          <div className="dashboard__action-buttons">
            <button
              className="welcome-next"
              type="button"
              onClick={() => (
                hasPetProfile ? onStartScanner(petProfiles[0].id) : onStartSetup()
              )}
            >
              <strong>{hasPetProfile ? '사료 분석 시작' : '반려동물 정보 등록'}</strong>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
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
