function read(key) {
	return import.meta?.env?.[key] ?? undefined;
}

let warned = false;

export function getConfig() {
	const cfg = {
		chainId: Number(read('VITE_CHAIN_ID')) || 80002,
		rpcUrl: read('VITE_RPC_URL') || '',
		contractAddress: (read('VITE_CONTRACT_ADDRESS') || '').trim(),
		backendUrl: (read('VITE_BACKEND_URL') || 'http://localhost:3001').trim(),
	};

	if (!cfg.contractAddress && !warned) {
		warned = true;
		console.warn('[config] VITE_CONTRACT_ADDRESS missing — frontend will accept it later.');
	}

	return Object.freeze(cfg);
}
