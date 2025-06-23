import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      } else {
        setUserEmail(data.session.user.email);
      }
    };
    getSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to Chat Page</h2>
      <p>Logged in as: {userEmail}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ChatPage;
