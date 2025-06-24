import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // Fetch current user and user list
  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return navigate("/login");

      const currentUser = sessionData.session.user;
      setCurrentUser(currentUser);

      const { data: userList } = await supabase
        .from("profiles")
        .select("id, email");

      const filteredUsers = userList.filter((u) => u.id !== currentUser.id);
      setUsers(filteredUsers);
    };

    fetchData();
  }, [navigate]);

  // Fetch messages when a user is selected
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

      if (data) setMessages(data);
    };

    loadMessages();
  }, [selectedUser, currentUser]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;

          // Only add messages where current user is involved
          if (
            msg.receiver_id === currentUser.id ||
            msg.sender_id === currentUser.id
          ) {
            // Add only if the message is part of the current open chat
            if (
              selectedUser &&
              (msg.sender_id === selectedUser.id ||
                msg.receiver_id === selectedUser.id)
            ) {
              setMessages((prev) => [...prev, msg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedUser]);

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: selectedUser.id,
          message: newMsg.trim(),
        },
      ])
      .select();

    if (data && data[0]) {
      setMessages((prev) => [...prev, data[0]]);
    }
    setNewMsg("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar with users */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "20px",
        }}
      >
        <h3>Users</h3>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              padding: "10px",
              cursor: "pointer",
              background:
                selectedUser?.id === user.id ? "#e0e7ff" : "transparent",
              borderRadius: "5px",
            }}
            onClick={() => setSelectedUser(user)}
          >
            {user.email}
          </div>
        ))}
        <button onClick={handleLogout} style={{ marginTop: "20px" }}>
          Logout
        </button>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.email}</h3>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "10px",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign:
                      msg.sender_id === currentUser.id ? "right" : "left",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor:
                        msg.sender_id === currentUser.id
                          ? "#4f46e5"
                          : "#e5e5e5",
                      color:
                        msg.sender_id === currentUser.id ? "white" : "black",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      display: "inline-block",
                      maxWidth: "70%",
                    }}
                  >
                    {msg.message}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ width: "80%", padding: "10px", marginRight: "10px" }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h3>Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
