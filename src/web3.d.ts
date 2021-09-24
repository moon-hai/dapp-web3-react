/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3/types'

interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | Record<string, any>
}

interface ProviderRpcError extends Error {
  code: number
  data?: unknown
}

interface ProviderMessage {
  readonly type: string
  readonly data: unknown
}

interface ProviderConnectInfo {
  readonly chainId: string
}

export interface EthereumEvent {
  connect: ProviderConnectInfo
  disconnect: ProviderRpcError
  accountsChanged: Array<string>
  chainChanged: string
  networkChanged: any
  message: ProviderMessage
}

type EventKeys = keyof EthereumEvent
type EventHandler<K extends EventKeys> = (event: EthereumEvent[K]) => void

export interface Ethereumish {
  autoRefreshOnNetworkChange: boolean
  chainId: string
  isMetaMask?: boolean
  isStatus?: boolean
  networkVersion: string
  selectedAddress: any

  on<K extends EventKeys>(event: K, eventHandler: EventHandler<K>): void
  enable(): Promise<any>
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
  removeListener?: any
  /**
   * @deprecated
   */
  send?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void
  sendAsync: (request: RequestArguments) => Promise<unknown>
}

declare global {
  interface Window {
    web3: Web3
    ethereum: Ethereumish
  }
}
