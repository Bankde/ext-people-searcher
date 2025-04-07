// Singleton for managing URL configurations
class ConfigManager {
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        this.configs = {};  // { "First Last": Person }

        ConfigManager.instance = this;
    }

    // Load configurations from storage
    async loadConfigs() {
        try {
            const data = await browser.storage.local.get("configs");
            if (data.configs) {
                this.configs = data.configs;
            }
        } catch (error) {
            console.error("Error loading configs:", error);
        }
    }

    // Save configurations to storage
    async saveConfigs() {
        try {
            await browser.storage.local.set({ configs: this.configs });
        } catch (error) {
            console.error("Error saving configs:", error);
        }
    }

    // Set individual configuration by key
    setConfig(key, value) {
        this.configs[key] = value;
        console.log(`Config ${key} set to ${value}`);
    }

    // Get individual configuration by key
    getConfig(key) {
        return this.configs[key];
    }

    // Parse and return URL list
    parseUrls() {
        if (this.configs.urls) {
            return this.configs.urls.split("\n").map(url => url.trim());
        }
        return [];
    }
}