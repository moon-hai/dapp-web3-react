import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import Web3 from 'web3/types'
import { AbiItem, fromWei } from 'web3-utils'
import TokoinToken from '../contracts/TokoinToken.json'
import { injected } from './connectors'

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState<boolean>(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const { ethereum } = window
    if (ethereum && !active && !error && !suppress) {
      const handleConnect = () => {
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}

export function useAccountBalance() {
  const { account, library, active, activate } = useWeb3React<Web3>()
  const [balance, setBalance] = useState<number | string>(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && library && library.eth && account) {
      library.eth.getBalance(account).then((res) => {
        setBalance(fromWei(res, 'ether'))
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activate, active])

  return balance
}

export function useContractInstance() {
  const { account, chainId, library, active, activate } = useWeb3React<Web3>()
  const [balance, setBalance] = useState<number | string>(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && library && library.eth && account) {
      const tokoinSCInstance = new library.eth.Contract(
        TokoinToken.abi as AbiItem[],
        '0x616951fbc199277a950de586163af8cae9e27f5a',
        {},
      )

      const a = async () => {
        if (tokoinSCInstance) {
          const accountBalance = await tokoinSCInstance.methods.balanceOf(account).call()
          setBalance(fromWei(accountBalance, 'ether'))
        }
      }

      a()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activate, active, chainId])

  return balance
}
