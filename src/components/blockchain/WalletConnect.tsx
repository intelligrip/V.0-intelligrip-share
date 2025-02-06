
import { FC } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import "@solana/wallet-adapter-react-ui/styles.css"

export const WalletConnect: FC = () => {
  const { wallet } = useWallet()

  return (
    <div className="flex items-center gap-4">
      <WalletModalProvider>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
      </WalletModalProvider>
      {wallet && (
        <Button variant="outline" size="sm">
          Connected: {wallet.adapter.name}
        </Button>
      )}
    </div>
  )
}
