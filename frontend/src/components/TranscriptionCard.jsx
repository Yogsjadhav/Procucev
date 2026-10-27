import { FaEdit, FaTrash, FaClock, FaLanguage } from 'react-icons/fa';
import './TranscriptionCard.css';

const TranscriptionCard = ({ transcription, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getLanguageName = (code) => {
    const languages = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'hi-IN': 'Hindi',
      'en-IN': 'English (India)',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'ja-JP': 'Japanese',
      'zh-CN': 'Chinese',
      'ar-SA': 'Arabic',
      'pt-BR': 'Portuguese',
      'ru-RU': 'Russian',
      'ko-KR': 'Korean',
    };
    return languages[code] || code;
  };

  return (
    <div className="transcription-card">
      <div className="card-header">
        <div className="card-meta">
          <span className="meta-item">
            <FaClock /> {formatDate(transcription.createdAt)}
          </span>
          <span className="meta-item">
            <FaLanguage /> {getLanguageName(transcription.language)}
          </span>
          {transcription.duration > 0 && (
            <span className="meta-item">
              ⏱️ {formatDuration(transcription.duration)}
            </span>
          )}
        </div>
        <div className="card-actions">
          <button
            onClick={() => onEdit(transcription)}
            className="action-btn edit-btn"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(transcription._id)}
            className="action-btn delete-btn"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="card-content">
        <p className="transcription-text">{transcription.text}</p>
        {transcription.isEdited && (
          <span className="edited-badge">Edited</span>
        )}
      </div>

      {transcription.confidence > 0 && (
        <div className="card-footer">
          <div className="confidence-bar">
            <div className="confidence-label">
              Confidence: {Math.round(transcription.confidence * 100)}%
            </div>
            <div className="confidence-progress">
              <div
                className="confidence-fill"
                style={{ width: `${transcription.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionCard;
