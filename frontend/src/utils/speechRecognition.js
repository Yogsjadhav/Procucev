/**
 * Speech Recognition Service
 * 
 * This class wraps the browser's Web Speech API to provide a cleaner interface
 * for speech recognition functionality. It handles:
 * - Starting/stopping recognition
 * - Language selection
 * - Error handling
 * - Auto-restart for continuous listening
 * - Event callbacks for results and errors
 * 
 * IMPORTANT: Web Speech API requires:
 * - Chrome, Edge, or Safari browser (NOT Firefox)
 * - Microphone permission from user
 * - Internet connection (Google processes the audio)
 */

class SpeechRecognitionService {
  constructor() {
    // Check if browser supports Web Speech API
    // Different browsers use different prefixes (webkit for Chrome/Safari)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      this.supported = false;
      return;
    }

    // Mark as supported and create recognition instance
    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.finalTranscript = ''; // Stores confirmed speech
    this.interimTranscript = ''; // Stores in-progress speech
    
    /**
     * Configure recognition settings:
     * 
     * continuous: false
     * - Stops after each phrase for better reliability
     * - We manually restart it to simulate continuous mode
     * 
     * interimResults: true
     * - Gives real-time feedback as you speak
     * - Shows text before phrase is complete
     * 
     * maxAlternatives: 1
     * - Only return the best match (no alternatives)
     */
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    // Default language is US English, can be changed later
    this.recognition.lang = 'en-US';
    
    console.log('Recognition configured:', {
      continuous: this.recognition.continuous,
      interimResults: this.recognition.interimResults,
      lang: this.recognition.lang
    });
    
    console.log('Speech Recognition initialized with language:', this.recognition.lang);
  }

  /**
   * Set the language for speech recognition
   * @param {string} lang - Language code (e.g., 'en-US', 'hi-IN', 'es-ES')
   * 
   * Supported languages include:
   * - en-US: English (United States)
   * - hi-IN: Hindi (India)
   * - en-IN: English (India) - good for Hindi+English mix
   * - And many more (see SUPPORTED_LANGUAGES array below)
   */
  setLanguage(lang) {
    if (this.supported) {
      this.recognition.lang = lang;
      console.log('Language set to:', lang);
    }
  }

  /**
   * Start listening for speech
   * 
   * @param {Function} onResult - Callback when speech is recognized
   *                              Receives: { final, interim, isFinal }
   * @param {Function} onEnd - Callback when recognition ends
   *                           Receives: { final, interim, isFinal }
   * @param {Function} onError - Callback when an error occurs
   *                             Receives: { error, message }
   */
  start(onResult, onEnd, onError) {
    if (!this.supported) {
      if (onError) onError(new Error('Speech Recognition not supported'));
      return;
    }

    // Reset transcripts for new recording session
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.shouldRestart = true; // Flag to control auto-restart behavior

    console.log('Starting speech recognition with language:', this.recognition.lang);

    /**
     * Event: Recognition has started
     * Fired when recognition begins listening
     */
    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
    };

    /**
     * Event: Speech detected
     * Fired when the API detects that user started speaking
     */
    this.recognition.onspeechstart = () => {
      console.log('Speech detected');
    };

    /**
     * Event: Speech ended
     * Fired when the API detects that user stopped speaking
     */
    this.recognition.onspeechend = () => {
      console.log('Speech ended');
    };

    /**
     * Event: Audio capture started
     * Fired when microphone starts capturing audio
     */
    this.recognition.onaudiostart = () => {
      console.log('Audio capturing started');
    };

    /**
     * Event: Audio capture ended
     * Fired when microphone stops capturing audio
     */
    this.recognition.onaudioend = () => {
      console.log('Audio capturing ended');
    };

    /**
     * Event: Results received from speech recognition
     * 
     * This fires multiple times as the user speaks:
     * 1. First with interim results (while speaking)
     * 2. Then with final results (after phrase complete)
     * 
     * Each result has:
     * - transcript: The recognized text
     * - confidence: How confident the API is (0-1)
     * - isFinal: Whether this is the final version
     */
    this.recognition.onresult = (event) => {
      console.log('Recognition result event:', event);
      let interim = '';
      
      // Loop through all results in this event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript; // The recognized text
        const confidence = event.results[i][0].confidence; // Confidence score (0-1)
        
        console.log(`Result ${i}: "${transcript}", Final: ${event.results[i].isFinal}, Confidence: ${confidence}`);
        
        // If result is final (user finished the phrase), add to final transcript
        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          // If interim (still speaking), store separately for real-time display
          interim += transcript;
        }
      }
      
      this.interimTranscript = interim;
      
      console.log('Final transcript:', this.finalTranscript.trim());
      console.log('Interim transcript:', this.interimTranscript);
      
      // Call the callback with current results
      if (onResult) {
        onResult({
          final: this.finalTranscript.trim(),   // All confirmed text so far
          interim: this.interimTranscript,       // Current in-progress text
          isFinal: false,                        // Not done yet
        });
      }
    };

    /**
     * Event: Recognition ended
     * 
     * This happens after each phrase when continuous=false
     * We auto-restart to simulate continuous listening
     * 
     * Why auto-restart?
     * - continuous: true can be unstable in some browsers
     * - Manual restart gives us more control and reliability
     */
    this.recognition.onend = () => {
      console.log('Recognition ended. isListening:', this.isListening, 'shouldRestart:', this.shouldRestart);
      console.log('Final transcript so far:', this.finalTranscript);
      
      // Auto-restart if user hasn't explicitly stopped (simulates continuous mode)
      if (this.isListening && this.shouldRestart) {
        console.log('Auto-restarting in 100ms...');
        // Small delay before restart to avoid issues
        setTimeout(() => {
          if (this.isListening && this.shouldRestart) {
            try {
              console.log('Attempting restart...');
              this.recognition.start();
            } catch (e) {
              console.error('Restart failed:', e);
              this.isListening = false;
              // Notify that we're done
              if (onEnd) {
                onEnd({
                  final: this.finalTranscript.trim(),
                  interim: '',
                  isFinal: true,
                });
              }
            }
          }
        }, 100); // 100ms delay prevents "already started" errors
      } else {
        console.log('Stopping recognition (no restart)');
        this.isListening = false;
        // Notify that we're done
        if (onEnd) {
          onEnd({
            final: this.finalTranscript.trim(),
            interim: '',
            isFinal: true,
          });
        }
      }
    };

    /**
     * Event: Error occurred during recognition
     * 
     * Common errors:
     * - no-speech: No speech detected (microphone too quiet or no audio)
     * - audio-capture: No microphone found or failed
     * - not-allowed: User denied microphone permission
     * - network: Internet connection issue
     * - aborted: Recognition manually stopped
     */
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event);
      
      /**
       * no-speech Error:
       * This happens when microphone is working but no speech is detected
       * Common causes:
       * - Microphone volume too low
       * - User not speaking
       * - Background noise too high
       * 
       * We DON'T stop recognition - just log and continue waiting
       */
      if (event.error === 'no-speech') {
        console.log('No speech detected, waiting for input...');
        return; // Don't stop, just continue waiting
      }
      
      /**
       * audio-capture Error:
       * No microphone found or microphone failed
       * This IS critical - stop recognition
       */
      if (event.error === 'audio-capture') {
        this.isListening = false;
        this.shouldRestart = false;
        if (onError) onError({ 
          error: 'audio-capture', 
          message: 'No microphone detected. Please check your microphone connection.' 
        });
        return;
      }
      
      /**
       * not-allowed Error:
       * User denied microphone permission
       * This IS critical - stop recognition
       */
      if (event.error === 'not-allowed') {
        this.isListening = false;
        this.shouldRestart = false;
        if (onError) onError({ 
          error: 'not-allowed', 
          message: 'Microphone permission denied. Please allow microphone access.' 
        });
        return;
      }
      
      /**
       * network Error:
       * Internet connection issue
       * Web Speech API requires internet (Google processes audio)
       * This IS critical - stop recognition
       */
      if (event.error === 'network') {
        this.isListening = false;
        this.shouldRestart = false;
        if (onError) onError({ 
          error: 'network', 
          message: 'Network error. Please check your internet connection.' 
        });
        return;
      }
      
      /**
       * aborted Error:
       * Recognition was manually stopped (usually by us)
       * This is expected - just log it
       */
      if (event.error === 'aborted') {
        console.log('Recognition aborted');
        return;
      }
      
      // Generic error handler for any other errors
      console.log('Other error:', event.error);
      if (onError) onError(event);
    };

    // Actually start the recognition
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
      if (onError) onError({ 
        error: 'start-failed', 
        message: 'Failed to start speech recognition: ' + e.message 
      });
    }
  }

  /**
   * Stop listening for speech
   * 
   * Sets shouldRestart to false to prevent auto-restart
   * Then stops the recognition engine
   */
  stop() {
    if (this.supported && this.isListening) {
      console.log('Stopping speech recognition');
      this.shouldRestart = false; // Prevent auto-restart
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   * @returns {boolean} True if listening, false otherwise
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Check if browser supports speech recognition
   * @returns {boolean} True if supported, false otherwise
   */
  isSupported() {
    return this.supported;
  }
}

/**
 * Supported languages for multilingual recognition
 * 
 * Format: { code: 'language-COUNTRY', name: 'Display Name' }
 * 
 * The code follows BCP 47 language tags:
 * - First part: Language code (e.g., 'en', 'hi', 'es')
 * - Second part: Region/country code (e.g., 'US', 'IN', 'ES')
 * 
 * Tips:
 * - Use 'en-IN' for mixed Hindi+English speech
 * - Each language may have different accuracy
 * - Some work better than others depending on accent
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ko-KR', name: 'Korean' },
];

export default SpeechRecognitionService;
