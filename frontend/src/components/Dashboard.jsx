import { useState, useEffect } from 'react';
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaFilter,
  FaSync,
  FaClock,
  FaLanguage,
  FaChartBar,
} from 'react-icons/fa';
import { transcriptionAPI } from '../services/api';
import TranscriptionCard from './TranscriptionCard';
import EditModal from './EditModal';
import './Dashboard.css';

const Dashboard = ({ refreshTrigger }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [stats, setStats] = useState(null);
  const [editingTranscription, setEditingTranscription] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch transcriptions
  const fetchTranscriptions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filterLanguage) {
        params.language = filterLanguage;
      }

      const response = await transcriptionAPI.getAll(params);
      
      if (response.success) {
        let data = response.data;

        // Apply search filter on client side
        if (searchTerm) {
          data = data.filter((t) =>
            t.text.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setTranscriptions(data);
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });
      }
    } catch (err) {
      setError('Failed to load transcriptions: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await transcriptionAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Initial load and refresh on trigger
  useEffect(() => {
    fetchTranscriptions();
    fetchStats();
  }, [pagination.page, filterLanguage, refreshTrigger]);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchTranscriptions();
      } else {
        setPagination({ ...pagination, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      const response = await transcriptionAPI.delete(id);
      
      if (response.success) {
        setTranscriptions(transcriptions.filter((t) => t._id !== id));
        fetchStats(); // Update stats
      }
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (transcription) => {
    setEditingTranscription(transcription);
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
      const response = await transcriptionAPI.update(id, updatedData);
      
      if (response.success) {
        // Update local state
        setTranscriptions(
          transcriptions.map((t) =>
            t._id === id ? response.data : t
          )
        );
        setEditingTranscription(null);
        fetchStats();
      }
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRefresh = () => {
    fetchTranscriptions();
    fetchStats();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📋 Transcription History</h2>
        <button onClick={handleRefresh} className="btn-refresh" title="Refresh">
          <FaSync /> Refresh
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <FaChartBar className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Transcriptions</div>
            </div>
          </div>

          <div className="stat-card">
            <FaLanguage className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">
                {stats.languageStats?.length || 0}
              </div>
              <div className="stat-label">Languages Used</div>
            </div>
          </div>

          <div className="stat-card">
            <FaClock className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">
                {stats.recentTranscriptions?.length || 0}
              </div>
              <div className="stat-label">Recent Sessions</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="filter-select"
          >
            <option value="">All Languages</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi</option>
            <option value="en-IN">English (India)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Transcriptions List */}
      <div className="transcriptions-list">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading transcriptions...</p>
          </div>
        ) : transcriptions.length === 0 ? (
          <div className="empty-state">
            <p>No transcriptions found.</p>
            <p className="empty-hint">
              Start recording to create your first transcription!
            </p>
          </div>
        ) : (
          transcriptions.map((transcription) => (
            <TranscriptionCard
              key={transcription._id}
              transcription={transcription}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingTranscription && (
        <EditModal
          transcription={editingTranscription}
          onSave={handleSaveEdit}
          onClose={() => setEditingTranscription(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
