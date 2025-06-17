export interface ChainInfo {
    active: boolean;
    chainId: number;
    gasZRC20: string;
    registry: string;
}

export interface ContractInfo {
    active: boolean;
    address: string;
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

export interface ChainData {
    chainInfo: ChainInfo;
    contracts: ContractInfo[];
    zrc20Tokens: ZRC20TokenInfo[];
}

export interface AddressesData {
    [chainId: string]: ChainData;
}

export interface NetworkRegistryData {
    network: string;
    chains: ChainInfo[];
    contracts: ContractInfo[];
    zrc20Tokens: ZRC20TokenInfo[];
}