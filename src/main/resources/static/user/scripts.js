function validateForm() {
    let isValid = true;

    // Email validation
    const emailInput = document.querySelector('input[type="email"]');
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = "Invalid email address.";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    // Mobile validation
    const mobileInput = document.getElementById('mobile');
    const mobileError = document.getElementById('mobileError');
    const mobileRegex = /^\d{10}$/;

    if (!mobileRegex.test(mobileInput.value.trim())) {
        mobileError.textContent = "Enter a valid 10-digit mobile number.";
        isValid = false;
    } else {
        mobileError.textContent = "";
    }

     // Review Link
    let reviewLink = document.getElementById("reviewLink").value;
            if (reviewLink.trim() === "") {
                document.getElementById("reviewLinkError").textContent = "Review Link is required.";
                isValid = false;
            } else if (!isValidURL(reviewLink)) { // Custom validation function
                document.getElementById("reviewLinkError").textContent = "Invalid Review Link format.";
                isValid = false;
            } else {
                document.getElementById("reviewLinkError").textContent = ""; // Clear error
            }

    /*// Review Character Limit Validation
    const reviewCharLimitInput = document.querySelector('input[name="reviewCharLimit"]');
    let reviewCharLimitError = document.getElementById("reviewCharLimitError");

    if (!reviewCharLimitError) {
        reviewCharLimitError = document.createElement("p");
        reviewCharLimitError.id = "reviewCharLimitError";  // Assign a unique ID
        reviewCharLimitError.classList.add("text-danger");
        reviewCharLimitInput.parentNode.appendChild(reviewCharLimitError);
    }


    const reviewCharLimitValue = parseInt(reviewCharLimitInput.value.trim());

    if (isNaN(reviewCharLimitValue) || reviewCharLimitValue < 10 || reviewCharLimitValue > 1000) {
        reviewCharLimitError.textContent = "Review Character Limit must be between 10 and 1000.";
        isValid = false;
    } else {
        reviewCharLimitError.textContent = "";
    }*/


    // Logo validation
    const logoInput = document.querySelector('input[type="file"]');
    const logoError = document.getElementById('logoError');
    const allowedTypes = ["image/jpeg", "image/png"];

    if (logoInput.files.length === 0 || !allowedTypes.includes(logoInput.files[0].type)) {
        logoError.textContent = "Only JPEG or PNG formats are allowed.";
        isValid = false;
    } else {
        logoError.textContent = "";
    }

    // Tags validation
    const tagsInput = document.getElementById("tagsInput");
    const chatTextError = document.getElementById("chatTextError");

    const tagArray = tagsInput.value.trim().split(",").filter(tag => tag.trim() !== "");

    if (tagArray.length < 10) {
        chatTextError.textContent = "You must add at least 10 tags.";
        isValid = false;
    } else {
        chatTextError.textContent = "";
    }

    return isValid;
}

// Tag Management
const tagSet = new Set();

function addTag() {
    const input = document.getElementById("chatTextInput");
    const tagsInput = document.getElementById("tagsInput");
    const chatTextError = document.getElementById("chatTextError");

    let tagValue = input.value.trim();
    if (tagValue !== "" && !tagSet.has(tagValue)) {
        tagSet.add(tagValue);
        tagsInput.value = Array.from(tagSet).join(", ");
        input.value = "";

        updateDisplayedTags();
        chatTextError.textContent = "";
    } else if (tagSet.has(tagValue)) {
        alert("This tag has already been added!");
    }
}

// Update the displayed tags
function updateDisplayedTags() {
    const selectedTagsDiv = document.querySelector('.selected-tags');
    selectedTagsDiv.innerHTML = "<h5>Selected Tags</h5>";

    if (tagSet.size === 0) {
        selectedTagsDiv.innerHTML += "<p>No tags added yet.</p>";
        return;
    }

    tagSet.forEach(tag => {
        let tagSpan = document.createElement('span');
        tagSpan.classList.add('tag');
        tagSpan.textContent = tag;

        let closeIcon = document.createElement('span');
        closeIcon.classList.add('close-icon');
        closeIcon.innerHTML = "&times;";
        closeIcon.onclick = function () {
            removeTag(tag);
        };

        tagSpan.appendChild(closeIcon);
        selectedTagsDiv.appendChild(tagSpan);
    });
}

// Remove tag
function removeTag(tagToRemove) {
    tagSet.delete(tagToRemove);
    document.getElementById("tagsInput").value = Array.from(tagSet).join(", ");
    updateDisplayedTags();
}

// Generate Client Link
function generateClientLink() {
    let clientIdElement = document.getElementById("clientId");
    let generateLinkInput = document.getElementById("generateLink");

    if (!clientIdElement || !clientIdElement.value.trim()) {
        alert("Please save the client first before generating a link.");
        return;
    }

    let clientId = clientIdElement.value;
    let uniqueLink = window.location.origin + "/clients/view/" + clientId;

    generateLinkInput.value = uniqueLink;
}

// Copy to Clipboard
function copyToClipboard() {
    let linkInput = document.getElementById("generateLink");
    if (linkInput.value === "") {
        alert("No link generated yet.");
        return;
    }

    navigator.clipboard.writeText(linkInput.value).then(() => {
        alert("Link copied: " + linkInput.value);
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

// Initialize displayed tags when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const tagsInput = document.getElementById("tagsInput");
    if (tagsInput.value.trim()) {
        initializeTags(tagsInput.value);
    }
});

function initializeTags(existingTags) {
    existingTags.split(',').forEach(tag => {
        let trimmedTag = tag.trim();
        if (trimmedTag) {
            tagSet.add(trimmedTag);
        }
    });
    updateDisplayedTags();
}

function isValidURL(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

function submitForm() {
    if (validateForm()) {
        document.getElementById("clientForm").submit();
    }
}