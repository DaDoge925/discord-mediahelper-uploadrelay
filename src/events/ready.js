const { Events } = require('discord.js');
const { getConfig } = require('../utils/configManager');
const logger = require('../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        logger.log(`Logged in as ${client.user.tag}!`);
        
        const config = getConfig();
        if (config.invisibleStatusToggle) {
            client.user.setStatus('invisible');
            logger.log('Status set to invisible based on config.');
        }
    },
};