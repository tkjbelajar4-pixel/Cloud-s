const CONFIG_KEY = 'neverlabs_cloud_config';

function loadCloudinaryConfig() {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function saveCloudinaryConfig(cloudName, uploadPreset, apiKey = '', apiSecret = '', 
                              textCloudName = '', textUploadPreset = '', textApiKey = '', textApiSecret = '') {
    const config = { 
        cloudName, uploadPreset, apiKey, apiSecret,
        textCloudName, textUploadPreset, textApiKey, textApiSecret
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return config;
}

let CLOUDINARY_CONFIG = loadCloudinaryConfig() || { 
    cloudName: '', uploadPreset: '', apiKey: '', apiSecret: '',
    textCloudName: '', textUploadPreset: '', textApiKey: '', textApiSecret: ''
};
