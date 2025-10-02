// src/app/page.tsx
"use client";

import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ConnectButton } from "./components/WalletConnect";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    fetch("/api/status")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignIn = async () => {
    if (!address || !isConnected) return;

    try {
      setIsLoading(true);
      setError("");

      // Get nonce
      const nonceRes = await fetch("/api/siwe-nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!nonceRes.ok) throw new Error("Failed to get nonce");

      const { nonce } = await nonceRes.json();

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to CTF Challenge Platform",
        uri: window.location.origin,
        version: "1",
        chainId: 11155111, // Sepolia
        nonce,
      });

      const preparedMessage = message.prepareMessage();

      // Sign message
      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      // Verify signature
      const loginRes = await fetch("/api/siwe-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: preparedMessage,
          signature,
        }),
      });

      if (!loginRes.ok) throw new Error("Authentication failed");

      // Redirect to phase 1
      router.push("/phase1");
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>Phantom Vault</h1>
        <p style={styles.text}>Signed In</p>
        <button onClick={() => router.push("/phase1")} style={styles.button}>
          Go to Challenges
        </button>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Phantom Vault</h1>
      <p style={styles.subtitle}>Two-Phase Smart Contract Security Challenge</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Getting Started</h2>
        <ol style={styles.list}>
          <li>Connect your wallet</li>
          <li>Sign the authentication message</li>
          <li>Complete Phase 1</li>
          <li>Complete Phase 2</li>
          <li>Claim your flag!</li>
        </ol>
      </div>

      {!isConnected ? (
        <div style={styles.connectSection}>
          <p style={styles.text}>Connect your wallet to begin</p>
          <ConnectButton />
        </div>
      ) : (
        <div style={styles.authSection}>
          <p style={styles.address}>Connected: {address}</p>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? "Signing In..." : "Sign In with Ethereum"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "16px",
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "30px",
    // backgroundColor: "#f9f9f9",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  list: {
    lineHeight: "1.8",
    paddingLeft: "20px",
  },
  connectSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  authSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  text: {
    fontSize: "16px",
    marginBottom: "15px",
  },
  address: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    wordBreak: "break-all",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    // backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  error: {
    color: "#ff0000",
    marginTop: "10px",
    fontSize: "14px",
  },
};
