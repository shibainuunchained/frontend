const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const TronWeb = require('tronweb');
const crypto = require('crypto');
const { encrypt } = require('./encrypt');

/**
 * Generates a random mnemonic seed phrase
 * @returns {string} - 12-word mnemonic phrase
 */
function generateMnemonic() {
  return ethers.Wallet.createRandom().mnemonic.phrase;
}

/**
 * Generates Ethereum-compatible wallet (ETH, BSC, Polygon)
 * @param {string} mnemonic - Optional mnemonic phrase
 * @returns {object} - Wallet with address, privateKey, and mnemonic
 */
function generateEthereumWallet(mnemonic = null) {
  try {
    let wallet;
    
    if (mnemonic) {
      wallet = ethers.Wallet.fromMnemonic(mnemonic);
    } else {
      wallet = ethers.Wallet.createRandom();
    }
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || mnemonic,
      publicKey: wallet.publicKey,
    };
  } catch (error) {
    throw new Error(`Failed to generate Ethereum wallet: ${error.message}`);
  }
}

/**
 * Generates Bitcoin wallet
 * @param {string} seed - Optional seed for deterministic generation
 * @returns {object} - Wallet with address, privateKey, and other details
 */
function generateBitcoinWallet(seed = null) {
  try {
    let keyPair;
    let privateKeyBuffer;
    
    if (seed) {
      // Generate from seed
      const hash = crypto.createHash('sha256').update(seed).digest();
      privateKeyBuffer = hash;
    } else {
      // Generate random
      privateKeyBuffer = crypto.randomBytes(32);
    }
    
    // Create key pair
    keyPair = bitcoin.ECPair.fromPrivateKey(privateKeyBuffer);
    
    // Generate P2PKH address (legacy format)
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin 
    });
    
    // Generate P2WPKH address (bech32 format)
    const { address: bech32Address } = bitcoin.payments.p2wpkh({ 
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin 
    });
    
    return {
      address: bech32Address, // Use bech32 as primary
      legacyAddress: address,
      privateKey: keyPair.privateKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
      wif: keyPair.toWIF(), // Wallet Import Format
    };
  } catch (error) {
    throw new Error(`Failed to generate Bitcoin wallet: ${error.message}`);
  }
}

/**
 * Generates Tron wallet
 * @param {string} seed - Optional seed for deterministic generation
 * @returns {object} - Wallet with address, privateKey, and other details
 */
function generateTronWallet(seed = null) {
  try {
    let privateKey;
    
    if (seed) {
      // Generate from seed
      const hash = crypto.createHash('sha256').update(seed).digest('hex');
      privateKey = hash;
    } else {
      // Generate random
      privateKey = crypto.randomBytes(32).toString('hex');
    }
    
    // Create TronWeb instance (we don't need actual connection for key generation)
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    });
    
    // Generate address from private key
    const address = tronWeb.address.fromPrivateKey(privateKey);
    
    // Get hex address
    const hexAddress = tronWeb.address.toHex(address);
    
    return {
      address: address,
      hexAddress: hexAddress,
      privateKey: privateKey,
      base58Address: address, // Same as address but more explicit
    };
  } catch (error) {
    throw new Error(`Failed to generate Tron wallet: ${error.message}`);
  }
}

/**
 * Generates all wallet types for a user
 * @param {string} masterSeed - Optional master seed for deterministic generation
 * @returns {object} - Object containing all wallet types with encrypted keys
 */
async function generateAllWallets(masterSeed = null) {
  try {
    // Generate master seed if not provided
    const seed = masterSeed || crypto.randomBytes(64).toString('hex');
    
    // Generate Ethereum wallet (compatible with BSC, Polygon)
    const ethWallet = generateEthereumWallet();
    
    // Generate Bitcoin wallet
    const btcWallet = generateBitcoinWallet(seed + '_btc');
    
    // Generate Tron wallet
    const tronWallet = generateTronWallet(seed + '_tron');
    
    // Encrypt private keys and seed
    const wallets = {
      ethereum: {
        address: ethWallet.address,
        encryptedPrivateKey: encrypt(ethWallet.privateKey),
        encryptedSeed: encrypt(ethWallet.mnemonic),
        publicKey: ethWallet.publicKey,
      },
      bitcoin: {
        address: btcWallet.address,
        legacyAddress: btcWallet.legacyAddress,
        encryptedPrivateKey: encrypt(btcWallet.privateKey),
        encryptedSeed: encrypt(seed + '_btc'),
        publicKey: btcWallet.publicKey,
        wif: btcWallet.wif,
      },
      tron: {
        address: tronWallet.address,
        hexAddress: tronWallet.hexAddress,
        encryptedPrivateKey: encrypt(tronWallet.privateKey),
        encryptedSeed: encrypt(seed + '_tron'),
      },
    };
    
    return {
      wallets,
      masterSeed: seed,
    };
  } catch (error) {
    throw new Error(`Failed to generate wallets: ${error.message}`);
  }
}

/**
 * Validates a private key for a specific blockchain
 * @param {string} privateKey - Private key to validate
 * @param {string} blockchain - Blockchain type (ethereum, bitcoin, tron)
 * @returns {boolean} - True if valid
 */
function validatePrivateKey(privateKey, blockchain) {
  try {
    switch (blockchain.toLowerCase()) {
      case 'ethereum':
      case 'eth':
      case 'bsc':
      case 'polygon':
        // Validate Ethereum private key
        new ethers.Wallet(privateKey);
        return true;
        
      case 'bitcoin':
      case 'btc':
        // Validate Bitcoin private key
        const keyBuffer = Buffer.from(privateKey, 'hex');
        bitcoin.ECPair.fromPrivateKey(keyBuffer);
        return true;
        
      case 'tron':
      case 'trx':
        // Validate Tron private key
        if (privateKey.length !== 64) return false;
        return /^[0-9a-fA-F]+$/.test(privateKey);
        
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Derives wallet from mnemonic for different chains
 * @param {string} mnemonic - Mnemonic phrase
 * @param {string} blockchain - Target blockchain
 * @param {number} index - Derivation index (default: 0)
 * @returns {object} - Derived wallet
 */
function deriveWalletFromMnemonic(mnemonic, blockchain, index = 0) {
  try {
    switch (blockchain.toLowerCase()) {
      case 'ethereum':
      case 'eth':
      case 'bsc':
      case 'polygon':
        const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
        const derivedNode = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
        return {
          address: derivedNode.address,
          privateKey: derivedNode.privateKey,
          publicKey: derivedNode.publicKey,
        };
        
      default:
        throw new Error(`Derivation not supported for ${blockchain}`);
    }
  } catch (error) {
    throw new Error(`Failed to derive wallet: ${error.message}`);
  }
}

module.exports = {
  generateMnemonic,
  generateEthereumWallet,
  generateBitcoinWallet,
  generateTronWallet,
  generateAllWallets,
  validatePrivateKey,
  deriveWalletFromMnemonic,
};