// ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [friendNames, setFriendNames] = useState({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedUser && inputRef.current) inputRef.current.focus();
  }, [selectedUser]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return navigate("/login");

      const currentUser = sessionData.session.user;
      setCurrentUser(currentUser);

      const { data: userList } = await supabase.from("profiles").select("id, email");
      const filteredUsers = userList.filter((u) => u.id !== currentUser.id);
      setUsers(filteredUsers);

      const { data: namesData } = await supabase
        .from("friend_names")
        .select("*")
        .eq("user_id", currentUser.id);

      const namesMap = {};
      namesData?.forEach((item) => {
        namesMap[item.friend_id] = item.custom_name;
      });
      setFriendNames(namesMap);
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });
      if (!error) setMessages(data);
      await supabase.from("messages").update({ seen: true }).match({
        receiver_id: currentUser.id,
        sender_id: selectedUser.id,
        seen: false,
      });
    };
    loadMessages();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("realtime:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new;
        if (
          (msg.receiver_id === currentUser.id || msg.sender_id === currentUser.id) &&
          selectedUser &&
          (msg.sender_id === selectedUser.id || msg.receiver_id === selectedUser.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUser, selectedUser]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const { data } = await supabase
      .from("messages")
      .insert([{ sender_id: currentUser.id, receiver_id: selectedUser.id, message: newMsg.trim() }])
      .select();
    if (data?.[0]) setMessages((prev) => [...prev, data[0]]);
    setNewMsg("");
  };

  const updateFriendName = async (friendId, name) => {
    const { error } = await supabase.from("friend_names").upsert([
      { user_id: currentUser.id, friend_id: friendId, custom_name: name },
    ]);
    if (!error) setFriendNames((prev) => ({ ...prev, [friendId]: name }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleUserClick = (user) => {
    setSelectedUser((prev) => (prev?.id === user.id ? null : user));
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.id === user.id ? "selected-user" : ""}`}
            onClick={() => handleUserClick(user)}
          >
            <div className="user-name">{friendNames[user.id] || user.email}</div>
            <button
              className="edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                const newName = prompt("Enter custom name:", friendNames[user.id] || "");
                if (newName !== null) updateFriendName(user.id, newName);
              }}
            >
              ✏️
            </button>
          </div>
        ))}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="chat-area fade-in">
        {selectedUser ? (
          <>
            <h3 className="chat-header">
              Chat with {friendNames[selectedUser.id] || selectedUser.email}
            </h3>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="empty-msg">🗨️ No messages yet. Say hi!</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-bubble ${msg.sender_id === currentUser.id ? "sent" : "received"}`}
                  >
                    <div>{msg.message}</div>
                    {msg.sender_id === currentUser.id && msg.seen && (
                      <span className="seen-indicator">✓ Seen</span>
                    )}
                    <div ref={bottomRef}></div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button onClick={sendMessage} className="send-btn">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder fade-in">
            <div className="welcome-card">
              <div className="welcome-icon">💬</div>
              <h2>Welcome to ChatApp</h2>
              <p>Select a user from the left to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;