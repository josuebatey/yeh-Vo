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
      const response = await fetch('https://dispenser.testnet.aws.algodev.network/dispense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `account=${address}`,
      })

      if (!response.ok) {
        throw new Error('Failed to fund from dispenser')
      }
    } catch (error) {
      console.error('Failed to fund from dispenser:', error)
      throw error
    }
  },

  getExplorerUrl(txId: string): string {
    return `https://testnet.algoexplorer.io/tx/${txId}`
  },
}