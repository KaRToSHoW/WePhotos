import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthForm({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setError(error.message);

    // забираем актуальную сессию
    const {
      data: { session },
    } = await supabase.auth.getSession();
    onSignIn?.(session);
  }

  return (
    <form
      onSubmit={handleSignIn}
      className="max-w-md mx-auto bg-[#0d0f24]/90 p-6 rounded-2xl shadow-lg shadow-cyan-500/20 flex flex-col gap-4 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-semibold text-cyan-400 text-center">
        Вход в WePhotos
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded-md bg-[#1a1f3a] border border-cyan-500/30 placeholder-cyan-400 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded-md bg-[#1a1f3a] border border-cyan-500/30 placeholder-cyan-400 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-[#0d0f24] font-semibold hover:scale-105 transition-all shadow-lg shadow-cyan-500/30"
      >
        Войти
      </button>
      {error && (
        <div className="text-rose-400 text-sm text-center">{error}</div>
      )}
    </form>
  );
}
