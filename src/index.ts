import path from 'path';
import fs from 'fs';

import {NETWORKS} from "./config/networks";
import {RegistryFetcher} from "./fetcher/registryFetcher";
import {AddressesData} from "./types/registry";

async function main(): Promise<void> {
    console.log('Fetching addresses data for all networks...');

    const allAddressesData: AddressesData = {};

    for (const [networkName, networkConfig] of Object.entries(NETWORKS)) {
        try {
            const fetcher = new RegistryFetcher(networkConfig);
            const networkAddressesData = await fetcher.fetchAddressesData();

            Object.entries(networkAddressesData).forEach(([chainId, chainData]) => {
                if (allAddressesData[chainId]) {
                    if (chainData.chainInfo.active || !allAddressesData[chainId].chainInfo.active) {
                        allAddressesData[chainId].chainInfo = chainData.chainInfo;
                    }

                    const existingContractKeys = new Set(
                        allAddressesData[chainId].contracts.map(c => `${c.chainId}-${c.contractType}`)
                    );
                    chainData.contracts.forEach(contract => {
                        const key = `${contract.chainId}-${contract.contractType}`;
                        if (!existingContractKeys.has(key)) {
                            allAddressesData[chainId].contracts.push(contract);
                        }
                    });

                    const existingTokenKeys = new Set(
                        allAddressesData[chainId].zrc20Tokens.map(t => t.address)
                    );
                    chainData.zrc20Tokens.forEach(token => {
                        if (!existingTokenKeys.has(token.address)) {
                            allAddressesData[chainId].zrc20Tokens.push(token);
                        }
                    });
                } else {
                    allAddressesData[chainId] = chainData;
                }
            });
        } catch (error) {
            console.error(`Failed to fetch data for ${networkName}:`, error);
        }
    }

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const addressesPath = path.join(dataDir, 'addresses.json');
    const jsonString = JSON.stringify(allAddressesData, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }, 2);
    fs.writeFileSync(addressesPath, jsonString);

    console.log('✅ Addresses data saved successfully');
}

export * from './types/registry';
export { RegistryFetcher } from './fetcher/registryFetcher';
export { getNetworkConfig, NETWORKS } from './config/networks';
export * from './utils/addressDecoder';

main().catch(console.error);