// frontend/src/components/Modal.jsx

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, size = 'max-w-4xl' }) {
  const modalRef = useRef(null);

  // Handle opening/closing the dialog element
  // This useEffect is necessary because the Modal component doesn't have button click handlers - it just receives the isOpen prop
  // We need the modalElement to show/close when the value of isOpen changes, but we don't want that logic to load on every render of the component, just when isOpen changes.
  // Read notes on this.
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (isOpen) {
      modalElement.showModal();
    } else {
      modalElement.close();
    }
  }, [isOpen]);

  // Don't render anything if document is not available (SSR)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog ref={modalRef} className="modal">
      <div className={`modal-box w-11/12 ${size}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            type="button"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content passed as children */}
        <div className="modal-content">{children}</div>
      </div>

      {/* Click outside to close */}
      <div className="modal-backdrop bg-black/500" onClick={onClose} />
    </dialog>,
    // Ref: https://react.dev/reference/react-dom/createPortal
    // We do this so that the dialog box doesn't try to render in the "left-side" container, but rather the chat-page container || document.body
    document.getElementById('chat-page') || document.body
  );
}

export default Modal;
