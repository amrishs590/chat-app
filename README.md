# 💬 Realtime Chat App

**Realtime Chat App** is a modern web-based messaging platform built using **React.js** and **Supabase**.  
It provides a clean, responsive, and secure chat experience with **real-time message updates**, **user authentication**, and a **minimal UI** inspired by popular chat applications.

---

## 🚀 Features

- 🔐 **User Authentication**
  - Signup and Login using **Supabase Auth**
  - Credentials securely stored and managed via Supabase

- 💬 **Realtime Messaging**
  - Instantly sends and receives messages using **Supabase Realtime**

- 🧾 **Chat History**
  - Messages are persisted in the database and retrieved automatically on login

- 🧱 **Modular Architecture**
  - Components separated for scalability (`ChatPage`, `MessageInput`, `MessageList`, etc.)

- 🌙 **Clean and Responsive UI**
  - Built with Tailwind CSS  
  - Fully responsive for mobile and desktop

- 🧠 **Optimized Database Structure**
  - Uses efficient relational tables for users and messages

---

## 🧩 Tech Stack

| Layer | Technology Used |
|--------|------------------|
| **Frontend** | React.js + Vite |
| **Backend / Realtime DB** | Supabase |
| **Styling** | Tailwind CSS |
| **Auth** | Supabase Auth |
| **Deployment** | Vercel |

---

**🔄 How Realtime Messaging Works**

- When a user sends a message, it’s inserted into the messages table in Supabase.
- Supabase Realtime Listener detects the insert event.
- All connected clients subscribed to the messages channel instantly receive the new message.
- The message is displayed on every active user’s screen in real-time.

---

**🛡️ Security & Best Practices**

- ✅ Secure password authentication via Supabase Auth
- 🔑 Protected routes – users must be logged in to access ChatPage
- 🧱 Input sanitization to prevent XSS attacks
- 🔒 Private environment variables via .env.local
- 🧍‍♂️ Session-based user tracking

---

**⚙️ Setup and Installation**

**1. Clone the Repository**

   git clone https://github.com/amrishs590/ChatApp.git
   cd ChatApp

**2. Install Dependencies**
   
   npm install

**3. Configure Supabase**

  Create a .env.local file in your project root:
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

**4. Run the App**

  npm run dev


