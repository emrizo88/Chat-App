# 💬 Chat App

Aplicación de chat en tiempo real con videollamadas, construida con Node.js, Socket.io y WebRTC. Inspirada en Discord.

## 🌐 Demo

[chat-app-fl44.onrender.com](https://chat-app-fl44.onrender.com)

---

## ✨ Funcionalidades

- **Chat en tiempo real** — mensajes instantáneos con Socket.io
- **Rooms** — salas de chat separadas, crea las tuyas con un click
- **Videollamadas** — video y audio peer-to-peer con WebRTC
- **Historial de mensajes** — los mensajes se guardan en base de datos
- **Autenticación** — registro e inicio de sesión con contraseñas hasheadas
- **Notificaciones** — aviso cuando alguien entra o sale de la sala
- **Lista de usuarios** — ve quién está conectado en cada sala

---

## 🛠️ Stack

- **Backend** — Node.js, Express
- **Tiempo real** — Socket.io (WebSockets)
- **Video/Audio** — WebRTC
- **Base de datos** — SQLite con better-sqlite3
- **Autenticación** — express-session, bcrypt
- **Frontend** — HTML, CSS, Bootstrap 5
- **Deploy** — Render

---

## 📁 Estructura del proyecto

```
chat-app/
├── server.js        # Servidor Express + Socket.io + señalización WebRTC
├── database.js      # Funciones de base de datos SQLite
├── package.json
│
└── public/
    ├── login.html
    ├── register.html
    ├── chat.html    # App principal — rooms, mensajes y video
    └── style.css
```

---

## 🗄️ Base de datos

El proyecto usa SQLite con las siguientes tablas:

- `users` — usuarios registrados con contraseñas hasheadas
- `rooms` — salas de chat con creador y fecha
- `mensajes` — historial de mensajes por sala
- `room_usuarios` — relación muchos a muchos entre usuarios y salas

---

## ⚡ Cómo funciona WebRTC

El servidor actúa como señalizador — solo retransmite la negociación inicial entre los peers:

```
Cliente A → oferta  → Servidor → Cliente B
Cliente B → respuesta → Servidor → Cliente A
Ambos intercambian ICE candidates
Video/Audio fluye directo A ↔ B (peer-to-peer)
```

---

## 🚀 Instalación local

```bash
# Clona el repositorio
git clone https://github.com/emrizo88/Chat-App.git
cd Chat-App/chat-app

# Instala dependencias
npm install

# Corre el servidor
node server.js
```

Abre `http://localhost:3000` en tu navegador.

> **Nota:** Para videollamadas entre dispositivos necesitas HTTPS. Usa [ngrok](https://ngrok.com) o genera certificados locales con [mkcert](https://github.com/FiloSottile/mkcert).

---

## 👤 Autor

**Emilio Rizo**
GitHub: [@emrizo88](https://github.com/emrizo88)
