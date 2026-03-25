/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import APIService from '../../services/APIService';
import { Checkbox, Textarea } from '../../components/form';
import { FormSection } from '../../components/layout';

const MODE_STORAGE_KEY = 'reviewGenerationMode';
const MODES = {
  AUTO: 'auto',
  TAG: 'tag'
};

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [review, setReview] = useState('');
  const [mode, setMode] = useState(MODES.TAG);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [reviewLength, setReviewLength] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showTagWarning, setShowTagWarning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const data = await APIService.getClient(id);
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);

    if (newSelected.size >= 3) {
      setShowTagWarning(false);
    } else if (newSelected.size > 0) {
      setShowTagWarning(true);
    }
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    localStorage.setItem(MODE_STORAGE_KEY, selectedMode);
    setShowModeSelector(false);

    if (selectedMode === MODES.AUTO && client) {
      generateReviewWithMode(selectedMode);
    }
  };

  const toggleMode = () => {
    const newMode = mode === MODES.AUTO ? MODES.TAG : MODES.AUTO;
    setMode(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
  };

  const generateReviewWithMode = async (currentMode) => {
    const effectiveMode = currentMode || mode;

    if (effectiveMode === MODES.TAG && selectedTags.size < 3) {
      setShowTagWarning(true);
      return;
    }

    setShowTagWarning(false);
    setGenerating(true);

    try {
      let tagsToSend = [];

      if (effectiveMode === MODES.TAG) {
        tagsToSend = Array.from(selectedTags);
      } else {
        const allTags = client.chatText ? client.chatText.split(',').map(t => t.trim()) : [];
        tagsToSend = allTags.slice(0, 5);
      }

      const response = await APIService.generateReview(id, {
        mode: effectiveMode,
        tags: tagsToSend,
        length: reviewLength
      });

      if (response && response.review) {
        setReview(response.review);
      }
    } catch (error) {
      console.error('Error generating review:', error);
      alert('Failed to generate review: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyReview = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(review);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = review;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);

        if (client?.reviewLink) {
          window.open(client.reviewLink, '_blank');
        } else {
          alert('Review copied! Please paste it on your Google review page.');
        }
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="empty-state">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-exclamation-circle text-red-500 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Client Not Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                The client you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/user/home" className="btn btn-md btn-primary">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tags = client.chatText ? client.chatText.split(',').map(t => t.trim()).filter(t => t) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 mb-6 fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-xl">
                  {client.name?.[0]?.toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{client.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                    mode === MODES.AUTO
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    <i className={`fas fa-${mode === MODES.AUTO ? 'magic' : 'tags'} text-xs`}></i>
                    {mode === MODES.AUTO ? 'Auto Mode' : 'Tag Mode'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleMode}
              className="btn btn-md btn-primary self-start lg:self-center"
            >
              <i className={`fas fa-${mode === MODES.AUTO ? 'tags' : 'magic'}`}></i>
              Switch to {mode === MODES.AUTO ? 'Tag' : 'Auto'} Mode
            </button>
          </div>
        </div>

        {/* Tag Selection (only in Tag Mode) */}
        {mode === MODES.TAG && tags.length > 0 && (
          <FormSection title="Select Tags" icon="fas fa-tags" className="mb-6 slide-up">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Choose at least 3 tags to generate a personalized review
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className={`badge ${selectedTags.size >= 3 ? 'badge-success' : 'badge-warning'}`}>
                {selectedTags.size} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
              {tags.map((tag, index) => (
                <label
                  key={`${tag}-${index}`}
                  className={`inline-flex items-center px-4 py-2.5 rounded-xl cursor-pointer motion-normal ${
                    selectedTags.has(tag)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Checkbox
                    value={tag}
                    checked={selectedTags.has(tag)}
                    onChange={() => handleTagToggle(tag)}
                    label={tag}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{tag}</span>
                  {selectedTags.has(tag) && (
                    <i className="fas fa-check ml-2 text-xs"></i>
                  )}
                </label>
              ))}
            </div>

            {/* Tag Warning */}
            {showTagWarning && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl bounce-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-amber-600 dark:text-amber-400"></i>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    Please select at least 3 tags to generate a review.
                  </span>
                </div>
              </div>
            )}
          </FormSection>
        )}

        {/* Review Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Review Length Buttons */}
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Review Length</p>
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl gap-1">
                {['short', 'medium', 'large'].map((length) => (
                  <button
                    key={length}
                    onClick={() => setReviewLength(length)}
                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm motion-normal ${
                      reviewLength === length
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            <button
              onClick={() => generateReviewWithMode()}
              disabled={generating || (mode === MODES.TAG && selectedTags.size < 3)}
              className="btn btn-md btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-refresh"></i>
                  Regenerate Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Review */}
        {review ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-quote-left text-indigo-500"></i>
                Generated Review
              </h3>
              <span className="badge badge-success">
                <i className="fas fa-check mr-1"></i>
                Ready
              </span>
            </div>

            <Textarea
              value={review}
              readOnly
              className="h-56"
              rows={8}
              showCharCount={true}
            />

            <div className="mt-6 btn-group">
              <button
                onClick={copyReview}
                className={`flex-1 btn btn-lg ${
                  copySuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white shadow-lg`}
              >
                <i className={`fas fa-${copySuccess ? 'check' : 'copy'}`}></i>
                {copySuccess ? 'Copied Successfully!' : 'Copy & Open Review Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="empty-state">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6 float">
                <i className="fas fa-file-lines text-3xl text-slate-400 dark:text-slate-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Review Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {mode === MODES.TAG
                  ? 'Select at least 3 tags and click "Regenerate Review" to create a personalized review.'
                  : 'Click "Regenerate Review" to automatically generate a review.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <a
            href="https://wa.me/918200010737?text=Hello,%0AI%20need%20the%20AI%20Review%20Card"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold motion-normal shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            Get Your Digital Review Card
          </a>
          <div className="pt-4">
            <a
              href="https://yrhpsoftware.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 motion-fast text-sm"
            >
              <i className="fas fa-globe mr-1"></i>
              Developed by YRHP Software
            </a>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              &copy; {new Date().getFullYear()} YRHP | All Rights Reserved
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection Overlay */}
      {showModeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-lg w-full">
            {/* Title */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-2xl shadow-purple-500/50 float">
                <i className="fas fa-wand-magic-sparkles text-3xl text-white"></i>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                AI Magic Review
              </h1>
              <p className="text-slate-300 text-lg">
                Choose how you'd like to generate your review
              </p>
            </div>

            {/* Mode Selection Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 lg:p-8 space-y-4">
              <button
                onClick={() => selectMode(MODES.AUTO)}
                className="w-full p-6 text-left bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white rounded-2xl motion-slow transform hover:scale-[1.02] shadow-xl group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 motion-fast">
                    <i className="fas fa-magic text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-xl font-bold block mb-1">Auto Generate</span>
                    <span className="text-white/80 text-sm">
                      Instantly generate a review using AI without manual tag selection
                    </span>
                  </div>
                  <i className="fas fa-arrow-right text-white/50 group-hover:text-white group-hover:translate-x-1 motion-normal self-center"></i>
                </div>
              </button>

              <button
                onClick={() => selectMode(MODES.TAG)}
                className="w-full p-6 text-left bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl motion-slow transform hover:scale-[1.02] shadow-xl group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 motion-fast">
                    <i className="fas fa-tags text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-xl font-bold block mb-1">Tag-based Review</span>
                    <span className="text-white/80 text-sm">
                      Select specific tags manually to create a customized review
                    </span>
                  </div>
                  <i className="fas fa-arrow-right text-white/50 group-hover:text-white group-hover:translate-x-1 motion-normal self-center"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewClient;


