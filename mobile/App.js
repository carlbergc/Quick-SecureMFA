/*
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

*/
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";

const BACKEND = "http://127.0.0.1:5000";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    try {
      await axios.post(`${BACKEND}/authenticator-login`, { username, password });
      setLoggedIn(true);
      setError("");
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND}/get-code/${username}`);
        if (res.data.code) {
          setCode(res.data.code);
        } else {
          setCode(null);
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [loggedIn, username]);

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>QuickMFA Authenticator</Text>
        <Text style={styles.label}>Sign in to receive verification codes</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleConnect}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuickMFA Authenticator</Text>
      <Text style={styles.subtitle}>Logged in as: {username}</Text>
      {code ? (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your verification code:</Text>
          <Text style={styles.code}>{code}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setCode(null)}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.waiting}>Waiting for code request...</Text>
      )}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => { setLoggedIn(false); setUsername(""); setPassword(""); setCode(null); }}
      >
        <Text style={styles.logoutText}>Switch Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 30 },
  label: { fontSize: 14, color: "#aaa", marginBottom: 20 },
  input: { backgroundColor: "#222", color: "#fff", padding: 12, borderRadius: 8, width: 280, marginBottom: 10 },
  error: { color: "#f87171", marginBottom: 10 },
  button: { backgroundColor: "#333", padding: 12, borderRadius: 8, marginTop: 10, width: 280 },
  buttonText: { color: "#fff", textAlign: "center" },
  codeContainer: { alignItems: "center" },
  codeLabel: { fontSize: 16, color: "#aaa", marginBottom: 10 },
  code: { fontSize: 48, fontWeight: "bold", color: "#4ade80", letterSpacing: 8, marginBottom: 20 },
  waiting: { fontSize: 16, color: "#666", marginBottom: 30 },
  logoutButton: { marginTop: 40 },
  logoutText: { color: "#666", fontSize: 14 },
});