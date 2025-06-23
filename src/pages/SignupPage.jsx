import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input name="email" type="email" onChange={handleChange} placeholder="Email" required />
          <input name="password" type="password" onChange={handleChange} placeholder="Password" required />
          <button type="submit">Sign Up</button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default SignupPage;
