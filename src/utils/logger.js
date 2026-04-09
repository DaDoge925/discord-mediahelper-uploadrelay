const { getConfig } = require("./configManager");

module.exports = {
    log: (...args) => {
        const config = getConfig();
        if (!config.silenceLogs) {
            console.log(...args);
        }
    }
};