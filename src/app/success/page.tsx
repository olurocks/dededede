// src/app/success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface Completion {
  phase: number;
  verified_at: number;
  tx_hash: string | null;
  contract_address: string | null;
}

export default function Success() {
  const router = useRouter();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [flag, setFlag] = useState<string>('');
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFlag();
  }, []);

  const fetchFlag = async () => {
    try {
      const res = await fetch('/api/flag');
      
      if (!res.ok) {
        if (res.status === 403) {
          setError('Both phases must be completed to view the flag');
          setTimeout(() => router.push('/phase1'), 2000);
        } else if (res.status === 401) {
          router.push('/');
        } else {
          setError('Failed to retrieve flag');
        }
        return;
      }

      const data = await res.json();
      setFlag(data.flag);
      setCompletions(data.completions);
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (isLoading) {
    return (
      <main style={styles.container}>
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.celebration}>🎉</div>
      
      <h1 style={styles.title}>Congratulations!</h1>
      <p style={styles.subtitle}>You've successfully completed both phases of the challenge!</p>

      <div style={styles.flagCard}>
        <h2 style={styles.cardTitle}>Your Flag</h2>
        <div style={styles.flagBox}>
          <code style={styles.flag}>{flag}</code>
          <button onClick={copyToClipboard} style={styles.copyButton}>
            {copied ? '✓ Copied!' : 'Copy Flag'}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Challenge Summary</h2>
        <p style={styles.text}>
          <strong>Wallet Address:</strong> {address}
        </p>

        {completions.map((completion) => (
          <div key={completion.phase} style={styles.phaseBox}>
            <h3 style={styles.phaseTitle}>
              Phase {completion.phase}: {completion.phase === 1 ? 'Delegate Call Exploitation' : 'Reentrancy Exploitation'}
            </h3>
            <p style={styles.infoText}>
              <strong>Completed:</strong> {formatTimestamp(completion.verified_at)}
            </p>
            {completion.contract_address && (
              <p style={styles.infoText}>
                <strong>Contract:</strong> <code>{completion.contract_address}</code>
              </p>
            )}
            {completion.tx_hash && (
              <p style={styles.infoText}>
                <strong>Transaction:</strong> <code>{completion.tx_hash}</code>
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>What You Learned</h2>
        <ul style={styles.list}>
          <li><strong>Delegate Call Vulnerabilities:</strong> How to exploit improper access control in delegatecall patterns</li>
          <li><strong>Reentrancy Attacks:</strong> How to exploit state changes during external calls</li>
          <li><strong>Flash Loan Mechanics:</strong> Understanding how flash loans can be used in attacks</li>
          <li><strong>Smart Contract Security:</strong> The importance of checks-effects-interactions pattern</li>
        </ul>
      </div>

      <div style={styles.navigation}>
        <button onClick={() => router.push('/')} style={styles.button}>
          Return to Home
        </button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Great job! Share your achievement and keep practicing smart contract security.
        </p>
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
  celebration: {
    fontSize: '80px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    textAlign: 'center',
    color: '#666',
    marginBottom: '40px',
  },
  flagCard: {
    border: '2px solid #00aa00',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    // backgroundColor: '#f0fff0',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  flagBox: {
    // backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  flag: {
    fontSize: '18px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00aa00',
    display: 'block',
    marginBottom: '15px',
    wordBreak: 'break-all',
  },
  copyButton: {
    padding: '10px 20px',
    fontSize: '14px',
    // backgroundColor: '#00aa00',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    // backgroundColor: '#f9f9f9',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  phaseBox: {
    // backgroundColor: '#e8f4fd',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '15px',
  },
  phaseTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  infoText: {
    fontSize: '14px',
    margin: '5px 0',
    wordBreak: 'break-all',
  },
  list: {
    lineHeight: '1.8',
    paddingLeft: '20px',
  },
  navigation: {
    textAlign: 'center',
    marginBottom: '30px',
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
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid #ddd',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
  },
  error: {
    color: '#ff0000',
    fontSize: '16px',
    textAlign: 'center',
  },
};