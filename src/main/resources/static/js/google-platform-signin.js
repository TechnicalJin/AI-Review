(function () {
    function getElement(id) {
        return document.getElementById(id);
    }

    function updateProfile(profile) {
        var card = getElement('googleProfileCard');
        var name = getElement('googleProfileName');
        var email = getElement('googleProfileEmail');
        var id = getElement('googleProfileId');
        var image = getElement('googleProfileImage');
        var signOutLink = getElement('googleSignOutLink');

        if (!card || !name || !email || !id || !image || !signOutLink) {
            return;
        }

        if (!profile) {
            card.classList.add('hidden');
            signOutLink.classList.add('hidden');
            name.textContent = 'Not signed in';
            email.textContent = '';
            id.textContent = '';
            image.src = '';
            image.classList.add('hidden');
            return;
        }

        name.textContent = profile.getName() || 'Signed in with Google';
        email.textContent = profile.getEmail() || '';
        id.textContent = profile.getId() ? 'Google ID: ' + profile.getId() : '';

        var imageUrl = profile.getImageUrl();
        if (imageUrl) {
            image.src = imageUrl;
            image.classList.remove('hidden');
        } else {
            image.src = '';
            image.classList.add('hidden');
        }

        card.classList.remove('hidden');
        signOutLink.classList.remove('hidden');
    }

    function getClientId() {
        var meta = document.querySelector('meta[name="google-signin-client_id"]');
        return meta ? meta.getAttribute('content') : '';
    }

    function initializeGoogleAuth(retriesLeft) {
        if (!window.gapi || !window.gapi.load) {
            if (retriesLeft > 0) {
                window.setTimeout(function () {
                    initializeGoogleAuth(retriesLeft - 1);
                }, 250);
            }
            return;
        }

        window.gapi.load('auth2', function () {
            var clientId = getClientId();
            if (!clientId) {
                return;
            }

            var authInstance = window.gapi.auth2.getAuthInstance();
            if (!authInstance) {
                window.gapi.auth2.init({ client_id: clientId });
            }
        });
    }

    window.onSignIn = function (googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
        updateProfile(profile);
    };

    window.signOut = function () {
        if (!window.gapi || !window.gapi.auth2) {
            updateProfile(null);
            return;
        }

        var auth2 = window.gapi.auth2.getAuthInstance();
        if (!auth2) {
            updateProfile(null);
            return;
        }

        auth2.signOut().then(function () {
            console.log('User signed out.');
            updateProfile(null);
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initializeGoogleAuth(20);
    });
})();