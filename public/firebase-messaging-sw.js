importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// This will be replaced by the build process or can be hardcoded if needed
// For AI Studio, we can try to fetch the config or just use the one from the app
firebase.initializeApp({
  apiKey: "AIzaSyA0THDQxk_pVWNicYwjylXxzwqfgwkRnY8",
  authDomain: "gen-lang-client-0045993780.firebaseapp.com",
  projectId: "gen-lang-client-0045993780",
  storageBucket: "gen-lang-client-0045993780.firebasestorage.app",
  messagingSenderId: "413157939",
  appId: "1:413157939:web:e6902271e3241fd9c67146"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Adjust to your logo path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
