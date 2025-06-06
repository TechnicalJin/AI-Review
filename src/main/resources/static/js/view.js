 document.getElementById("copy-btn").addEventListener("click", async function() {
        const button = this;
        const originalText = button.textContent;
        const textArea = document.getElementById("review-msg-content");
        const reviewText = textArea.value;
        const clientInfo = button.closest('.client-info');
        const reviewLink = clientInfo.getAttribute('data-review-link'); // We'll get the link from a data attribute

        try {
            // For modern browsers
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(reviewText);
                button.textContent = "Copied!";
            }
            // Fallback for older browsers and mobile
            else {
                // Create temporary textarea
                const tempTextArea = document.createElement("textarea");
                tempTextArea.value = reviewText;
                tempTextArea.style.position = "fixed";
                tempTextArea.style.left = "-999999px";
                tempTextArea.style.top = "-999999px";
                document.body.appendChild(tempTextArea);

                // Select and copy
                tempTextArea.focus();
                tempTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextArea);
                button.textContent = "Copied!";
            }

            // Add success animation
            button.classList.add('copy-success');

            // Reset button and redirect after delay
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copy-success');

                // Check if review link exists and redirect
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

    // Add visual feedback for button press
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
        // Add variable to store selected length
        let selectedLength = 'medium'; // default length

        // Add click handlers for length buttons
        document.querySelectorAll('.length-btn').forEach(lengthBtn => {
            lengthBtn.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.length-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
                selectedLength = this.dataset.length;
            });
        });

        // Set medium as default active
        document.querySelector('.length-btn[data-length="medium"]').classList.add('active');

        button.addEventListener("click", function() {
            let clientId = this.dataset.clientId;

            // Get selected tags
            const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
                .map(checkbox => checkbox.value);

            // Check if at least 3 tags are selected
            if (selectedTags.length < 3) {
                document.getElementById('tag-warning').classList.remove('d-none');
                return;
            }

            document.getElementById('tag-warning').classList.add('d-none');

            // Add loading state
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
                // Reset button state
                button.disabled = false;
                button.innerHTML = 'Regenerate Review';
            });
        });
    });

    // Add tag selection visual feedback
    document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
            const tagsCounter = document.querySelector('.tags-counter');
            const tagItem = this.closest('.tag-item');

            // Update counter
            tagsCounter.textContent = `${selectedCount} selected`;
            tagsCounter.classList.toggle('visible', selectedCount > 0);

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
                // Smooth scroll to top of container if tag is below the visible area
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

            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 1000);
        });
    });

    // Add hover effect for tags
    document.querySelectorAll('.form-check-label').forEach(label => {
        label.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        label.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Initialize counter if there are pre-selected tags
    const initialSelectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
    if (initialSelectedCount > 0) {
        const tagsCounter = document.querySelector('.tags-counter');
        tagsCounter.textContent = `${initialSelectedCount} selected`;
        tagsCounter.classList.add('visible');

        // Set initial selected state for tags
        document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            checkbox.closest('.tag-item').classList.add('selected');
        });
    }