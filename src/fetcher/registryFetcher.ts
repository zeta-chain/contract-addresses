import {ethers} from "ethers";
import {NetworkConfig} from "../config/networks";
import {CoreRegistry__factory, CoreRegistry} from "@zetachain/protocol-contracts/dist/types";
import {ChainInfo, ContractInfo, ZRC20TokenInfo, AddressesData} from "../types/registry";
import {decodeContractAddress, decodeOriginAddress} from "../utils/addressDecoder";

export class RegistryFetcher {
    private provider: ethers.Provider;
    private registry: CoreRegistry;
    private networkConfig: NetworkConfig;

    constructor(networkConfig: NetworkConfig) {
        this.networkConfig = networkConfig;
        this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        this.registry = CoreRegistry__factory.connect(
            networkConfig.registryAddress,
            this.provider as any
        );
    }

    async fetchAddressesData(): Promise<AddressesData> {
        console.log(`Fetching addresses data from ${this.networkConfig.name}...`);
        try {
            const [chains, contracts, zrc20Tokens] = await Promise.all([
                this.fetchChains(),
                this.fetchContracts(),
                this.fetchZRC20Tokens()
            ]);

            const addressesData: AddressesData = {};
            chains.forEach(chain => {
                const chainId = chain.chainId.toString();
                const chainContracts = contracts.filter(contract => contract.chainId === chain.chainId);
                const chainZRC20Tokens = zrc20Tokens.filter(token => token.originChainId === chain.chainId);

                addressesData[chainId] = {
                    chainInfo: chain,
                    contracts: chainContracts,
                    zrc20Tokens: chainZRC20Tokens
                };
            });

            const allChainIds = new Set([
                ...chains.map(c => c.chainId),
                ...contracts.map(c => c.chainId),
                ...zrc20Tokens.map(t => t.originChainId)
            ]);
            allChainIds.forEach(chainId => {
                const chainIdStr = chainId.toString();
                if (!addressesData[chainIdStr]) {
                    const chainContracts = contracts.filter(contract => contract.chainId === chainId);
                    const chainZRC20Tokens = zrc20Tokens.filter(token => token.originChainId === chainId);

                    const existingChain = chains.find(c => c.chainId === chainId);
                    const chainInfo: ChainInfo = existingChain || {
                        active: false,
                        chainId: chainId,
                        gasZRC20: '',
                        registry: ''
                    };

                    addressesData[chainIdStr] = {
                        chainInfo,
                        contracts: chainContracts,
                        zrc20Tokens: chainZRC20Tokens
                    };
                }
            });

            return addressesData;
        } catch (error) {
            console.error(`Error fetching addresses data:`, error);
            throw error;
        }
    }

    private async fetchChains(): Promise<ChainInfo[]> {
        try {
            const chainsData = await this.registry.getAllChains();
            return chainsData.map((chain: any) => ({
                active: Boolean(chain.active),
                chainId: Number(chain.chainId),
                gasZRC20: String(chain.gasZRC20),
                registry: ethers.hexlify(chain.registry)
            }));
        } catch (error) {
            console.error('Error fetching chains:', error);
            return [];
        }
    }

    private async fetchContracts(): Promise<ContractInfo[]> {
        try {
            const contractsData = await this.registry.getAllContracts();
            return contractsData.map((contract: any) => {
                const chainId = Number(contract.chainId);
                const rawAddressBytes = ethers.hexlify(contract.addressBytes);

                return {
                    active: Boolean(contract.active),
                    address: decodeContractAddress(rawAddressBytes, chainId),
                    contractType: String(contract.contractType),
                    chainId: chainId,
                };
            });
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    }

    private async fetchZRC20Tokens(): Promise<ZRC20TokenInfo[]> {
        try {
            const tokensData = await this.registry.getAllZRC20Tokens();
            return tokensData.map((token: any) => {
                const originChainId = Number(token.originChainId);
                const rawOriginAddress = ethers.hexlify(token.originAddress);

                return {
                    active: Boolean(token.active),
                    address: String(token.address_),
                    symbol: String(token.symbol),
                    originChainId: originChainId,
                    originAddress: decodeOriginAddress(rawOriginAddress, originChainId),
                    coinType: String(token.coinType),
                    decimals: Number(token.decimals)
                };
            });
        } catch (error) {
            console.error('Error fetching ZRC20 tokens:', error);
            return [];
        }
    }
}