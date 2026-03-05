// frontend/src/components/SoundToggleButton.jsx
import { useChatStore } from '../store/useChatStore';
import ProfileHeaderButton from './ProfileHeaderButton';
import { Volume2Icon, VolumeOffIcon } from 'lucide-react';

const mouseClickSound = new Audio('/sounds/mouse-click.mp3');

function SoundToggleButton() {
  const { isSoundEnabled, toggleSound } = useChatStore();

  const handleToggleButtonClick = () => {
    // Only play sound if we're turning sound on
    if (!isSoundEnabled) {
      mouseClickSound.currentTime = 0; // reset to start
      mouseClickSound.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    toggleSound();
  };

  return (
    <ProfileHeaderButton
      onClick={handleToggleButtonClick}
      dataTip={isSoundEnabled ? 'Toggle Sound Off' : 'Toggle Sound On'}
    >
      {isSoundEnabled ? <Volume2Icon className="size-5" /> : <VolumeOffIcon className="size-5" />}
    </ProfileHeaderButton>
  );
}
export default SoundToggleButton;
