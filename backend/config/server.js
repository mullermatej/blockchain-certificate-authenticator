// config/server.js
// Central place for backend config (Node/CommonJS)

let warned = false;

function read(key) {
  return process.env[key];
}

function getConfig() {
  // Accept both the new RPC_URL and legacy PROVIDER_URL (back-compat)
  const rpc = read("RPC_URL") || read("PROVIDER_URL") || "";

  const cfg = {
    chainId: Number(read("CHAIN_ID")) || 80002,
    rpcUrl: rpc,
    contractAddress: (read("CONTRACT_ADDRESS") || "").trim(),
    port: Number(read("PORT")) || 3001,
    nodeEnv: read("NODE_ENV") || "development",
    corsOrigin: read("CORS_ORIGIN") || "http://localhost:5173",
  };

  // Non-fatal: warn if you haven’t deployed yet
  if (!cfg.contractAddress && !warned) {
    warned = true;
    console.warn(
      "[config] CONTRACT_ADDRESS missing — backend will accept it later."
    );
  }

  return Object.freeze(cfg);
}

export default { getConfig };
