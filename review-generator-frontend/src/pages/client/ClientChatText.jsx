import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import APIService from '../../services/APIService';

const ClientChatText = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatText, setChatText] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChatText();
  }, []);

  const fetchChatText = async () => {
    try {
      setLoading(true);
      const data = await APIService.getChatText(user?.email);
      setChatText(data.chatText || '');
      setTags(data.chatText ? data.chatText.split(',').map((t) => t.trim()).filter(t => t) : []);
    } catch (error) {
      console.error('Error fetching chat text:', error);
      showError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();

    if (!trimmedTag) {
      showError('Please enter a tag');
      return;
    }

    if (tags.includes(trimmedTag)) {
      showError(`Tag "${trimmedTag}" already exists!`);
      return;
    }

    const updatedTags = [...tags, trimmedTag];
    setTags(updatedTags);
    setChatText(updatedTags.join(', '));
    setNewTag('');
  };

  const removeTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    setChatText(updatedTags.join(', '));
  };

  const handleSave = async () => {
    if (tags.length < 3) {
      showError('Please add at least 3 tags');
      return;
    }

    setSaving(true);
    try {
      await APIService.updateChatText(user?.email, chatText);
      showSuccess('Chat tags updated successfully!');
      setTimeout(() => navigate('/client/home'), 1500);
    } catch (error) {
      console.error('Error saving chat text:', error);
      showError('Failed to update chat tags');
    } finally {
      setSaving(false);
    }
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/client/home"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 motion-fast group mb-6"
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 motion-fast"></i>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i className="fas fa-tags text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Manage Tags
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Organize and customize your review generation tags
              </p>
            </div>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="fas fa-exclamation-circle text-red-600 dark:text-red-400"></i>
              </div>
              <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Add Tag Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <i className="fas fa-plus-circle text-indigo-500"></i>
              Add New Tag
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter or click Add"
                className="flex-1 input"
              />
              <button
                onClick={addTag}
                className="btn btn-md btn-primary"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Tags Display Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-layer-group text-purple-500"></i>
                  Your Tags
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {tags.length} tag{tags.length !== 1 ? 's' : ''} added
                </p>
              </div>
              <span className={`badge ${tags.length >= 3 ? 'badge-success' : 'badge-warning'}`}>
                {tags.length >= 3 ? 'Ready' : 'Needs more tags'}
              </span>
            </div>

            {/* Tag Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Minimum Required</span>
                <span className={`font-semibold ${tags.length >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {tags.length} / 3 tags
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full motion-slow rounded-full ${
                    tags.length >= 3 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((tags.length / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Tags Grid */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium motion-normal hover:scale-105 scale-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <i className="fas fa-tag text-xs"></i>
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(index)}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white motion-fast ml-1"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-state py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 float">
                  <i className="fas fa-inbox text-3xl text-slate-400 dark:text-slate-500"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Tags Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Start by adding tags above
                </p>
              </div>
            )}
          </div>

          {/* Raw Text Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-code text-slate-500"></i>
              Raw Chat Text
            </h2>
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., excellent service, fast delivery, friendly staff)"
              rows="5"
              className="w-full input resize-none font-mono text-sm"
            ></textarea>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
              You can edit this directly or use the tag management above. Tags are separated by commas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/50 btn-group">
            <button
              onClick={handleSave}
              disabled={saving || tags.length < 3}
              className="flex-1 btn btn-lg btn-primary"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/client/home')}
              className="flex-1 btn btn-lg btn-secondary"
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-lightbulb text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
                Tips for Effective Tags
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <span>Use clear, descriptive tags that represent key aspects of your business</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <span>Keep tags concise (1-3 words) for better review generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <span>Include service qualities, product features, and customer experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <span>Minimum 3 tags required, but more tags provide better variety</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <span>Avoid special characters and keep tags professional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Tags */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <i className="fas fa-sparkles text-amber-500"></i>
            Example Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {['excellent service', 'fast delivery', 'friendly staff', 'quality products', 'great value', 'highly professional', 'clean environment', 'prompt response'].map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!tags.includes(example)) {
                    const updatedTags = [...tags, example];
                    setTags(updatedTags);
                    setChatText(updatedTags.join(', '));
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-medium motion-fast"
              >
                + {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientChatText;


