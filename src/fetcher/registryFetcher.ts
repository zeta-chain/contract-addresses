import {ethers} from "ethers";
import {NetworkConfig} from "../config/networks";
import {CoreRegistry__factory, CoreRegistry} from "@zetachain/protocol-contracts/dist/types";
import {ChainInfo, ContractInfo, RegistryData, ZRC20TokenInfo} from "../types/registry";

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

    async fetchRegistryData(): Promise<RegistryData> {
        console.log(`Fetching registry data from ${this.networkConfig.name}...`);
        try {
            const [chains, contracts, zrc20Tokens] = await Promise.all([
                this.fetchChains(),
                this.fetchContracts(),
                this.fetchZRC20Tokens()
            ]);

            const registryData: RegistryData = {
                network: this.networkConfig.name,
                chains,
                contracts,
                zrc20Tokens
            };

            console.log(`Successfully fetched data:`, {
                chains: chains.length,
                contracts: contracts.length,
                zrc20Tokens: zrc20Tokens.length
            });

            return registryData;
        } catch (error) {
            console.error(`Error fetching registry data:`, error);
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
            return contractsData.map((contract: any) => ({
                active: Boolean(contract.active),
                addressBytes: ethers.hexlify(contract.addressBytes),
                contractType: String(contract.contractType),
                chainId: Number(contract.chainId),
            }));
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    }

    private async fetchZRC20Tokens(): Promise<ZRC20TokenInfo[]> {
        try {
            const tokensData = await this.registry.getAllZRC20Tokens();
            return tokensData.map((token: any) => ({
                active: Boolean(token.active),
                address: String(token.address_),
                symbol: String(token.symbol),
                originChainId: Number(token.originChainId),
                originAddress: ethers.hexlify(token.originAddress),
                coinType: String(token.coinType),
                decimals: Number(token.decimals)
            }));
        } catch (error) {
            console.error('Error fetching ZRC20 tokens:', error);
            return [];
        }
    }
}