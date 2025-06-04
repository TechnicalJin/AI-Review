function validateForm() {
    let isValid = true;

    const emailInput = document.querySelector('input[type="email"]');
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        emailError.textContent = "Invalid email address.";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    const mobileInput = document.querySelector('input[th\\:field="*{mobile}"]');
    const mobileError = document.getElementById('mobileError');
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileInput.value)) {
        mobileError.textContent = "Enter a 10-digit mobile number.";
        isValid = false;
    } else {
        mobileError.textContent = "";
    }

    const logoInput = document.querySelector('input[type="file"]');
    const logoError = document.getElementById('logoError');
    const allowedTypes = ["image/jpeg", "image/png"];
    if (logoInput.files.length > 0 && !allowedTypes.includes(logoInput.files[0].type)) {
        logoError.textContent = "JPEG or PNG only.";
        isValid = false;
    } else {
        logoError.textContent = "";
    }

    const selectedTags = document.querySelector('.selected-tags');
    const chatTextError = document.getElementById('chatTextError');

    if (selectedTags.children.length <= 1) {
        chatTextError.textContent = "At least one tag is required.";
        isValid = false;
    } else {
        chatTextError.textContent = "";
    }

    return isValid;
}

const tagSet = new Set();

function addTag() {
    const input = document.getElementById("chatTextInput");
    const tagText = input.value.trim();
    const chatTextError = document.getElementById("chatTextError");

    if (tagText !== "" && !tagSet.has(tagText)) {
        createTag(tagText);
        tagSet.add(tagText);
        input.value = "";
        document.getElementById("tagsInput").value = Array.from(tagSet).join(", ");
        chatTextError.textContent = "";
    } else if (tagSet.has(tagText)) {
        alert("This tag has already been added!");
    }
}

function createTag(tagText) {
    const selectedTag = document.createElement('div');
    selectedTag.classList.add('badge', 'bg-primary', 'me-2', 'mb-2');
    selectedTag.textContent = tagText;

    const closeIcon = document.createElement('span');
    closeIcon.classList.add('ms-2', 'text-white', 'cursor-pointer');
    closeIcon.innerHTML = '&times;';
    closeIcon.onclick = function() { removeTag(tagText, selectedTag); };

    selectedTag.appendChild(closeIcon);
    document.querySelector('.selected-tags').appendChild(selectedTag);
}

function removeTag(tagText, selectedTag) {
    selectedTag.remove();
    tagSet.delete(tagText);
    document.getElementById("tagsInput").value = Array.from(tagSet).join(", ");
}

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

window.addEventListener('DOMContentLoaded', () => {
    updateDisplayedTags();
});
