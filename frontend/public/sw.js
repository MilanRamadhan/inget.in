self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }

  const noteId = payload.noteId || 'general'
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Pengingat inget.in', {
      body: payload.body || 'Ada catatan yang perlu kamu ingat.',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `ingetin-reminder-${noteId}`,
      renotify: false,
      data: { url: payload.url || '/dashboard' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) => client.url.startsWith(self.location.origin))
        if (existing) {
          return existing.navigate(targetUrl).then(() => existing.focus())
        }
        return self.clients.openWindow(targetUrl)
      }),
  )
})
