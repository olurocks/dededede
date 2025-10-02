// src/app/phase2/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { PHASE2_ADDRESS } from '@/lib/contract';

export default function Phase2() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [contractAddress, setContractAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [phase1Complete, setPhase1Complete] = useState(false);
  const [phase2Complete, setPhase2Complete] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/status');
      
      if (!res.ok) {
        router.push('/');
        return;
      }

      const data = await res.json();
      setPhase1Complete(data.phase1Complete);
      setPhase2Complete(data.phase2Complete);

      if (!data.phase1Complete) {
        router.push('/phase1');
        return;
      }

      if (data.phase2Complete) {
        setSuccess('Phase 2 already completed!');
      }
    } catch (err) {
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractAddress || !txHash) {
      setError('Please provide both contract address and transaction hash');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      setSuccess('');

      const res = await fetch('/api/verify-phase2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, txHash }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setPhase2Complete(true);
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push('/success');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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

  if (!phase1Complete) {
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>Phase 2: Locked</h1>
        <p style={styles.text}>Complete Phase 1 first to unlock Phase 2</p>
        <button onClick={() => router.push('/phase1')} style={styles.button}>
          Go to Phase 1
        </button>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Phase 2: Reentrancy Exploitation</h1>
      
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Challenge Description</h2>
        <p style={styles.text}>
          Find the Vulnerability in the contact and Exploit to get the flag
        </p>
        
        <div style={styles.infoBox}>
          <p><strong>Contract Address:</strong></p>
          <p style={styles.address}>{PHASE2_ADDRESS}</p>
          <p><strong>Network:</strong> Sepolia Testnet</p>
        </div>

        <h3 style={styles.sectionTitle}>Objective</h3>
        
        <p>Find the vulnerabilityin the contract</p>
      </div>

      {address && !phase2Complete && (
        <div style={styles.verifySection}>
          <h2 style={styles.cardTitle}>Verify Your Exploit</h2>
          <p style={styles.text}>
            <strong>Connected Wallet:</strong> {address}
          </p>
          
          <form onSubmit={handleVerify} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Attacker Contract Address:</label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                style={styles.input}
                disabled={isVerifying}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Deployment Transaction Hash:</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                style={styles.input}
                disabled={isVerifying}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              style={styles.button}
            >
              {isVerifying ? 'Verifying...' : 'Verify Phase 2 Completion'}
            </button>
          </form>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </div>
      )}

      {phase2Complete && (
        <div style={styles.verifySection}>
          <p style={styles.successText}>✓ Phase 2 Complete!</p>
          <p style={styles.text}>Congratulations! You've completed both phases.</p>
          <button
            onClick={() => router.push('/success')}
            style={styles.button}
          >
            Claim Your Flag
          </button>
        </div>
      )}

      <div style={styles.navigation}>
        <button onClick={() => router.push('/phase1')} style={styles.secondaryButton}>
          ← Back to Phase 1
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    // backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  infoBox: {
    // backgroundColor: '#e8f4fd',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: '14px',
    wordBreak: 'break-all',
    margin: '10px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '25px',
    marginBottom: '10px',
  },
  list: {
    lineHeight: '1.8',
    paddingLeft: '20px',
  },
  verifySection: {
    padding: '30px',
    // backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  form: {
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 32px',
    fontSize: '16px',
    // backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    marginTop: '15px',
    width: '100%',
  },
  secondaryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    // backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  navigation: {
    textAlign: 'center',
  },
  error: {
    color: '#ff0000',
    marginTop: '15px',
    fontSize: '14px',
  },
  success: {
    color: '#00aa00',
    marginTop: '15px',
    fontSize: '14px',
  },
  successText: {
    color: '#00aa00',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
  },
};