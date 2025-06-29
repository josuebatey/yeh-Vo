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
      // Use our Edge Function to avoid CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/fund-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ address }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fund from dispenser')
      }

      console.log('Funding result:', result)
    } catch (error) {
      console.error('Failed to fund from dispenser:', error)
      throw error
    }
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