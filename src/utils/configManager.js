const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');

function getConfig() {

    delete require.cache[require.resolve('../../config.json')];
    return require('../../config.json');
}

function updateConfig(key, value) {
    const config = getConfig();
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

module.exports = { getConfig, updateConfig };