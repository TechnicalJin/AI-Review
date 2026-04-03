/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import APIService from '../services/APIService';
import TagInput from '../components/tags/TagInput';
import TagList from '../components/tags/TagList';

const pageStyles = `
body {
  background: #f9fafb;
}

.input-modern {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  color: #1f2937;
}

.input-modern:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  outline: none;
}

.btn-primary {
  background: #4f46e5;
  color: #ffffff;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tag-modern {
  display: inline-flex;
  align-items: center;
  background-color: #D2E3FC;
  border: 1px solid #AECBFA;
  color: #202124;
  padding: 5px 12px;
  margin: 4px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.tag-modern:hover {
  background-color: #C0D8FC;
}

.tag-modern:active {
  background-color: #AECBFA;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

.tag-modern .remove-tag-btn {
  margin-left: 8px;
  font-size: 16px;
  color: #5f6368;
  cursor: pointer;
  transition: color 0.2s;
}

.tag-modern .remove-tag-btn:hover {
  color: #D93025;
}

.selected-tags-area {
  background: #ffffff;
  border: 2px dashed #d1d5db;
  min-height: 100px;
  transition: all 0.3s ease;
}

.selected-tags-area.has-tags {
  border-style: solid;
  border-color: #e5e7eb;
  background: #f9fafb;
}

.tags-scroll-container {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.tags-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.tags-scroll-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.tags-scroll-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.tags-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

.animate-tag-bounce {
  animation: tagBounce 0.4s ease-out;
}

.animate-pulse-soft {
  animation: pulseSoft 2s ease-in-out infinite;
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes tagBounce {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 640px) {
  .tags-scroll-container {
    max-height: 200px;
  }

  .input-modern {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }

  .btn-primary, .btn-secondary {
    font-size: 0.875rem;
    padding: 0.75rem 1.5rem;
  }

  .tag-modern {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}
`;

const ChatTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState(() => new Set());
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const timersRef = useRef({ success: null, error: null });

  const tagsArray = useMemo(() => Array.from(tags), [tags]);
  const chatText = useMemo(() => tagsArray.join(', '), [tagsArray]);

  const showError = useCallback((message) => {
    if (timersRef.current.error) {
      window.clearTimeout(timersRef.current.error);
    }
    if (timersRef.current.success) {
      window.clearTimeout(timersRef.current.success);
    }
    setErrorMessage(message);
    setSuccessMessage('');
    timersRef.current.error = window.setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  }, []);

  const showSuccess = useCallback((message) => {
    if (timersRef.current.success) {
      window.clearTimeout(timersRef.current.success);
    }
    if (timersRef.current.error) {
      window.clearTimeout(timersRef.current.error);
    }
    setSuccessMessage(message);
    setErrorMessage('');
    timersRef.current.success = window.setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  }, []);

  const fetchChatText = useCallback(async () => {
    try {
      setLoading(true);
      const data = await APIService.getChatText();
      const existingTags = (data?.chatText || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      setTags(new Set(existingTags));
    } catch (error) {
      console.error('Error fetching chat text:', error);
      showError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const timers = timersRef.current;
    fetchChatText();

    return () => {
      if (timers.success) {
        window.clearTimeout(timers.success);
      }
      if (timers.error) {
        window.clearTimeout(timers.error);
      }
    };
  }, [fetchChatText]);

  const hideMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    if (timersRef.current.success) {
      window.clearTimeout(timersRef.current.success);
    }
    if (timersRef.current.error) {
      window.clearTimeout(timersRef.current.error);
    }
  };

  const addTagsFromInput = () => {
    const inputText = inputValue.trim();

    if (!inputText) {
      showError('Please enter a tag.');
      return;
    }

    const nextTags = new Set(tags);
    const tagsToAdd = inputText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    let added = false;

    tagsToAdd.forEach((tag) => {
      if (nextTags.has(tag)) {
        showError(`Tag "${tag}" already exists!`);
        return;
      }
      nextTags.add(tag);
      added = true;
    });

    if (added) {
      setTags(nextTags);
      setInputValue('');
      hideMessages();
    }
  };

  const removeTag = (tagToRemove) => {
    const nextTags = new Set(tags);
    nextTags.delete(tagToRemove);
    setTags(nextTags);

    if (nextTags.size < 10) {
      showError('You must have at least 10 tags.');
    } else {
      hideMessages();
    }
  };

  const clearAllTags = () => {
    if (window.confirm('Are you sure you want to remove all tags?')) {
      setTags(new Set());
      showError('You must have at least 10 tags.');
    }
  };

  const validateForm = () => {
    if (tags.size < 10) {
      showError('You must add at least 10 tags.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await APIService.updateChatText(chatText);
      showSuccess('Chat tags updated successfully!');
    } catch (error) {
      console.error('Error saving chat text:', error);
      showError('Failed to update chat tags');
    }
  };

  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="min-h-screen bg-gray-50">
          <div className="min-h-screen py-4 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center animate-fade-in py-16">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading tags...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-screen py-4 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="btn-secondary flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm sm:text-base animate-slide-in-left"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Home</span>
                </button>
              </div>

              <div className="text-center animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Manage Chat Widget Tags
                </h1>
              </div>
            </div>

            {successMessage && (
              <div
                className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-300 animate-slide-up"
                id="successMessage"
              >
                <div className="flex items-center">
                  <i className="fas fa-check-circle mr-2 text-base"></i>
                  <span className="font-medium text-sm">{successMessage}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-300 animate-slide-up"
                id="errorMessage"
              >
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2 text-base"></i>
                  <span id="errorText" className="font-medium text-sm">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            <form
              id="chatTextForm"
              method="post"
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm animate-fade-in"
            >
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <i className="fas fa-tags mr-2 text-primary"></i>
                  Tag Configuration
                </h2>
              </div>

              <TagInput
                value={inputValue}
                onChange={setInputValue}
                onAdd={addTagsFromInput}
              />

              <div className="mb-6">
                <label className="block text-gray-900 mb-2 font-semibold text-sm sm:text-base">
                  <i className="fas fa-collection mr-1 text-primary"></i>
                  Current Tags
                </label>

                <TagList tags={tagsArray} onRemove={removeTag} />

                <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                      <span className="text-xs font-medium text-gray-600">
                        Tags: <span id="tagCount" className="font-bold text-primary">{tagsArray.length}</span>
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                      <span className="text-xs font-medium text-gray-600">
                        Status: <span className="font-bold text-accent">No Limits</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                    onClick={clearAllTags}
                  >
                    <i className="fas fa-trash-alt mr-1"></i>
                    Clear All Tags
                  </button>
                </div>
              </div>

              <input type="hidden" name="chatText" id="hiddenChatText" value={chatText} readOnly />

              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-start text-gray-500 text-xs sm:text-sm order-2 sm:order-1">
                    <i className="fas fa-lightbulb text-yellow-500 mr-1 mt-0.5"></i>
                    <span>
                      Tip: Use clear and concise tags to help your customers quickly find what they need.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base flex items-center space-x-2 hover:scale-105 transition-transform w-full sm:w-auto justify-center order-1 sm:order-2"
                  >
                    <i className="fas fa-save"></i>
                    <span>Save Tags</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatTags;
