import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSave, FaTrash } from 'react-icons/fa';
import SpeechRecognitionService, { SUPPORTED_LANGUAGES } from '../utils/speechRecognition';
import { transcriptionAPI } from '../services/api';
import './SpeechToText.css';

/**
 * SpeechToText Component
 * 
 * Main component for recording and transcribing speech in real-time.
 * 
 * Features:
 * - Real-time speech recognition using Web Speech API
 * - Multi-language support (14+ languages)
 * - Start/Stop recording controls
 * - Save transcriptions to database
 * - Clear functionality
 * - Error handling and user feedback
 * 
 * Props:
 * @param {Function} onSave - Callback function called when transcription is saved successfully
 *                            Used to notify parent component (App) to refresh dashboard
 */
const SpeechToText = ({ onSave }) => {
  // ==================== STATE MANAGEMENT ====================
  
  // Whether speech recognition is currently active
  const [isListening, setIsListening] = useState(false);
  
  // The final confirmed transcript text
  const [transcript, setTranscript] = useState('');
  
  // Interim (in-progress) text shown in real-time as user speaks
  const [interimText, setInterimText] = useState('');
  
  // Currently selected language for recognition (default: English US)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  
  // Error message to display to user (empty string = no error)
  const [error, setError] = useState('');
  
  // Timestamp when recording started (used to calculate duration)
  const [startTime, setStartTime] = useState(null);
  
  // Whether we're currently saving to database
  const [isSaving, setIsSaving] = useState(false);
  
  // Whether save was successful (shows success message briefly)
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reference to speech recognition service instance
  // useRef prevents recreation on every render
  const recognitionService = useRef(null);

  // ==================== INITIALIZATION ====================
  
  /**
   * Component initialization effect
   * Runs once when component mounts
   * 
   * - Creates speech recognition service instance
   * - Checks if browser supports speech recognition
   * - Sets error message if not supported
   * - Cleans up on unmount
   */
  useEffect(() => {
    console.log('=== INITIALIZING SPEECH RECOGNITION SERVICE ===');
    recognitionService.current = new SpeechRecognitionService();

    // Check if browser supports speech recognition
    if (!recognitionService.current.isSupported()) {
      setError('Speech Recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      console.error('Speech Recognition NOT supported');
    } else {
      console.log('✅ Speech Recognition is supported');
      console.log('Browser:', navigator.userAgent);
    }

    // Cleanup function: stop recognition when component unmounts
    return () => {
      if (recognitionService.current) {
        recognitionService.current.stop();
      }
    };
  }, []); // Empty dependency array = run once on mount

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Handle Start Recording button click
   * 
   * Steps:
   * 1. Validate that recognition is available
   * 2. Reset all state (clear previous transcription)
   * 3. Set the language
   * 4. Start recognition with callbacks
   * 5. Update UI to "listening" state
   */
  const handleStart = () => {
    // Validate speech recognition is available
    if (!recognitionService.current || !recognitionService.current.isSupported()) {
      setError('Speech Recognition is not available');
      return;
    }

    console.log('=== STARTING SPEECH RECOGNITION ===');
    console.log('Selected Language:', selectedLanguage);

    // Reset all state for new recording
    setError('');           // Clear any previous errors
    setTranscript('');      // Clear previous transcript
    setInterimText('');     // Clear interim text
    setSaveSuccess(false);  // Hide success message
    setStartTime(Date.now()); // Record start time for duration

    // Set the recognition language
    recognitionService.current.setLanguage(selectedLanguage);
    
    /**
     * Start recognition with three callback functions:
     * 
     * 1. onResult - Called when speech is recognized
     * 2. onEnd - Called when recognition ends
     * 3. onError - Called when an error occurs
     */
    recognitionService.current.start(
      // ========== CALLBACK 1: onResult ==========
      // Called whenever speech is recognized (multiple times during recording)
      (result) => {
        console.log('=== RESULT RECEIVED ===');
        console.log('Final:', result.final);     // Confirmed text
        console.log('Interim:', result.interim); // In-progress text
        
        // Update state with recognized text
        setTranscript(result.final);    // Shows confirmed phrases
        setInterimText(result.interim); // Shows current phrase being spoken
        
        // Clear error if we're successfully getting results
        setError('');
      },
      
      // ========== CALLBACK 2: onEnd ==========
      // Called when recognition stops (either manually or automatically)
      (result) => {
        console.log('=== RECOGNITION ENDED ===');
        console.log('Final result:', result.final);
        
        // Update UI state
        setIsListening(false);
        
        // If there's a final result, update transcript
        if (result.final) {
          setTranscript(result.final);
        }
        
        // Clear interim text (no longer speaking)
        setInterimText('');
      },
      
      // ========== CALLBACK 3: onError ==========
      // Called when an error occurs during recognition
      (event) => {
        console.log('=== ERROR RECEIVED ===');
        console.log('Error:', event);
        
        // Only show critical errors to user
        // "no-speech" errors are ignored (handled in service)
        
        if (event.error === 'audio-capture') {
          // Microphone not found or failed
          setIsListening(false);
          setError(event.message || 'No microphone detected. Please check your microphone connection.');
          setInterimText('');
        } else if (event.error === 'not-allowed') {
          // User denied microphone permission
          setIsListening(false);
          setError(event.message || 'Microphone permission denied. Please allow microphone access and try again.');
          setInterimText('');
        } else if (event.error === 'network') {
          // Internet connection issue
          setIsListening(false);
          setError(event.message || 'Network error. Please check your internet connection.');
          setInterimText('');
        }
        // Note: 'no-speech' errors are ignored - they happen when user pauses
      }
    );

    // Update UI to show we're listening
    setIsListening(true);
  };

  /**
   * Handle Stop Recording button click
   * 
   * Steps:
   * 1. Stop the recognition service
   * 2. Update UI state
   * 3. Clear interim text
   */
  const handleStop = () => {
    if (recognitionService.current) {
      recognitionService.current.stop(); // Stop recognition
    }
    setIsListening(false);  // Update UI
    setInterimText('');     // Clear in-progress text
  };

  /**
   * Handle Save button click
   * Saves the current transcription to the database
   * 
   * Steps:
   * 1. Validate there's text to save
   * 2. Calculate duration
   * 3. Prepare data object
   * 4. Send to API
   * 5. Handle response (success/error)
   * 6. Notify parent component on success
   * 7. Clear form after short delay
   */
  const handleSave = async () => {
    // Validate: Don't save if no text
    if (!transcript.trim()) {
      setError('No transcription to save');
      return;
    }

    // Update UI state
    setIsSaving(true);  // Disable save button, show "Saving..."
    setError('');       // Clear any previous errors

    try {
      // Calculate how long the recording was
      const duration = startTime ? (Date.now() - startTime) / 1000 : 0;
      
      // Prepare data to send to API
      const transcriptionData = {
        text: transcript.trim(),      // The transcribed text
        language: selectedLanguage,   // Which language was used
        duration: duration,            // How long in seconds
        confidence: 0.9,               // Confidence score (Web Speech API doesn't always provide this)
        userId: 'user-' + Date.now(), // Simple user identification
      };

      // Send to backend API
      const response = await transcriptionAPI.create(transcriptionData);
      
      // If successful
      if (response.success) {
        // Show success message
        setSaveSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Notify parent component (App) to refresh dashboard
        if (onSave) {
          onSave(response.data);
        }

        // Clear the form after 1 second (gives user time to see success message)
        setTimeout(() => {
          setTranscript('');
          setStartTime(null);
        }, 1000);
      }
    } catch (err) {
      // Handle error
      setError('Failed to save transcription: ' + (err.response?.data?.message || err.message));
    } finally {
      // Always re-enable save button
      setIsSaving(false);
    }
  };

  /**
   * Handle Clear button click
   * Resets all form state to initial values
   */
  const handleClear = () => {
    setTranscript('');      // Clear transcript
    setInterimText('');     // Clear interim text
    setError('');           // Clear errors
    setSaveSuccess(false);  // Hide success message
    setStartTime(null);     // Reset timer
  };

  /**
   * Handle Language dropdown change
   * 
   * If currently recording:
   * - Stop current recording
   * - Language will be applied on next start
   * 
   * If not recording:
   * - Just update the selected language
   */
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    
    // If currently listening, stop and restart with new language
    if (isListening) {
      handleStop();
      // Small delay before restarting
      setTimeout(() => {
        setSelectedLanguage(newLang);
      }, 100);
    }
  };

  // ==================== RENDER ====================
  
  return (
    <div className="speech-to-text-container">
      {/* Header Section */}
      <div className="stt-header">
        <h2>🎙️ Real-time Speech to Text</h2>
        <p className="stt-subtitle">Speak naturally in any supported language</p>
      </div>

      {/* Controls Section */}
      <div className="stt-controls">
        {/* Language Selector */}
        <div className="language-selector">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={isListening} // Disable while recording
            className="language-dropdown"
          >
            {/* Map over supported languages to create options */}
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          {/* Conditionally show Start OR Stop button */}
          {!isListening ? (
            // Start Recording Button
            <button
              onClick={handleStart}
              className="btn btn-start"
              disabled={!recognitionService.current?.isSupported()} // Disable if not supported
            >
              <FaMicrophone /> Start Recording
            </button>
          ) : (
            // Stop Recording Button (shown while listening)
            <button onClick={handleStop} className="btn btn-stop">
              <FaMicrophoneSlash /> Stop Recording
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="btn btn-save"
            disabled={!transcript.trim() || isSaving} // Disable if no text or already saving
          >
            <FaSave /> {isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="btn btn-clear"
            disabled={false} // Always enabled
          >
            <FaTrash /> Clear
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Success Alert */}
      {saveSuccess && (
        <div className="alert alert-success">
          ✓ Transcription saved successfully!
        </div>
      )}

      {/* Transcription Display Area */}
      <div className="transcription-display">
        {/* Status Bar */}
        <div className="status-bar">
          <span className={`status-indicator ${isListening ? 'listening' : ''}`}>
            {isListening ? '🔴 Listening...' : '⚫ Not listening'}
          </span>
          {/* Show duration if recording */}
          {startTime && (
            <span className="duration">
              Duration: {Math.floor((Date.now() - startTime) / 1000)}s
            </span>
          )}
        </div>

        {/* Transcript Box */}
        <div className="transcript-box">
          {/* Final (confirmed) transcript */}
          {transcript && <div className="final-transcript">{transcript}</div>}
          
          {/* Interim (in-progress) transcript */}
          {interimText && (
            <div className="interim-transcript">
              <em>{interimText}</em>
            </div>
          )}
          
          {/* Placeholder when empty */}
          {!transcript && !interimText && (
            <div className="placeholder">
              Click "Start Recording" and begin speaking...
            </div>
          )}
        </div>
      </div>

      {/* Information and Tips Section */}
      <div className="stt-info">
        <p>
          💡 <strong>Tip:</strong> This application supports multilingual speech recognition.
          You can speak in a mixture of languages (e.g., Hindi + English) and the system will transcribe them.
        </p>
        <p>
          <strong>Note:</strong> Speech recognition works best in Chrome, Edge, and Safari browsers.
        </p>
        <p>
          <strong>Troubleshooting:</strong> If you see "no-speech" error, make sure:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Your microphone is connected and working</li>
          <li>Browser has microphone permission (check browser address bar)</li>
          <li>You're speaking clearly and loudly enough</li>
          <li>Background noise is minimal</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechToText;
