 
# 💬 CBNK Chat App

### Real-Time Messaging. Seamless Communication. Connected Everywhere.

A modern, full-stack real-time chat application built with **React, Vite, Node.js, Express, MongoDB, and Socket.IO**. CBNK Chat provides instant messaging, media sharing, online presence, and real-time audio/video calling through WebRTC.

<!-- Replace these links with your actual GitHub repository details -->

<p align="center">
  <img src="https://img.shields.io/badge/Project-CBNK%20Chat-blue?style=for-the-badge" alt="CBNK Chat"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socketdotio" alt="Socket.IO"/>
</p>

---

## 📌 About The Project

**CBNK Chat App** is a full-stack communication platform designed to make online conversations simple, fast, and interactive.

Users can communicate in real time, share images and videos, see online availability, and connect through audio and video calls.

The application uses Socket.IO for real-time communication, WebRTC for peer-to-peer calling, MongoDB for persistent data storage, and Cloudinary for media storage.

The project follows a modular frontend and backend architecture to make it maintainable, scalable, and easier to extend with new features.

## ✨ Features

### 🔐 Authentication & Security
- User registration and login.
- Secure password handling.
- Cookie-based authentication.
- Access token and refresh token workflow.
- Protected API routes.
- User profile retrieval.
- Automatic token refresh.

### 💬 Real-Time Messaging
- Instant one-to-one messaging.
- Real-time message delivery using Socket.IO.
- Persistent message storage.
- Message editing and deletion.
- Message delivery status.
- Message seen status.
- Typing indicators.
- Conversation history.

### 🖼️ Image & Video Sharing
- Send images in conversations.
- Send videos in conversations.
- Add captions to media messages.
- Image and video previews.
- Full-screen image viewing.
- In-chat video playback.
- Upload progress indication.
- Media storage through Cloudinary.
- Download shared media.

### 📞 Audio & Video Calling
- Real-time audio calling.
- Real-time video calling.
- Incoming call notifications.
- Accept and reject calls.
- End active calls.
- Microphone mute/unmute.
- Camera on/off.
- Call duration timer.
- Connection and reconnection handling.
- Network quality monitoring.
- STUN/TURN server support for connectivity across different networks.

### 🟢 Online Presence
- Real-time online user status.
- Last-seen information.
- Socket-based connection tracking.
- Online user updates.

### 📱 Responsive Interface
- Modern chat interface.
- Responsive conversation sidebar.
- Mobile-friendly call interface.
- Reusable React components.
- Toast notifications.
- Loading and error states.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend development and build |
| Redux Toolkit | Global state management |
| React Router | Application routing |
| Axios | HTTP requests |
| Socket.IO Client | Real-time communication |
| Tailwind CSS | UI styling |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| WebRTC | Audio/video communication |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | Database modeling |
| Socket.IO | Real-time events |
| JWT | Token-based authentication |
| Cookie Parser | Cookie handling |
| Multer | File upload handling |
| Cloudinary | Image and video storage |
| WebRTC / ICE | Peer-to-peer connectivity |

---

## 🏗️ Project Architecture

CBNK Chat follows a separate frontend and backend architecture.

```text
                 CBNK CHAT APP
                       |
          +------------+------------+
          |                         |
       FRONTEND                  BACKEND
          |                         |
     React + Vite              Node.js
          |                         |
     Redux Toolkit             Express.js
          |                         |
     React Router              REST APIs
          |                         |
     Axios API Client          Socket.IO
          |                         |
          +------------+------------+
                       |
              +--------+--------+
              |        |        |
           MongoDB  Cloudinary WebRTC
           Database   Media    Calling
                      Storage
```

### Communication Flow

- REST APIs handle authentication, conversations, messages, and media uploads.
- Socket.IO handles real-time messaging, typing indicators, online presence, and call signaling.
- WebRTC establishes audio/video communication between users.
- MongoDB stores user, conversation, and message information.
- Cloudinary stores uploaded media files.

---

## 📂 Project Structure

```text
CBNK-CHAT-APP/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │
│   │   ├── components/
│   │   │   └── chat/
│   │   │       ├── calling/
│   │   │       ├── composer/
│   │   │       ├── header/
│   │   │       └── messages/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── media/
│   │   │   ├── constants/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   ├── utils/
│   │   └── app.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

*Note: This is a representative structure. Your actual repository may contain additional files and modules.*

---

## ⚙️ Installation & Setup

Follow these steps to run CBNK Chat locally.

### 1. Prerequisites

Install the following:

- Node.js
- npm
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account
- Git

### 2. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate into the project:

```bash
cd chat-app
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Configure the environment variables according to your backend configuration:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:5173

# Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the exact variable names expected by `backend/src/config/env.js` if they differ from this example.

Start the backend:

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api/v1

# WebRTC STUN/TURN Configuration
VITE_TURN_URLS=your_turn_server_urls
VITE_TURN_USERNAME=your_turn_username
VITE_TURN_CREDENTIAL=your_turn_credential
```

For local testing, the application can use a STUN server. For reliable calling across restrictive networks, configure valid TURN credentials.

Start the frontend:

```bash
npm run dev
```

Frontend development server:

```text
http://localhost:5173
```

### 5. Open the Application

Visit:

```text
http://localhost:5173
```

Register a new account, log in, and start chatting!

---

## 🔌 API Overview

The backend exposes REST API endpoints under:

```text
/api/v1
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh authentication |
| GET | `/users/me` | Get current user profile |

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | Get user conversations |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| POST | `/messages` | Send a text message |
| GET | `/messages/:receiverId` | Get conversation messages |
| PATCH | `/messages/:messageId/delivered` | Mark message delivered |
| PATCH | `/messages/:messageId/seen` | Mark message seen |
| PUT | `/messages/:id` | Edit message |
| DELETE | `/messages/:id` | Delete message |

### Media

| Method | Endpoint | Description |
|---|---|---|
| POST | `/media/messages` | Upload and send image/video |

The media endpoint accepts `multipart/form-data` with the following fields:

| Field | Type | Description |
|---|---|---|
| `receiverId` | String | Recipient user ID |
| `caption` | String | Optional media caption |
| `file` | File | Image or video |

### Socket.IO Events

The application uses Socket.IO for real-time events.

Examples include:

- `send-message`
- `message-sent`
- `receive-message`
- Typing indicators
- Online user updates
- Calling events
- ICE candidate exchange
- Call acceptance, rejection, and termination

Calling events are handled through the application's dedicated socket event definitions.

---

## 📞 WebRTC Calling Configuration

CBNK Chat uses WebRTC for real-time audio and video communication.

For connectivity across different networks, configure STUN/TURN servers.

Example STUN server:

```text
stun:stun.l.google.com:19302
```

TURN credentials can be obtained from a TURN service provider.

The frontend environment variables are:

```env
VITE_TURN_URLS=
VITE_TURN_USERNAME=
VITE_TURN_CREDENTIAL=
```

**Important:**
- Camera and microphone access require a secure context (HTTPS) in production.
- `localhost` is generally allowed for development.
- TURN credentials should be kept private.
- Production deployments should use valid TURN configuration and HTTPS.

---

## 🖼️ Screenshots

Screenshots and demonstrations can be added here to showcase the application.

| Feature | Screenshot |
|---|---|
| Login Page | Add screenshot |
| Registration Page | Add screenshot |
| Chat Interface | Add screenshot |
| Image & Video Sharing | Add screenshot |
| Audio & Video Calling | Add screenshot |
| Mobile Interface | Add screenshot |

Example:

```md
![Chat Interface](./screenshots/chat-interface.png)
```

---

## 🔒 Security Considerations

- Protected backend routes.
- Cookie-based authentication.
- Access and refresh token handling.
- Password hashing.
- Input validation.
- Media MIME type validation.
- File size restrictions.
- Authenticated media upload.
- Environment-based secret management.

Never commit `.env` files, API secrets, access tokens, refresh tokens, or TURN credentials to GitHub.

---

## 🚀 Future Improvements

Potential features for future development:

- Group conversations.
- Group audio/video calling.
- Voice messages.
- File and document sharing.
- Message reactions.
- Reply and forward messages.
- Message search.
- Push notifications.
- User profile customization.
- End-to-end encryption.
- Message pinning.
- Chat backup and restore.
- Desktop application support.
- Advanced media management.

---

## 🤝 Contributing

Contributions, ideas, and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes.

```bash
git commit -m "Add: your feature description"
```

4. Push your branch.

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request.

---

## 📄 License

This project is currently maintained as a personal development project.

If you plan to distribute or reuse it, add an appropriate license file to the repository.

---

## 👨‍💻 Author

**CBNK Chat App**

Built with ❤️ using React, Node.js, MongoDB, Socket.IO, and WebRTC.

---

<p align="center">
  <strong>CBNK Chat — Connect. Communicate. Collaborate.</strong>
  <br/>
  <sub>Making real-time communication simple and accessible.</sub>
</p>
