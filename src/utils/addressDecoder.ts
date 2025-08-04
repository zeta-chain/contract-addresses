export enum ChainType {
  EVM,
  BITCOIN,
  SOLANA,
}

export const CHAIN_TYPES: Record<number, ChainType> = {
  1: ChainType.EVM,
  56: ChainType.EVM,
  137: ChainType.EVM,
  8453: ChainType.EVM,
  42161: ChainType.EVM,
  43114: ChainType.EVM,
  7000: ChainType.EVM,
  7001: ChainType.EVM,
  8332: ChainType.BITCOIN,
  900: ChainType.SOLANA,
};

export function getChainType(chainId: number): ChainType {
  return CHAIN_TYPES[chainId] || ChainType.EVM;
}

export function isZeroAddress(addressBytes: string): boolean {
  const cleaned = addressBytes.replace("0x", "").toLowerCase();
  return (
    cleaned ===
      "0000000000000000000000000000000000000000000000000000000000000000" ||
    cleaned === "" ||
    cleaned === "0".repeat(cleaned.length)
  );
}

export function decodeEvmAddress(addressBytes: string): string {
  if (!addressBytes || addressBytes === "0x") {
    return "0x0000000000000000000000000000000000000000";
  }

  const hex = addressBytes.replace("0x", "");
  if (hex.length === 40) {
    return "0x" + hex;
  }

  if (hex.length === 64) {
    const address = hex.slice(-40);
    return "0x" + address;
  }

  if (hex.length < 40) {
    return "0x" + hex.padStart(40, "0");
  }

  return "0x" + hex.slice(-40);
}

export function decodeBitcoinAddress(addressBytes: string): string {
  if (!addressBytes || addressBytes === "0x") {
    return "";
  }

  try {
    const hex = addressBytes.replace("0x", "");
    const ascii = Buffer.from(hex, "hex").toString("ascii");
    return ascii;
  } catch (error) {
    console.warn("Failed to decode Bitcoin address:", addressBytes, error);
    return addressBytes;
  }
}

export function decodeSolanaAddress(addressBytes: string): string {
  if (!addressBytes || addressBytes === "0x") {
    return "";
  }

  try {
    const hex = addressBytes.replace("0x", "");
    const ascii = Buffer.from(hex, "hex").toString("ascii");
    return ascii;
  } catch (error) {
    console.warn("Failed to decode Solana address:", addressBytes, error);
    return addressBytes;
  }
}

export function decodeAddress(addressBytes: string, chainId: number): string {
  if (!addressBytes) {
    return "";
  }

  if (isZeroAddress(addressBytes)) {
    const chainType = getChainType(chainId);
    return chainType === ChainType.EVM
      ? "0x0000000000000000000000000000000000000000"
      : "";
  }

  const chainType = getChainType(chainId);

  switch (chainType) {
    case ChainType.EVM:
      return decodeEvmAddress(addressBytes);
    case ChainType.BITCOIN:
      return decodeBitcoinAddress(addressBytes);
    case ChainType.SOLANA:
      return decodeSolanaAddress(addressBytes);
    default:
      return decodeEvmAddress(addressBytes);
  }
}

export function decodeContractAddress(
  addressBytes: string,
  chainId: number
): string {
  return decodeAddress(addressBytes, chainId);
}

export function decodeOriginAddress(
  originAddress: string,
  originChainId: number
): string {
  return decodeAddress(originAddress, originChainId);
}
