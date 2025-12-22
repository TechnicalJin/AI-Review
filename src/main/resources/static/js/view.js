// ========================================
// MODE MANAGEMENT SYSTEM
// ========================================
// 
// To see the mode selection overlay again (for testing):
// Open browser console and run: localStorage.removeItem('hasSeenModeSelection')
// Then refresh the page.
//
// To reset everything:
// localStorage.clear()
// ========================================

const MODE_STORAGE_KEY = 'reviewGenerationMode';
const MODES = {
    AUTO: 'auto',
    TAG: 'tag',
    VOICE: 'voice'
};

// Initialize mode on page load
let currentMode = localStorage.getItem(MODE_STORAGE_KEY) || MODES.TAG;

// Show overlay EVERY TIME user visits a client review page
window.addEventListener('DOMContentLoaded', function() {
    console.log('Mode Management: Showing overlay for mode selection, currentMode =', currentMode);
    
    // Always show overlay to select mode for each client visit
    showModeSelectionOverlay();
    
    // Setup mode option buttons
    document.querySelectorAll('.mode-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedMode = this.dataset.mode;
            selectMode(selectedMode);
        });
    });
    
    // Setup mode toggle button using MULTIPLE methods for reliability
    setupToggleButton();
});

// Setup toggle button with multiple fallback methods
function setupToggleButton() {
    // Method 1: Event delegation on document (works even with dynamic content)
    document.addEventListener('click', function(event) {
        const toggleBtn = event.target.closest('#mode-toggle-btn');
        if (toggleBtn) {
            event.preventDefault();
            event.stopPropagation();
            toggleMode(event);
        }
    });
    
    // Method 2: Direct listener after delay
    setTimeout(() => {
        const toggleBtn = document.getElementById('mode-toggle-btn');
        if (toggleBtn) {
            // Clone to remove existing listeners
            const newBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
            
            // Add fresh listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleMode(e);
            });
        }
    }, 500);
    
    // Method 3: Touch events for mobile
    setTimeout(() => {
        const toggleBtn = document.getElementById('mode-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                toggleMode(e);
            }, { passive: false });
        }
    }, 600);
}

// Show mode selection overlay with blur
function showModeSelectionOverlay() {
    const overlay = document.getElementById('mode-selection-overlay');
    if (overlay) {
        // Show overlay
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        
        // Add blur class to body
        document.body.classList.add('overlay-active');
        
        // Fade in animation
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Prevent closing on backdrop click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                e.stopPropagation();
                // Do nothing - user must select a mode
            }
        });
        
        // Prevent ESC key from closing
        document.addEventListener('keydown', preventEscape);
    }
}

// Prevent ESC key from closing overlay
function preventEscape(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
    }
}

// Hide mode selection overlay with smooth transition
function hideModeSelectionOverlay() {
    const overlay = document.getElementById('mode-selection-overlay');
    if (overlay) {
        // Remove blur from background
        document.body.classList.remove('overlay-active');
        
        // Fade out overlay
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            // Remove ESC key listener
            document.removeEventListener('keydown', preventEscape);
        }, 300);
    }
}

// Select and apply mode
function selectMode(mode) {
    currentMode = mode;
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    
    // Hide overlay with animation
    hideModeSelectionOverlay();
    
    // Apply mode after overlay animation completes
    setTimeout(() => {
        applyMode(mode);
    }, 350);
}

// Apply mode to UI (without transitions)
function applyMode(mode) {
    const tagWrapper = document.getElementById('tag-selection-wrapper');
    const voiceContainer = document.getElementById('voiceInputContainer');
    const modeIcon = document.getElementById('mode-status-icon');
    const modeText = document.getElementById('mode-status-text');
    const modeDescription = document.getElementById('mode-description');
    const toggleBtn = document.getElementById('mode-toggle-btn');
    const tagWarning = document.getElementById('tag-warning');
    const regenerateControls = document.getElementById('regenerateControls');
    const reviewTextarea = document.getElementById('review-msg-content');
    
    if (!tagWrapper || !modeIcon || !modeText || !toggleBtn) {
        console.warn('Mode control elements not found');
        return;
    }
    
    if (mode === MODES.AUTO) {
        // Auto Mode
        tagWrapper.classList.add('hidden');
        tagWrapper.style.maxHeight = '0';
        tagWrapper.style.opacity = '0';
        if (voiceContainer) {
            voiceContainer.style.display = 'none';
        }
        
        if (tagWarning) {
            tagWarning.classList.add('d-none');
        }
                // Show regenerate controls in Auto mode
        if (regenerateControls) {
            regenerateControls.style.display = 'block';
        }
                modeIcon.textContent = '🟣';
        modeText.textContent = 'Current Mode: Auto';        if (modeDescription) {
            modeDescription.textContent = '🪄 Review will be auto-generated without tag selection';
        }        toggleBtn.innerHTML = '<i class="fas fa-tags"></i> Switch to Tag Mode';
    } else if (mode === MODES.VOICE) {
        // Voice Mode
        tagWrapper.classList.add('hidden');
        tagWrapper.style.maxHeight = '0';
        tagWrapper.style.opacity = '0';
        if (voiceContainer) {
            voiceContainer.style.display = 'block';
        }
        
        if (tagWarning) {
            tagWarning.classList.add('d-none');
        }
        
        // Hide regenerate controls in Voice mode
        if (regenerateControls) {
            regenerateControls.style.display = 'none';
        }
        
        // Show placeholder for voice review
        if (reviewTextarea) {
            reviewTextarea.value = '🎤 Generated Review will appear here after voice processing...\n\nTap the microphone button above to start recording your review.';
            reviewTextarea.style.fontStyle = 'italic';
            reviewTextarea.style.opacity = '0.7';
        }
        
        modeIcon.textContent = '🎤';
        modeText.textContent = 'Current Mode: Voice';
        if (modeDescription) {
            modeDescription.textContent = '🎤 Record your voice to generate review from your spoken words';
        }
        toggleBtn.innerHTML = '<i class="fas fa-magic"></i> Switch to Auto Mode';
    } else {
        // Tag Mode
        tagWrapper.classList.remove('hidden');
        tagWrapper.style.maxHeight = 'none';
        tagWrapper.style.opacity = '1';
        if (voiceContainer) {
            voiceContainer.style.display = 'none';
        }
        
        // Show regenerate controls in Tag mode
        if (regenerateControls) {
            regenerateControls.style.display = 'block';
        }
                // Reset textarea style if it was placeholder
        if (reviewTextarea && reviewTextarea.style.fontStyle === 'italic') {
            reviewTextarea.style.fontStyle = 'normal';
            reviewTextarea.style.opacity = '1';
        }
                // Reset textarea style if it was placeholder
        if (reviewTextarea && reviewTextarea.style.fontStyle === 'italic') {
            reviewTextarea.style.fontStyle = 'normal';
            reviewTextarea.style.opacity = '1';
        }
        
        modeIcon.textContent = '🟢';
        modeText.textContent = 'Current Mode: Tag';
        if (modeDescription) {
            modeDescription.textContent = '🏷️ Select tags to customize your review';
        }
        toggleBtn.innerHTML = '<i class="fas fa-magic"></i> Switch to Auto Mode';
    }
}

// Apply mode with smooth transitions
function applyModeWithTransition(mode) {
    const tagWrapper = document.getElementById('tag-selection-wrapper');
    const modeIcon = document.getElementById('mode-status-icon');
    const modeText = document.getElementById('mode-status-text');
    const toggleBtn = document.getElementById('mode-toggle-btn');
    const tagWarning = document.getElementById('tag-warning');
    const container = document.querySelector('.client-info');
    
    if (!tagWrapper || !modeIcon || !modeText || !toggleBtn) {
        console.warn('Mode control elements not found');
        return;
    }
    
    // Add transition class
    tagWrapper.classList.add('transitioning');
    if (container) {
        container.classList.add('transitioning');
    }
    
    if (mode === MODES.AUTO) {
        // Switching to Auto Mode - Hide tags section
        tagWrapper.style.opacity = '0';
        tagWrapper.style.maxHeight = '0';
        
        if (tagWarning) {
            tagWarning.classList.add('d-none');
        }
        
        modeIcon.textContent = '🟣';
        modeText.textContent = 'Current Mode: Auto';        if (modeDescription) {
            modeDescription.textContent = 'Review will be auto-generated without tag selection';
        }        toggleBtn.innerHTML = '<i class="fas fa-tags"></i> Switch to Tag Mode';
        
        setTimeout(() => {
            tagWrapper.classList.add('hidden');
            tagWrapper.classList.remove('transitioning');
            if (container) {
                container.classList.remove('transitioning');
            }
        }, 300);
        
    } else {
        // Switching to Tag Mode - Show tags section
        tagWrapper.classList.remove('hidden');
        
        // Force reflow for animation
        tagWrapper.offsetHeight;
        
        requestAnimationFrame(() => {
            tagWrapper.style.maxHeight = 'none';
            tagWrapper.style.opacity = '1';
        });
        
        modeIcon.textContent = '🟢';
        modeText.textContent = 'Current Mode: Tag';
        toggleBtn.innerHTML = '<i class="fas fa-magic"></i> Switch to Auto Mode';
        
        // Check if we need to show warning
        setTimeout(() => {
            const selectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
            if (selectedCount < 3 && tagWarning) {
                tagWarning.classList.remove('d-none');
            }
        }, 50);
        
        setTimeout(() => {
            tagWrapper.classList.remove('transitioning');
            if (container) {
                container.classList.remove('transitioning');
            }
        }, 300);
    }
    
    // Optional: Container pulse effect
    if (container) {
        container.style.opacity = '0.7';
        setTimeout(() => {
            container.style.opacity = '1';
        }, 150);
    }
}

// Toggle between modes
function toggleMode(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('Toggle clicked. Current mode:', currentMode);
    const newMode = currentMode === MODES.AUTO ? MODES.TAG : MODES.AUTO;
    console.log('Switching to:', newMode);
    
    // Update current mode
    currentMode = newMode;
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    
    // Apply the new mode with smooth transitions
    applyModeWithTransition(newMode);
    
    console.log('Mode switched successfully to:', newMode);
}

// ========================================
// EXISTING FUNCTIONALITY
// ========================================

// Wait for DOM to be fully ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeExistingFunctionality();
});

function initializeExistingFunctionality() {
    // Copy button functionality
    const copyBtn = document.getElementById("copy-btn");
    if (!copyBtn) return;
    
    copyBtn.addEventListener("click", async function() {
    const button = this;
    const originalText = button.textContent;
    const textArea = document.getElementById("review-msg-content");
    const reviewText = textArea.value;
    const clientInfo = button.closest('.client-info');
    const reviewLink = clientInfo ? clientInfo.getAttribute('data-review-link') : null;

    console.log('Copy button clicked');
    console.log('Review Link:', reviewLink);

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(reviewText);
            button.textContent = "Copied!";
        } else {
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = reviewText;
            tempTextArea.style.position = "fixed";
            tempTextArea.style.left = "-999999px";
            tempTextArea.style.top = "-999999px";
            document.body.appendChild(tempTextArea);
            tempTextArea.focus();
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            button.textContent = "Copied!";
        }

        button.classList.add('copy-success');

        // Redirect to review link after 1.5 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copy-success');
            
            // Open review link if available
            if (reviewLink && reviewLink.trim() !== '') {
                console.log('Opening review link:', reviewLink);
                const newWindow = window.open(reviewLink, '_blank');
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    // Popup blocked, try location.assign
                    console.log('Popup blocked, using location.assign');
                    window.location.assign(reviewLink);
                }
            } else {
                console.warn('No review link found!');
                alert('Review copied! Please paste it on your Google review page.');
            }
        }, 1500);

    } catch (err) {
        console.error("Copy failed:", err);
        button.textContent = "Error!";
        button.style.backgroundColor = "#dc3545";

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = "";
        }, 1500);
    }
    }); // End of copyBtn addEventListener

    // Touch feedback for all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    }); // End of buttons forEach

    // Regenerate button functionality
    document.querySelectorAll(".regenerate-btn").forEach(button => {
    let selectedLength = 'medium';

    // Length button selection (unchanged)
    document.querySelectorAll('.length-btn').forEach(lengthBtn => {
        lengthBtn.addEventListener('click', function() {
            document.querySelectorAll('.length-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            selectedLength = this.dataset.length;
        });
    });

    document.querySelector('.length-btn[data-length="medium"]').classList.add('active');

    button.addEventListener("click", function() {
        let clientId = this.dataset.clientId;
        let selectedTags = [];
        
        // MODE-BASED TAG HANDLING
        if (currentMode === MODES.TAG) {
            // Tag Mode: Collect selected tags
            selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
                .map(checkbox => checkbox.value.trim());

            // Validate minimum 3 tags
            if (selectedTags.length < 3) {
                document.getElementById('tag-warning').classList.remove('d-none');
                return;
            }
            document.getElementById('tag-warning').classList.add('d-none');
        } else {
            // Auto Mode: Use all available tags or send empty array
            selectedTags = Array.from(document.querySelectorAll('.tag-checkbox'))
                .map(checkbox => checkbox.value.trim())
                .slice(0, 5); // Use first 5 tags as default
        }

        // Disable button & show loading
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Regenerating...';

        // API Call (using existing endpoint)
        fetch(`/user/regenerate/${clientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedTags: selectedTags,
                reviewLength: selectedLength
            })
        })
        .then(response => {
            const clonedResponse = response.clone();

            if (!response.ok) {
                return clonedResponse.json().then(err => {
                    console.error("Server Error (JSON):", err);
                    throw new Error(err.message || "Server returned an error");
                }).catch(() => {
                    return clonedResponse.text().then(textErr => {
                        console.error("Server Error (Text):", textErr);
                        throw new Error(textErr || "Server returned an error");
                    });
                });
            } else {
                return response.text().then(newReview => {
                    document.getElementById("review-msg-content").value = newReview;
                });
            }
        })
        .catch(error => {
            console.error("Fetch or processing error:", error);
            alert("Error: " + error.message);
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Regenerate Review';
        });
    });
    }); // End of regenerate-btn forEach

    // Tag checkbox functionality
    document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const selectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
        const tagItem = this.closest('.tag-item');

        // Update warning visibility
        const warningElement = document.getElementById('tag-warning');
        if (selectedCount >= 3) {
            warningElement.classList.add('d-none');
        } else if (selectedCount > 0) {
            warningElement.classList.remove('d-none');
        }

        // Handle tag selection and reordering
        if (this.checked) {
            tagItem.classList.add('selected');
            const container = document.querySelector('.tags-container');
            const tagRect = tagItem.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            if (tagRect.top > containerRect.bottom) {
                tagItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            tagItem.classList.remove('selected');
        }

        // Add ripple effect on click
        const label = this.nextElementSibling;
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        label.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    });

    // Enhanced mobile touch handling for individual tags
    const label = checkbox.nextElementSibling;
    if (label) {
        let touchStartTime = 0;
        
        label.addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        label.addEventListener('touchend', function(e) {
            const touchDuration = Date.now() - touchStartTime;
            
            // Only treat as click if touch was brief (not a scroll)
            if (touchDuration < 200) {
                // Visual feedback
                this.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.transition = '';
                }, 150);
            } else {
                // Reset without click
                this.style.transform = '';
                this.style.transition = '';
            }
        }, { passive: true });
        
        label.addEventListener('touchcancel', function(e) {
            this.style.transform = '';
            this.style.transition = '';
        }, { passive: true });
    }
    }); // End of tag-checkbox forEach

    // Form label hover effects
    document.querySelectorAll('.form-check-label').forEach(label => {
    label.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    label.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    }); // End of form-check-label forEach

    // Initialize selected tags count
    const initialSelectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
    if (initialSelectedCount > 0) {
        document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            checkbox.closest('.tag-item').classList.add('selected');
        });

        // Hide warning if we have enough selected tags
        if (initialSelectedCount >= 3) {
            document.getElementById('tag-warning').classList.add('d-none');
        }
    }

    console.log(`Initialized with ${initialSelectedCount} pre-selected tags`);

    // Enhanced mobile scrolling for tags container
    const tagsContainer = document.querySelector('.tags-container');
    if (tagsContainer) {
        let isScrolling = false;
        let scrollTimeout;

        // Enhance touch handling for better mobile scrolling
        tagsContainer.addEventListener('touchstart', function(e) {
            isScrolling = false;
            clearTimeout(scrollTimeout);
        }, { passive: true });

        tagsContainer.addEventListener('touchmove', function(e) {
            isScrolling = true;
            
            // Clear any existing timeout
            clearTimeout(scrollTimeout);
            
            // Add a visual indicator that we're in scroll mode
            this.style.borderColor = 'var(--primary-color)';
            
            // Reset border color after scrolling stops
            scrollTimeout = setTimeout(() => {
                this.style.borderColor = 'transparent';
            }, 150);
        }, { passive: true });

        tagsContainer.addEventListener('touchend', function(e) {
            clearTimeout(scrollTimeout);
            
            // Reset border color
            setTimeout(() => {
                this.style.borderColor = 'transparent';
            }, 300);
        }, { passive: true });

        // Prevent page scroll when scrolling within tags container
        tagsContainer.addEventListener('wheel', function(e) {
            const atTop = this.scrollTop === 0;
            const atBottom = this.scrollTop >= (this.scrollHeight - this.clientHeight);
            
            // Only prevent default if we're not at the boundaries
            if (!atTop && !atBottom) {
                e.stopPropagation();
            } else if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.stopPropagation();
            }
        }, { passive: false });

        // Add momentum scrolling indicator
        let momentumIndicator = null;
        tagsContainer.addEventListener('scroll', function() {
            // Show scroll indicator
            if (!momentumIndicator) {
                momentumIndicator = document.createElement('div');
                momentumIndicator.style.cssText = `
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 30px;
                    background: var(--primary-color);
                    border-radius: 2px;
                    opacity: 0.6;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 10;
                `;
                this.style.position = 'relative';
                this.appendChild(momentumIndicator);
            }

            // Hide indicator after scrolling stops
            clearTimeout(this.scrollTimer);
            momentumIndicator.style.opacity = '0.6';
            
            this.scrollTimer = setTimeout(() => {
                if (momentumIndicator) {
                    momentumIndicator.style.opacity = '0';
                }
            }, 1000);
        });
    }

    // Enhanced tag selection for mobile
    const tagSelection = document.querySelector('.tag-selection');
    if (tagSelection) {
        // Add expanded touch area around tags container
        tagSelection.addEventListener('touchstart', function(e) {
            const tagsContainer = this.querySelector('.tags-container');
            if (tagsContainer) {
                const rect = tagsContainer.getBoundingClientRect();
                const touch = e.touches[0];
                
                // Expand the effective touch area by 20px on all sides
                const expandedRect = {
                    left: rect.left - 20,
                    right: rect.right + 20,
                    top: rect.top - 20,
                    bottom: rect.bottom + 20
                };
                
                // If touch is in the expanded area, focus the container
                if (touch.clientX >= expandedRect.left && 
                    touch.clientX <= expandedRect.right &&
                    touch.clientY >= expandedRect.top && 
                    touch.clientY <= expandedRect.bottom) {
                    
                    // Visually indicate the container is active
                    tagsContainer.style.background = 'rgba(79, 70, 229, 0.02)';
                    tagsContainer.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                    
                    // Reset after touch ends
                    setTimeout(() => {
                        tagsContainer.style.background = '';
                        tagsContainer.style.borderColor = 'transparent';
                    }, 200);
                }
            }
        }, { passive: true });
    }
} // End of initializeExistingFunctionality