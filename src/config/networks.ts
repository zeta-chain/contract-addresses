export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    registryAddress: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
    testnet: {
        name: 'ZetaChain Testnet',
        chainId: 7001,
        rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
        registryAddress: '0x7CCE3Eb018bf23e1FE2a32692f2C77592D110394'
    },
    mainnet: {
        name: 'ZetaChain Mainnet',
        chainId: 7000,
        rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
        registryAddress: '0x7CCE3Eb018bf23e1FE2a32692f2C77592D110394'
    }
}

export function getNetworkConfig(network: string): NetworkConfig {
    const config = NETWORKS[network];
    if (!config) {
        throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(NETWORKS).join(', ')}`);
    }
    return config;
}