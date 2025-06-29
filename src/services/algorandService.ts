import algosdk from 'algosdk'

const algodToken = import.meta.env.VITE_ALGOD_TOKEN || ''
const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const algodPort = parseInt(import.meta.env.VITE_ALGOD_PORT || '443')

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)

export const algorandService = {
  async getBalance(address: string): Promise<number> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return accountInfo.amount / 1000000 // Convert microAlgos to Algos
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  },

  async sendPayment(
    fromAddress: string,
    toAddress: string,
    amount: number,
    mnemonic: string
  ): Promise<string> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const secretKey = algosdk.mnemonicToSecretKey(mnemonic).sk
      
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: fromAddress,
        to: toAddress,
        amount: Math.round(amount * 1000000), // Convert Algos to microAlgos
        suggestedParams,
      })

      const signedTxn = txn.signTxn(secretKey)
      const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
      
      return txId
    } catch (error) {
      console.error('Failed to send payment:', error)
      throw error
    }
  },

  async waitForTransaction(txId: string): Promise<any> {
    try {
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      return confirmedTxn
    } catch (error) {
      console.error('Failed to wait for transaction:', error)
      throw error
    }
  },

  async fundFromDispenser(address: string): Promise<void> {
    try {
      // First try the Edge Function approach
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/fund-wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ address }),
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Funding result:', result)
            return
          }
        } catch (edgeFunctionError) {
          console.log('Edge function not available, trying alternative method...')
        }
      }

      // Fallback: Use a CORS proxy service
      const proxyUrl = 'https://api.allorigins.win/raw?url='
      const dispenserUrl = encodeURIComponent('https://dispenser.testnet.aws.algodev.network/dispense')
      
      const response = await fetch(proxyUrl + dispenserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `account=${address}`,
      })

      if (!response.ok) {
        // If proxy also fails, simulate funding for demo purposes
        console.log('Proxy method failed, simulating funding for demo...')
        await this.simulateFunding(address)
        return
      }

      const result = await response.text()
      console.log('Funding successful via proxy:', result)

    } catch (error) {
      console.error('All funding methods failed, simulating for demo:', error)
      // Simulate funding for demo purposes
      await this.simulateFunding(address)
    }
  },

  async simulateFunding(address: string): Promise<void> {
    // For demo purposes, we'll simulate the funding by showing a success message
    // In a real app, you'd need to actually fund the account
    console.log(`Simulating funding for address: ${address}`)
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Note: This doesn't actually add funds, but allows the demo to continue
    // Users should manually fund their TestNet wallets using the official dispenser
    throw new Error('TestNet funding simulation complete. Please manually fund your wallet at https://dispenser.testnet.aws.algodev.network/ for actual ALGO.')
  },

  getExplorerUrl(txId: string): string {
    return `https://testnet.algoexplorer.io/tx/${txId}`
  },

  getAddressExplorerUrl(address: string): string {
    return `https://testnet.algoexplorer.io/address/${address}`
  },

  // Helper function to validate Algorand address
  isValidAddress(address: string): boolean {
    try {
      return algosdk.isValidAddress(address)
    } catch {
      return false
    }
  },

  // Helper function to format amounts
  formatAmount(microAlgos: number): number {
    return microAlgos / 1000000
  },

  // Helper function to convert to microAlgos
  toMicroAlgos(algos: number): number {
    return Math.round(algos * 1000000)
  },
}