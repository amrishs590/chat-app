import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const { email, password } = formData;

    const { data, error } = await supabase.auth.signUp({ email, password });

    const user = data?.user;
    const session = data?.session;

    console.log("User ID:", user?.id);
    console.log("Session:", session);

    if (error) {
      setError(error.message);
      return;
    }

    if (user && session) {
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: user.id,
            email: user.email,
          },
        ])
        .select();

      console.log("Inserted profile:", inserted);
      if (insertError) {
        console.error("Insert error:", insertError.message);
        setError("Insert into profiles failed: " + insertError.message);
      } else {
        setInfo("Signup successful! You can now log in.");
        navigate("/login");
      }
    } else {
      setInfo("Signup successful! Please check your email to confirm your account before logging in.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {info && <p style={{ color: "green" }}>{info}</p>}

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#4f46e5", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
