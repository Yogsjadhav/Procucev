import { useState } from 'react';
import SpeechToText from './components/SpeechToText';
import Dashboard from './components/Dashboard';
import './App.css';

/**
 * Main App Component
 * This is the root component that orchestrates the entire application
 * It manages the communication between SpeechToText and Dashboard components
 */
function App() {
  // State to trigger dashboard refresh when new transcription is saved
  // When this number changes, Dashboard will re-fetch data from the server
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Handler called when a transcription is successfully saved
   * This increments the refreshTrigger to notify Dashboard to reload
   */
  const handleTranscriptionSaved = () => {
    // Increment the trigger value to force Dashboard to refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      {/* Header Section - Shows app title and description */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">🎤 Speech to Text Application</h1>
          <p className="app-description">
            Real-time multilingual speech transcription with history management
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="container">
          {/* Speech to Text Component - Handles recording and saving */}
          <SpeechToText onSave={handleTranscriptionSaved} />
          
          {/* Dashboard Component - Shows transcription history */}
          {/* refreshTrigger prop causes Dashboard to reload when it changes */}
          <Dashboard refreshTrigger={refreshTrigger} />
        </div>
      </main>

      {/* Footer Section */}
      <footer className="app-footer">
        <div className="container">
          
          <p className="footer-note">
            💡 Supports multilingual transcription including Hindi + English mix
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
