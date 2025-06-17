export interface ChainInfo {
    active: boolean;
    chainId: number;
    gasZRC20: string;
    registry: string;
}

export interface ContractInfo {
    active: boolean;
    addressBytes: string;
    contractType: string;
    chainId: number;
}

export interface ZRC20TokenInfo {
    active: boolean;
    address: string;
    symbol: string;
    originChainId: number;
    originAddress: string;
    coinType: string;
    decimals: number;
}

export interface RegistryData {
    network: string;
    chains: ChainInfo[];
    contracts: ContractInfo[];
    zrc20Tokens: ZRC20TokenInfo[];
}

export interface RegistryExport {
    testnet?: RegistryData;
    mainnet?: RegistryData;
}