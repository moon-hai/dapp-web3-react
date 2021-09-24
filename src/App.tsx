import React, { useEffect } from 'react';
import Web3 from 'web3/types'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { useEagerConnect, useInactiveListener, useAccountBalance, useContractInstance } from './web3/hooks'
import { injected } from './web3/connectors'

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  }
  if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  }
  if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.'
  }
  console.error(error)
  return 'An unknown error occurred. Check the console for more details.'
}

function App() {
  const context = useWeb3React<Web3>()
  const { connector, activate, account, error } = context
  if (error) {
    console.log(getErrorMessage(error))
  }

  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  const triedEager = useEagerConnect()

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
    console.log(account)
    setActivatingConnector(injected)
    activate(injected)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector, account])

  useInactiveListener(!triedEager || !!activatingConnector)
  const balance = useAccountBalance()
  const tokoinBalance = useContractInstance()

  return (
    <div className="App">
      <header className="App-header">
        <p>Ether: {balance}</p>
        <p>Toko: {tokoinBalance}</p>
      </header>
    </div>
  );
}

export default App;
