const { ethers } = require('ethers');
const TronWeb = require('tronweb');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const { chains, erc20ABI } = require('../config/chains');
const { decrypt } = require('./encrypt');

/**
 * Sends Ethereum-compatible transaction (ETH, BNB, MATIC)
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} - Transaction hash and details
 */
async function sendEthTransaction(params) {
  const { privateKey, to, amount, chain, tokenAddress = null, gasPrice = null, gasLimit = null } = params;
  
  try {
    const chainConfig = chains[chain.toLowerCase()];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    
    const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    let transaction;
    
    if (tokenAddress) {
      // ERC20/BEP20 token transfer
      const contract = new ethers.Contract(tokenAddress, erc20ABI, wallet);
      
      // Get token decimals
      const decimals = await contract.decimals();
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
      
      // Estimate gas
      const estimatedGas = await contract.estimateGas.transfer(to, amountWei);
      
      transaction = await contract.transfer(to, amountWei, {
        gasLimit: gasLimit || estimatedGas.mul(120).div(100), // 20% buffer
        gasPrice: gasPrice || await provider.getGasPrice(),
      });
    } else {
      // Native token transfer
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      const txRequest = {
        to,
        value: amountWei,
        gasPrice: gasPrice || await provider.getGasPrice(),
      };
      
      // Estimate gas
      const estimatedGas = await wallet.estimateGas(txRequest);
      txRequest.gasLimit = gasLimit || estimatedGas.mul(120).div(100); // 20% buffer
      
      transaction = await wallet.sendTransaction(txRequest);
    }
    
    return {
      txHash: transaction.hash,
      chain,
      to,
      amount,
      tokenAddress,
      gasPrice: transaction.gasPrice?.toString(),
      gasLimit: transaction.gasLimit?.toString(),
      nonce: transaction.nonce,
      status: 'pending',
      explorerUrl: `${chainConfig.explorer}/tx/${transaction.hash}`,
    };
  } catch (error) {
    throw new Error(`Failed to send ${chain} transaction: ${error.message}`);
  }
}

/**
 * Sends Bitcoin transaction
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} - Transaction hash and details
 */
async function sendBitcoinTransaction(params) {
  const { privateKey, to, amount, feeRate = 10, testnet = false } = params;
  
  try {
    const network = testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const apiUrl = testnet ? chains.bitcoin.testnetApiUrl : chains.bitcoin.apiUrl;
    
    // Create key pair
    const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network });
    
    // Get address from key pair
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    
    // Get UTXOs
    const utxosResponse = await axios.get(`${apiUrl}/address/${address}/utxo`);
    const utxos = utxosResponse.data;
    
    if (utxos.length === 0) {
      throw new Error('No UTXOs available');
    }
    
    // Calculate amount in satoshis
    const amountSatoshis = Math.floor(amount * 100000000);
    
    // Create transaction builder
    const psbt = new bitcoin.Psbt({ network });
    
    let totalInput = 0;
    let selectedUtxos = [];
    
    // Select UTXOs
    for (const utxo of utxos.sort((a, b) => b.value - a.value)) {
      totalInput += utxo.value;
      selectedUtxos.push(utxo);
      
      // Estimate fee (2 inputs + 2 outputs * fee rate)
      const estimatedFee = (selectedUtxos.length * 148 + 2 * 34 + 10) * feeRate;
      
      if (totalInput >= amountSatoshis + estimatedFee) {
        break;
      }
    }
    
    // Final fee calculation
    const fee = (selectedUtxos.length * 148 + 2 * 34 + 10) * feeRate;
    const change = totalInput - amountSatoshis - fee;
    
    if (totalInput < amountSatoshis + fee) {
      throw new Error('Insufficient funds');
    }
    
    // Add inputs
    for (const utxo of selectedUtxos) {
      // Get transaction hex for the UTXO
      const txResponse = await axios.get(`${apiUrl}/tx/${utxo.txid}/hex`);
      const txHex = txResponse.data;
      
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network }).output,
          value: utxo.value,
        },
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }
    
    // Add output for recipient
    psbt.addOutput({
      address: to,
      value: amountSatoshis,
    });
    
    // Add change output if needed
    if (change > 546) { // Dust limit
      psbt.addOutput({
        address: address,
        value: change,
      });
    }
    
    // Sign all inputs
    for (let i = 0; i < selectedUtxos.length; i++) {
      psbt.signInput(i, keyPair);
    }
    
    // Finalize and extract transaction
    psbt.finalizeAllInputs();
    const txHex = psbt.extractTransaction().toHex();
    
    // Broadcast transaction
    const broadcastResponse = await axios.post(`${apiUrl}/tx`, txHex, {
      headers: { 'Content-Type': 'text/plain' },
    });
    
    const txHash = broadcastResponse.data;
    
    return {
      txHash,
      chain: 'bitcoin',
      to,
      amount,
      fee: fee / 100000000, // Convert to BTC
      inputCount: selectedUtxos.length,
      status: 'pending',
      explorerUrl: `${chains.bitcoin.explorer}/tx/${txHash}`,
    };
  } catch (error) {
    throw new Error(`Failed to send Bitcoin transaction: ${error.message}`);
  }
}

/**
 * Sends Tron transaction (TRX or TRC20)
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} - Transaction hash and details
 */
async function sendTronTransaction(params) {
  const { privateKey, to, amount, tokenAddress = null, feeLimit = 10000000 } = params;
  
  try {
    const tronWeb = new TronWeb({
      fullHost: chains.tron.rpcUrl,
      privateKey,
    });
    
    let transaction;
    let txHash;
    
    if (tokenAddress) {
      // TRC20 token transfer
      const contract = await tronWeb.contract().at(tokenAddress);
      
      // Get token decimals
      const decimals = await contract.decimals().call();
      const amountSun = amount * Math.pow(10, decimals);
      
      // Create transaction
      const txObject = await contract.transfer(to, amountSun).send({
        feeLimit,
        from: tronWeb.address.fromPrivateKey(privateKey),
      });
      
      txHash = txObject;
      transaction = {
        type: 'TRC20',
        tokenAddress,
      };
    } else {
      // TRX transfer
      const amountSun = amount * 1000000; // Convert TRX to Sun
      
      // Create transaction
      const txObject = await tronWeb.trx.sendTransaction(to, amountSun);
      
      txHash = txObject.txid;
      transaction = {
        type: 'TRX',
      };
    }
    
    return {
      txHash,
      chain: 'tron',
      to,
      amount,
      tokenAddress,
      feeLimit,
      status: 'pending',
      explorerUrl: `${chains.tron.explorer}/#/transaction/${txHash}`,
      ...transaction,
    };
  } catch (error) {
    throw new Error(`Failed to send Tron transaction: ${error.message}`);
  }
}

/**
 * Validates transaction parameters
 * @param {object} params - Transaction parameters
 * @returns {object} - Validation result
 */
function validateTransactionParams(params) {
  const { chain, to, amount, privateKey } = params;
  const errors = [];
  
  if (!chain) errors.push('Chain is required');
  if (!to) errors.push('Recipient address is required');
  if (!amount || amount <= 0) errors.push('Amount must be greater than 0');
  if (!privateKey) errors.push('Private key is required');
  
  // Validate addresses based on chain
  if (to) {
    switch (chain?.toLowerCase()) {
      case 'ethereum':
      case 'bsc':
      case 'polygon':
        if (!ethers.utils.isAddress(to)) {
          errors.push('Invalid Ethereum-compatible address');
        }
        break;
      case 'bitcoin':
        // Basic Bitcoin address validation (simplified)
        if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(to)) {
          errors.push('Invalid Bitcoin address');
        }
        break;
      case 'tron':
        // Basic Tron address validation
        if (!/^T[A-Za-z0-9]{33}$/.test(to)) {
          errors.push('Invalid Tron address');
        }
        break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Main function to send transaction based on chain
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} - Transaction result
 */
async function sendTransaction(params) {
  const { chain, encryptedPrivateKey } = params;
  
  try {
    // Validate parameters
    const validation = validateTransactionParams(params);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Decrypt private key
    const privateKey = decrypt(encryptedPrivateKey);
    const txParams = { ...params, privateKey };
    
    // Send transaction based on chain
    switch (chain.toLowerCase()) {
      case 'ethereum':
      case 'eth':
        return await sendEthTransaction({ ...txParams, chain: 'ethereum' });
        
      case 'bsc':
      case 'bnb':
        return await sendEthTransaction({ ...txParams, chain: 'bsc' });
        
      case 'polygon':
      case 'matic':
        return await sendEthTransaction({ ...txParams, chain: 'polygon' });
        
      case 'bitcoin':
      case 'btc':
        return await sendBitcoinTransaction(txParams);
        
      case 'tron':
      case 'trx':
        return await sendTronTransaction(txParams);
        
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  } catch (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Estimates transaction fee
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} - Fee estimation
 */
async function estimateTransactionFee(params) {
  const { chain, to, amount, tokenAddress } = params;
  
  try {
    switch (chain.toLowerCase()) {
      case 'ethereum':
      case 'bsc':
      case 'polygon':
        const chainConfig = chains[chain.toLowerCase()];
        const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
        const gasPrice = await provider.getGasPrice();
        
        let gasLimit;
        if (tokenAddress) {
          gasLimit = ethers.BigNumber.from('65000'); // Typical ERC20 transfer
        } else {
          gasLimit = ethers.BigNumber.from('21000'); // ETH transfer
        }
        
        const feeWei = gasPrice.mul(gasLimit);
        const feeEth = ethers.utils.formatEther(feeWei);
        
        return {
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          gasLimit: gasLimit.toString(),
          estimatedFee: feeEth,
          currency: chainConfig.symbol,
        };
        
      case 'bitcoin':
        return {
          estimatedFee: '0.0001', // Typical fee in BTC
          feeRate: '10', // sat/vB
          currency: 'BTC',
        };
        
      case 'tron':
        return {
          estimatedFee: '0', // TRX transfers are often free
          bandwidth: 'Variable',
          energy: tokenAddress ? '65000' : '0',
          currency: 'TRX',
        };
        
      default:
        throw new Error(`Fee estimation not supported for ${chain}`);
    }
  } catch (error) {
    throw new Error(`Fee estimation failed: ${error.message}`);
  }
}

module.exports = {
  sendTransaction,
  sendEthTransaction,
  sendBitcoinTransaction,
  sendTronTransaction,
  validateTransactionParams,
  estimateTransactionFee,
};