// frontend/src/components/MessageInput.jsx

import { useRef, useState } from 'react';
import useKeyboardSound from '../hooks/useKeyboardSound';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';
import { ImageIcon, SendIcon, XIcon } from 'lucide-react';

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (event) => {
    event.preventDefault();

    // Prevent the submission of an empty message
    if (!text.trim() && !imagePreview) {
      toast('Add a text or image before trying to send', {
        icon: '🤚',
      });
      return;
    }

    if (isSoundEnabled) {
      playRandomKeyStrokeSound();
    }

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    // Reset the states of the text, image preview, and fileInputRef for the next message
    setText('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id="message-input" className="p-4 border-t border-slate-700/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6
            rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-1 sm:gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 bg-slate-800/50 border border-slate-700/60 rounded-lg py-2 px-2 sm:px-4 min-w-0"
          placeholder="Type your message"
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg px-2.5 sm:px-4 cursor-pointer 
            transition-colors border border-slate-700/60 focus:outline-none focus:border-white ${imagePreview ? 'text-cyan-500' : ''}
          `}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-2.5 sm:px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
