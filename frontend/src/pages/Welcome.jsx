import { useEffect, useRef, useState } from 'react';
import petcheckAppIcon from '../assets/petcheck-app-icon.png';
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
  const [activePetIndex, setActivePetIndex] = useState(0);
  const petSliderRef = useRef(null);
  const petSlideStartXRef = useRef(0);
  const petSlideScrollLeftRef = useRef(0);
  const isPetSlideDraggingRef = useRef(false);
  const activePet = petProfiles[activePetIndex] ?? petProfiles[0] ?? null;

  useEffect(() => {
    if (activePetIndex >= petProfiles.length) {
      setActivePetIndex(Math.max(0, petProfiles.length - 1));
    }
  }, [activePetIndex, petProfiles.length]);

  const finishPetSlide = (event) => {
    if (!isPetSlideDraggingRef.current) return;

    isPetSlideDraggingRef.current = false;
    const slider = event.currentTarget;
    const nextIndex = Math.min(
      petProfiles.length - 1,
      Math.max(0, Math.round(slider.scrollLeft / slider.clientWidth)),
    );
    slider.scrollTo({
      left: nextIndex * slider.clientWidth,
      behavior: 'smooth',
    });
    setActivePetIndex(nextIndex);
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  };

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
          <img className="brand__image" src={petcheckAppIcon} alt="" />
          PetCheck
        </a>
        <button type="button" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <section className="dashboard" aria-labelledby="dashboard-heading">
        <div className="dashboard__intro">
          <nav className="dashboard__utility-menu" aria-label="빠른 메뉴">
            <button
              type="button"
              onClick={() => (
                hasPetProfile
                  ? setIsManagingPets((previous) => !previous)
                  : onStartSetup()
              )}
            >
              <span aria-hidden="true">🐾</span>
              <strong>반려동물</strong>
              <small>{hasPetProfile ? `${petProfiles.length}마리` : '등록하기'}</small>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingOwner((previous) => !previous);
                setOwnerMessage('');
              }}
            >
              <span aria-hidden="true">👤</span>
              <strong>보호자 정보</strong>
              <small>{userProfile?.name ?? '회원'}</small>
            </button>
            {hasPetProfile && (
              <button
                type="button"
                onClick={() => onStartChatbot(activePet.id)}
              >
                <span aria-hidden="true">💬</span>
                <strong>AI 상담</strong>
                <small>바로 질문하기</small>
              </button>
            )}
          </nav>

          {hasPetProfile ? (
            <>
              <div
                ref={petSliderRef}
                className="pet-carousel"
                aria-label="등록한 반려동물"
                onPointerDown={(event) => {
                  isPetSlideDraggingRef.current = true;
                  petSlideStartXRef.current = event.clientX;
                  petSlideScrollLeftRef.current = event.currentTarget.scrollLeft;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!isPetSlideDraggingRef.current) return;
                  event.preventDefault();
                  event.currentTarget.scrollLeft = (
                    petSlideScrollLeftRef.current
                    - (event.clientX - petSlideStartXRef.current)
                  );
                }}
                onPointerUp={finishPetSlide}
                onPointerCancel={finishPetSlide}
                onScroll={(event) => {
                  const slideWidth = event.currentTarget.clientWidth;
                  if (!slideWidth) return;
                  const nextIndex = Math.round(
                    event.currentTarget.scrollLeft / slideWidth,
                  );
                  if (nextIndex !== activePetIndex) setActivePetIndex(nextIndex);
                }}
              >
                {petProfiles.map((pet) => (
                  <article className="pet-carousel__slide" key={pet.id}>
                    <div className="pet-carousel__bubble">
                      오늘 사료도 같이 확인해볼까?
                    </div>
                    <PetIllustration
                      className="pet-carousel__pet"
                      type={pet.petType}
                    />
                    <h1 id={pet === activePet ? 'dashboard-heading' : undefined}>
                      {pet.petName}
                    </h1>
                    <p>
                      {pet.petType === 'dog' ? '강아지' : '고양이'}
                      {' · '}
                      {pet.allergies.length > 0
                        ? `알러지 ${pet.allergies.length}개`
                        : '알러지 없음'}
                    </p>
                  </article>
                ))}
              </div>

              {petProfiles.length > 1 && (
                <div
                  className="pet-carousel__pagination"
                  aria-label={`${activePetIndex + 1}번째 반려동물 표시 중`}
                >
                  {petProfiles.map((pet, index) => (
                    <span
                      className={
                        index === activePetIndex
                          ? 'pet-carousel__dot pet-carousel__dot--active'
                          : 'pet-carousel__dot'
                      }
                      key={pet.id}
                    />
                  ))}
                </div>
              )}

              <section className="pet-home-panel" aria-label={`${activePet.petName} 상세 정보`}>
                <div className="pet-home-panel__allergy">
                  <span className="pet-home-panel__allergy-icon" aria-hidden="true">🛡️</span>
                  <div>
                    <small>알러지 정보</small>
                    <strong>
                      {activePet.allergies.length > 0
                        ? activePet.allergies.join(', ')
                        : '등록된 알러지가 없어요'}
                    </strong>
                  </div>
                </div>
                <div className="pet-home-panel__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingOwner((previous) => !previous);
                      setOwnerMessage('');
                    }}
                  >
                    <span aria-hidden="true">👤</span>
                    <strong>보호자 정보</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartScanner(activePet.id)}
                  >
                    <span aria-hidden="true">📷</span>
                    <strong>사료 분석하기</strong>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <section className="pet-carousel pet-carousel--empty">
              <article className="pet-carousel__slide">
                <div className="pet-carousel__bubble">
                  내 정보를 먼저 알려주세요!
                </div>
                <PetIllustration
                  className="pet-carousel__pet"
                  type="dog"
                />
                <h1 id="dashboard-heading">{userProfile?.name ?? '회원'}님, 반가워요</h1>
                <p>반려동물을 등록하면 맞춤 사료 분석을 시작할 수 있어요.</p>
                <button
                  className="pet-carousel__register"
                  type="button"
                  onClick={onStartSetup}
                >
                  반려동물 등록하기
                </button>
              </article>
            </section>
          )}
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

    </main>
  );
}

export default Welcome;
