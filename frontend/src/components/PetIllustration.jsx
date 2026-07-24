import catMascotImage from '../assets/petcheck-mascot-cat-c.png';
import dogMascotImage from '../assets/petcheck-mascot-c.png';

function PetIllustration({ className = '', type = 'dog' }) {
  const isCat = type === 'cat';

  return (
    <img
      className={`pet-illustration ${className}`}
      src={isCat ? catMascotImage : dogMascotImage}
      alt={`복슬복슬한 PetCheck ${isCat ? '고양이' : '강아지'} 캐릭터`}
    />
  );
}

export default PetIllustration;
