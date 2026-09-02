# Personal Gemini Journal — Secure Gemini AI Journal

A secure AI-powered personal journal that combines **Firebase Authentication, Cloud Firestore, Gemini AI, and a Node.js backend** to provide private, persistent, multi-turn conversations with an AI assistant.

The application allows users to create accounts, chat with Gemini, save conversations as journals, reopen previous conversations, and manage their personal journal entries.

---

## 🚀 Live Application

**Firebase Hosting:**

https://gemini-journal-8a53a.web.app

**Backend API:**

https://secure-gemini-journal-tjdq.onrender.com

---

## 🎯 Project Overview

Personal Gemini Journal is a productivity and reflection assistant designed to give each user a private space for:

- AI-assisted journaling
- Personal reflection
- Brainstorming
- Study planning
- Productivity planning
- Multi-turn conversations
- Persistent journal storage

Each authenticated user's journal data is isolated using their Firebase Authentication UID.

---

## ✨ Features

### 🔐 Secure Authentication

- Firebase Authentication
- Email and password registration
- Email and password login
- Logout functionality
- Firebase ID token authentication
- Protected backend API endpoints

### 🤖 Gemini AI Assistant

- Multi-turn conversations with Gemini
- Server-side Gemini API integration
- Gemini API key stored securely as an environment variable
- Conversation history sent to Gemini
- AI responses displayed inside the journal interface

### 📖 Persistent AI Journals

Users can:

- Start a new journal
- Continue an existing conversation
- Save Gemini conversations
- Open previous journals
- Delete journals
- Store conversation history permanently

### ☁️ Cloud Firestore

Journal data is stored using the following structure:

```text
users/
└── {userId}/
    └── journals/
        └── {journalId}
