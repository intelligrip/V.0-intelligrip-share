import "@/styles/globals.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import { type AppProps } from "next/app"
import { ConnectionProvider } from "@solana/wallet-adapter-react"
import { WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react"
import { UserProvider } from "@/contexts/UserContext"  // Import UserProvider

export default function App({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
    []
  )

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Wrap the entire app with UserProvider */}
          <UserProvider>
            <Component {...pageProps} />
          </UserProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
