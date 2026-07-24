import mascotImage from '../assets/petcheck-mascot-c.png';

function PetIllustration({ className = '' }) {
  return (
    <img
      className={`pet-illustration ${className}`}
      src={mascotImage}
      alt="복슬복슬한 PetCheck 강아지 캐릭터"
    />
  );
}

export default PetIllustration;
