document.getElementById("copy-btn").addEventListener("click", async function() {
    const button = this;
    const originalText = button.textContent;
    const textArea = document.getElementById("review-msg-content");
    const reviewText = textArea.value;
    const clientInfo = button.closest('.client-info');
    const reviewLink = clientInfo.getAttribute('data-review-link');

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

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copy-success');
            if (reviewLink) {
                window.open(reviewLink, '_blank') || window.location.assign(reviewLink);
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
});

const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });

    button.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});

document.querySelectorAll(".regenerate-btn").forEach(button => {
    let selectedLength = 'medium';

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
        const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
            .map(checkbox => checkbox.value.trim());

        if (selectedTags.length < 3) {
            document.getElementById('tag-warning').classList.remove('d-none');
            return;
        }

        document.getElementById('tag-warning').classList.add('d-none');

        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Regenerating...';

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
});

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
});

document.querySelectorAll('.form-check-label').forEach(label => {
    label.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    label.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Initialize selected tags on page load
document.addEventListener('DOMContentLoaded', function() {
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
});