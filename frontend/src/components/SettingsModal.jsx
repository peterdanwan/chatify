// frontend/src/components/SettingsModal.jsx
import Modal from './Modal';
import { Link } from 'react-router';

function SettingsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <p className="text-slate-400">Configure your preferences below</p>
      <div className="space-y-4 mbs-6">
        {/* e.g., Option to delete user. Change status. etc. */}
        <Link to="/delete-user" className="text-error">
          Delete Account
        </Link>
      </div>
    </Modal>
  );
}
export default SettingsModal;
