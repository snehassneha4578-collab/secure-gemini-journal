# 🚀 Personal Gemini Journal — Secure Gemini AI Journal

<p align="center">
  <img src="https://img.shields.io/badge/AI-Gemini-blueviolet?style=for-the-badge&logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/Firebase-Authentication-orange?style=for-the-badge&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Firestore-Database-yellow?style=for-the-badge&logo=firebase" alt="Firestore">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-REST_API-black?style=for-the-badge&logo=express" alt="Express">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Deployment-Firebase_Hosting-orange?style=flat-square&logo=firebase">
  <img src="https://img.shields.io/badge/Backend-Render-purple?style=flat-square&logo=render">
  <img src="https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-blue?style=flat-square">
  <img src="https://img.shields.io/badge/License-Educational-lightgrey?style=flat-square">
</p>

> 🔐 **A secure, AI-powered personal journal combining Google Gemini, Firebase Authentication, Cloud Firestore, and a Node.js backend for private, persistent, multi-turn AI conversations.**

---

## 🌐 Live Application

### 🎨 Frontend

**Firebase Hosting:**
https://gemini-journal-8a53a.web.app

### ⚙️ Backend API

**Render:**
https://secure-gemini-journal-tjdq.onrender.com

---

## 🎯 Project Overview

**Personal Gemini Journal** is a productivity and reflection assistant designed to provide users with a private digital space for:

* 🤖 AI-assisted journaling
* 🧠 Personal reflection
* 💡 Brainstorming
* 📚 Study planning
* ⏱️ Productivity planning
* 🔄 Multi-turn conversations
* ☁️ Persistent journal storage

Each authenticated user's journal data is isolated using their **Firebase Authentication UID**.

---

# ✨ Features

## 🔐 Secure Authentication

* 🔥 Firebase Authentication
* 📧 Email and password registration
* 🔑 Email and password login
* 🚪 Logout functionality
* 🎫 Firebase ID token authentication
* 🛡️ Protected backend API endpoints

---

## 🤖 Gemini AI Assistant

* 💬 Multi-turn conversations with Gemini
* 🖥️ Server-side Gemini API integration
* 🔒 Gemini API key stored securely as an environment variable
* 🧾 Conversation history sent to Gemini
* ⚡ AI responses displayed directly inside the journal interface

---

## 📖 Persistent AI Journals

Users can:

* ➕ Start a new journal
* 🔄 Continue an existing conversation
* 💾 Save Gemini conversations
* 📂 Open previous journals
* 🗑️ Delete journals
* ☁️ Store conversation history permanently

---

## ☁️ Cloud Firestore

Journal data is organized using the following structure:

**users → {userId} → journals → {journalId}**

This structure associates each user's journal documents with their authenticated Firebase UID.

---

## 📝 Quick Journal

Users can create a **quick journal entry** without starting an AI conversation.

---

## 📱 Responsive Interface

The frontend is designed to work across:

* 🖥️ Desktop
* 💻 Laptop
* 📱 Tablet
* 📲 Mobile devices

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │       User Browser      │
                         │                         │
                         │  HTML + CSS + JavaScript│
                         └────────────┬────────────┘
                                      │
                                      │ Firebase Authentication
                                      ▼
                         ┌─────────────────────────┐
                         │ Firebase Authentication │
                         └────────────┬────────────┘
                                      │
                                      │ Firebase ID Token
                                      ▼
                         ┌─────────────────────────┐
                         │    Render Backend       │
                         │                         │
                         │     Node.js + Express   │
                         └────────────┬────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       │                             │
                       ▼                             ▼
              ┌──────────────────┐        ┌──────────────────┐
              │    Gemini API    │        │  Firebase Admin  │
              │                  │        │       SDK        │
              └──────────────────┘        └────────┬─────────┘
                                                   │
                                                   ▼
                                         ┌──────────────────┐
                                         │   Cloud Firestore│
                                         │                  │
                                         │   User Journals  │
                                         └──────────────────┘
```

---

# 🛠️ Technology Stack

## 🎨 Frontend

* HTML5
* CSS3
* JavaScript
* Firebase Web SDK

## ⚙️ Backend

* Node.js
* Express.js
* CORS
* Firebase Admin SDK
* Google GenAI SDK

## ☁️ Cloud Services

* 🔥 Firebase Authentication
* 🗄️ Cloud Firestore
* 🌐 Firebase Hosting
* 🤖 Google Gemini API
* 🚀 Render

## 🧰 Development Tools

* Visual Studio Code
* Git
* GitHub
* Firebase CLI
* npm

---

# 🔒 Security

Security is an important part of the project architecture.

## 🔐 Firebase Authentication

Every protected API request requires a **Firebase ID token**.

The backend verifies the token using the **Firebase Admin SDK**.

**Authorization:** `Bearer <Firebase ID Token>`

Unauthenticated requests are rejected.

---

## 👤 User Data Isolation

Journal data is stored under the authenticated user's UID.

**Firestore structure:**

`users/{uid}/journals/{journalId}`

The backend obtains the UID from the verified Firebase ID token rather than trusting a UID supplied by the frontend.

---

## 🔑 Gemini API Key Protection

The Gemini API key is **not stored in the frontend or public source code**.

The backend reads it from the environment variable:

`GEMINI_API_KEY`

---

## 🔥 Firebase Admin Credentials

Firebase Admin credentials are supplied through environment variables:

* `FIREBASE_PROJECT_ID`
* `FIREBASE_CLIENT_EMAIL`
* `FIREBASE_PRIVATE_KEY`

Sensitive credentials are excluded from the Git repository.

---

## 🛡️ Firestore Security Rules

Firestore access is restricted to authenticated users accessing their own user-specific data.

---

# 🔄 Application Workflow

1. 👤 User opens the application.
2. 🔐 User creates an account or signs in.
3. 🔥 Firebase Authentication verifies the user.
4. 🎫 Firebase provides an ID token.
5. 📡 Frontend sends authenticated requests to the backend.
6. 🛡️ Backend verifies the Firebase ID token.
7. 👤 Backend obtains the authenticated user's UID.
8. 💬 User sends a message to Gemini.
9. 🤖 Backend sends the conversation to the Gemini API.
10. ⚡ Gemini generates an AI response.
11. 🖥️ Response is displayed in the chat.
12. 💾 User saves the conversation.
13. ☁️ Backend stores the journal in Firestore.
14. 📂 User can reopen the journal later.

---

# 📡 API Endpoints

## ❤️ Health Check

**GET /**

Checks whether the backend is running.

---

## 🤖 Gemini Chat

**POST /api/chat**

Requires Firebase authentication.

Example request:

`message`: `"Help me plan a productive study day."`

`history`:

* `role`: `"user"`

* `text`: `"I have an exam next week."`

* `role`: `"model"`

* `text`: `"Let's create a study plan."`

---

## 📚 Get Journals

**GET /api/journal**

Returns the authenticated user's journals.

The backend also supports:

**GET /api/journals**

---

## 📖 Get Single Journal

**GET /api/journals/:journalId**

Returns one journal belonging to the authenticated user.

---

## ➕ Create Journal

**POST /api/journals**

Creates a new journal document for the authenticated user.

---

## ✏️ Update Journal

**PUT /api/journals/:journalId**

Updates an existing journal.

---

## 🗑️ Delete Journal

**DELETE /api/journals/:journalId**

Deletes a journal belonging to the authenticated user.

---

# 📂 Project Structure

```text
secure-gemini-journal/
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── .dockerignore
├── .firebaserc
├── .gitignore
├── Dockerfile
├── firebase-admin.js
├── firebase.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

# ⚙️ Local Setup

## 1️⃣ Clone the Repository

`git clone https://github.com/snehassneha4578-collab/secure-gemini-journal.git`

## 2️⃣ Enter the Project

`cd secure-gemini-journal`

## 3️⃣ Install Dependencies

`npm install`

## 4️⃣ Configure Environment Variables

Create a `.env` file locally.

Required variables:

`GEMINI_API_KEY=your_gemini_api_key`

`FIREBASE_PROJECT_ID=your_firebase_project_id`

`FIREBASE_CLIENT_EMAIL=your_firebase_client_email`

`FIREBASE_PRIVATE_KEY="your_firebase_private_key"`

> ⚠️ **Never commit the `.env` file or service-account credentials to GitHub.**

## 5️⃣ Start the Backend

`node server.js`

The backend will run on the configured port.

---

# 🌐 Deployment

| Component         | Platform                |
| ----------------- | ----------------------- |
| 🎨 Frontend       | Firebase Hosting        |
| ⚙️ Backend        | Render                  |
| ☁️ Database       | Cloud Firestore         |
| 🔐 Authentication | Firebase Authentication |
| 🤖 AI             | Google Gemini API       |

---

# 🔑 Environment Variables

The backend requires the following environment variables:

| Variable                | Purpose                              |
| ----------------------- | ------------------------------------ |
| `GEMINI_API_KEY`        | Authenticates requests to Gemini     |
| `FIREBASE_PROJECT_ID`   | Firebase project identifier          |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY`  | Firebase Admin private key           |
| `PORT`                  | Backend server port                  |

> 🔒 Sensitive values should only be configured in the deployment environment or local `.env` file.

---

# 🧪 Testing

The application can be tested by verifying the following:

## 🔐 Authentication

* [ ] Create a new account
* [ ] Sign in
* [ ] Sign out
* [ ] Attempt protected functionality while logged out

## 🤖 Gemini

* [ ] Send a message
* [ ] Continue a conversation
* [ ] Verify AI responses

## 📖 Journals

* [ ] Save a conversation
* [ ] Reload the application
* [ ] Open a previous journal
* [ ] Delete a journal
* [ ] Create a quick journal entry

## 🛡️ Security

* [ ] Verify unauthenticated API requests are rejected
* [ ] Verify users can access only their own journals
* [ ] Verify Gemini credentials are not present in frontend code

---

# 📊 Example Use Cases

## 📚 Study Planning

**User:**

Help me plan a productive study day.

**Gemini:**

Creates a structured study schedule based on the user's request.

---

## 💡 Brainstorming

**User:**

Give me ideas for improving my project.

**Gemini:**

Provides ideas and continues the discussion based on previous messages.

---

## 📝 Reflection

**User:**

Today I completed most of my tasks but struggled with time management.

**Gemini:**

Provides reflective prompts and practical suggestions.

---

# 🎯 Project Objectives

The main objectives of the project are:

1. 🔐 Build a secure personal AI journal.
2. 🤖 Integrate Gemini AI into a real-world application.
3. 🔥 Implement Firebase Authentication.
4. ☁️ Store user-specific data using Cloud Firestore.
5. 🛡️ Protect backend API endpoints using Firebase ID tokens.
6. 🔑 Keep sensitive API credentials outside the public source code.
7. 🔄 Implement persistent multi-turn AI conversations.
8. 🌐 Deploy the application using cloud services.
9. 🚀 Demonstrate a practical AI-powered productivity assistant.

---

# 🚀 Future Enhancements

Possible future improvements include:

* 🎙️ Voice-based journaling
* 🤖 AI-generated journal summaries
* 📊 Mood tracking and visualization
* 🔎 Search across journal entries
* 🏷️ Journal categories and tags
* 📄 Export journals as PDF
* 📈 AI-powered weekly productivity reports
* 🔔 Reminder notifications
* 🌓 Dark/light theme customization
* 🧠 Advanced Gemini model selection
* ⚡ Streaming AI responses
* 📊 More detailed analytics

---

# 🏆 Project Highlights

This project demonstrates practical experience with:

| Area                  | Technologies / Skills     |
| --------------------- | ------------------------- |
| 🤖 Generative AI      | Google Gemini API         |
| 🔐 Authentication     | Firebase Authentication   |
| ☁️ Database           | Cloud Firestore           |
| ⚙️ Backend            | Node.js + Express.js      |
| 📡 APIs               | REST API                  |
| 🛡️ Security          | Firebase ID Tokens        |
| 🔑 Credentials        | Environment Variables     |
| 🌐 Deployment         | Firebase Hosting + Render |
| 🧑‍💻 Version Control | Git + GitHub              |
| 🎨 Web Development    | HTML + CSS + JavaScript   |
| 📱 UI                 | Responsive Web Design     |

---

# 👩‍💻 Author

**Sneha S**

🎓 Electronics & Communication Engineering Student

---

# 📜 License

This project is intended for **educational, experimentation, and hackathon/ideathon purposes**.

---

<p align="center">

### ⭐ Personal Gemini Journal

**Secure • Private • Persistent • AI-Powered**

Built with ❤️ using **Google Gemini + Firebase + Node.js**

</p>
