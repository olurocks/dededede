//src/app/components/WalletConnect.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );

  return (
    <div>
      {connectors.map((connector) => (
        // FIXED:
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: !connector.ready ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: !connector.ready ? "not-allowed" : "pointer",
            minWidth: "200px",
            marginBottom: "10px",
          }}
        >
          {connector.name}
          {!connector.ready && " (unavailable)"}
          {isPending && " (connecting...)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}
