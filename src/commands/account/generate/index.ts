import { Wallet } from '@ethereumjs/wallet'
import fs from 'fs'
import path from 'path'
import type { Hex } from 'viem'

import { accounts } from '@classes'
import { DATA_FOLDER } from '@classes/Config/Config'
import { chalkError, chalkInfo } from '@constants/chalk'

import { notDuplicatedAccountIdPrompt } from '@commands/account/prompt'
import { ensureAccessibilityAtPath } from '@utils/files'

import { passwordWithConfirmPrompt } from '@commands/account/prompt'
import { getProjectChainInfo } from '@utils/config'

export const handleGenerateAccount = async (accountId?: string) => {
  try {
    // 1. prompt account ID
    const validAccountId = await notDuplicatedAccountIdPrompt(accountId)

    // 2. ensure account file is writable
    const accountFilePath = path.join(DATA_FOLDER, 'accounts')
    ensureAccessibilityAtPath(accountFilePath, fs.constants.W_OK)

    // 3. generate wallet
    console.log('Generating a new private key...')
    const wallet = Wallet.generate()

    // 4. prompt password
    const password = await passwordWithConfirmPrompt()

    const privateKey = wallet.getPrivateKeyString() as Hex
    // 5. create account
    const account = await accounts.save(validAccountId, privateKey, password)

    // 6. chainInfo
    const chainInfo = getProjectChainInfo()

    const walletAddress = '0x' + account.keystore.address

    console.log(`Generate your account successfully with the id ${chalkInfo(validAccountId)}`)
    console.log(`Wallet address: ${chalkInfo(walletAddress)}`)
    console.log('\n')
    console.log(
      `Please transfer ${chainInfo.nativeCurrency.symbol} to the address ${chalkInfo(walletAddress)} account on ${chalkInfo(chainInfo.name)} blockchain to cover gas fees.`,
    )
  } catch (error) {
    console.error(chalkError(error))
  }
}