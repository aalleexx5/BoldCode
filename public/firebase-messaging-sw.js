importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAlgl_5ww2V01BR_aQqPSzjprqVxzzP3WY",
  authDomain: "job-tracker-6df94.firebaseapp.com",
  projectId: "job-tracker-6df94",
  storageBucket: "job-tracker-6df94.firebasestorage.app",
  messagingSenderId: "221811935787",
  appId: "1:221811935787:web:65e5e589c050bd72cef86e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
