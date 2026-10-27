import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './EditModal.css';

const EditModal = ({ transcription, onSave, onClose }) => {
  const [editedText, setEditedText] = useState(transcription.text);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editedText.trim()) {
      alert('Transcription text cannot be empty');
      return;
    }

    if (editedText === transcription.text) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await onSave(transcription._id, { text: editedText });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Transcription</h3>
          <button onClick={onClose} className="close-btn" title="Close">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <label htmlFor="edit-text" className="modal-label">
            Transcription Text:
          </label>
          <textarea
            id="edit-text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="modal-textarea"
            rows="8"
            autoFocus
          />
          <div className="char-count">
            {editedText.length} characters
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-save"
            disabled={saving || !editedText.trim()}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
