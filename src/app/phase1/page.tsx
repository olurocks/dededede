// src/app/phase1/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PHASE1_ADDRESS, PHASE2_ADDRESS } from "@/lib/contract";

export default function Phase1() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phase1Complete, setPhase1Complete] = useState(false);

  console.log('Debug:', { isConnected, address });
  const phase2Addy = PHASE2_ADDRESS
  console.log("phase2addy: ", phase2Addy)
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/status");

      if (!res.ok) {
        router.push("/");
        return;
      }

      const data = await res.json();
      setIsAuthenticated(true);
      setPhase1Complete(data.phase1Complete);

      if (data.phase1Complete) {
        setSuccess("Phase 1 already completed!");
      }
    } catch (err) {
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/verify-phase1", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setPhase1Complete(true);

        // Redirect to phase 2 after 2 seconds
        setTimeout(() => {
          router.push("/phase2");
        }, 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <main style={styles.container}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Auth Gateway</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Challenge Description</h2>
        <p style={styles.text}>
          Exploit the <strong>AuthorizationGateway</strong>  And get the required level to proceed
        </p>

        <div style={styles.infoBox}>
          <p>
            <strong>Contract Address:</strong>
          </p>
          <p style={styles.address}>
            0x7d4B627D7a221d536e3c3a1a67Da49e1400dD8CB
          </p>
          <p>
            <strong>Network:</strong> Sepolia Testnet
          </p>
        </div>

      </div>

      {!isConnected && !address && (
        <div style={styles.verifySection}>
          <p style={styles.error}>
            Please connect your wallet from the home page first.
          </p>
          <button onClick={() => router.push("/")} style={styles.button}>
            Go Back to Connect Wallet
          </button>
        </div>
      )}



      {address &&  (
        
        <div style={styles.verifySection}>
          <p style={styles.text}>
            <strong>Connected Wallet:</strong> {address}
          </p>

          {!phase1Complete ? (
            
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              style={styles.button}
            >
              {isVerifying ? "Verifying..." : "Verify Phase 1 Completion"}
            </button>
          ) : (
            <div>
              <p style={styles.successText}>✓ Phase 1 Complete!</p>
              <p> Phase 2 contract Address:  {phase2Addy} </p> 
              <button
                onClick={() => router.push("/phase2")}
                style={styles.button}
              >

                Proceed to Phase 2
              </button>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </div>
      )}
      

      <div style={styles.navigation}>
        <button onClick={() => router.push("/")} style={styles.secondaryButton}>
          ← Back to Home
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "800px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "30px",
    marginBottom: "30px",
    // backgroundColor: "#f9f9f9",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  infoBox: {
    // backgroundColor: "#e8f4fd",
    padding: "15px",
    borderRadius: "6px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  address: {
    fontFamily: "monospace",
    fontSize: "14px",
    wordBreak: "break-all",
    margin: "10px 0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "25px",
    marginBottom: "10px",
  },
  list: {
    lineHeight: "1.8",
    paddingLeft: "20px",
  },
  verifySection: {
    textAlign: "center",
    padding: "30px",
    // backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 32px",
    fontSize: "16px",
    // backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    marginTop: "15px",
  },
  secondaryButton: {
    padding: "10px 20px",
    fontSize: "14px",
    // backgroundColor: "#666",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  navigation: {
    textAlign: "center",
  },
  error: {
    color: "#ff0000",
    marginTop: "15px",
    fontSize: "14px",
  },
  success: {
    color: "#00aa00",
    marginTop: "15px",
    fontSize: "14px",
  },
  successText: {
    color: "#00aa00",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
};
