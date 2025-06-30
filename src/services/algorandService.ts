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
          console.log('Edge function not available, trying direct dispenser...')
        }
      }

      // Direct call to TestNet dispenser
      const response = await fetch('https://dispenser.testnet.aws.algodev.network/dispense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `account=${address}`,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Dispenser error:', errorText)
        throw new Error(`TestNet dispenser failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.text()
      console.log('Funding successful:', result)

    } catch (error) {
      console.error('Funding failed:', error)
      // Provide helpful error message with manual funding option
      throw new Error('Automatic funding failed. Please manually fund your TestNet wallet at https://dispenser.testnet.aws.algodev.network/')
    }
  },

  getExplorerUrl(txId: string): string {
    return `https://testnet.algoexplorer.io/tx/${txId}`
  },

  getAddressExplorerUrl(address: string): string {
    return `https://testnet.algoexplorer.io/address/${address}`
  },

  getDispenserUrl(): string {
    return 'https://dispenser.testnet.aws.algodev.network/'
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