self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon.png", // Add an icon file to your public folder
    badge: "/badge.png", // Add a badge file to your public folder
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
