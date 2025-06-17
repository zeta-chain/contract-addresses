import path from 'path';
import fs from 'fs';

import {getNetworkConfig, NETWORKS} from "./config/networks";
import {RegistryFetcher} from "./fetcher/registryFetcher";
import {RegistryData} from "./types/registry";

async function fetchAndSave(network: string): Promise<void> {
    const networkConfig = getNetworkConfig(network);
    const fetcher = new RegistryFetcher(networkConfig);

    const data = await fetcher.fetchRegistryData();
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, `${network}.json`);
    const jsonString = JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }, 2);
    fs.writeFileSync(filePath, jsonString);

    console.log(`Data saved to ${filePath}`);
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const networkArg = args.find(arg => arg.startsWith('--network='))?.split('=')[1] ||
        (args.includes('--network') ? args[args.indexOf('--network') + 1] : null);

    try {
        if (networkArg) {
            await fetchAndSave(networkArg);
        } else {
            console.log('Fetching data for all networks...');
            for (const network of Object.keys(NETWORKS)) {
                try {
                    await fetchAndSave(network);
                } catch (error) {
                    console.error(`Failed to fetch data for ${network}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

export * from './types/registry';
export { RegistryFetcher } from './fetcher/registryFetcher';
export { getNetworkConfig, NETWORKS } from './config/networks';

export function loadRegistryData (network: string): RegistryData {
    const dataPath = path.join(__dirname, '..', 'data', `${network}.json`);
    if (!fs.existsSync(dataPath)) {
        throw new Error(`No data found for network: ${network}`);
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

if (require.main === module) {
    main().catch(console.error);
}