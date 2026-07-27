import catMascotImage from '../assets/petcheck-mascot-cat-c.png';
import dogMascotImage from '../assets/petcheck-mascot-c.png';
import poodleMascotImage from '../assets/petcheck-mascot-poodle.png';
import shibaMascotImage from '../assets/petcheck-mascot-shiba.png';

const dogMascots = {
  maltese: {
    image: dogMascotImage,
    label: '말티즈',
  },
  shiba: {
    image: shibaMascotImage,
    label: '시바견',
  },
  poodle: {
    image: poodleMascotImage,
    label: '토이 푸들',
  },
};

function PetIllustration({ className = '', type = 'dog', breed = 'maltese' }) {
  const isCat = type === 'cat';
  const selectedDog = dogMascots[breed] ?? dogMascots.maltese;
  const mascotImage = isCat ? catMascotImage : selectedDog.image;
  const mascotLabel = isCat ? '고양이' : selectedDog.label;

  return (
    <img
      className={`pet-illustration ${className}`}
      src={mascotImage}
      alt={`복슬복슬한 PetCheck ${mascotLabel} 캐릭터`}
    />
  );
}

export default PetIllustration;
