const { Events, REST, Routes } = require('discord.js');
const { getConfig } = require('../utils/configManager');
const logger = require('../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.log(`Logged in as ${client.user.tag}!`);
        
        // --- 1. Dynamic Status Check ---
        const config = getConfig();
        if (config.invisibleStatusToggle) {
            client.user.setStatus('invisible');
            logger.log('Status set to invisible based on config.');
        }

        // --- 2. Auto-Register Slash Commands ---
        // Extract the raw JSON data from the loaded commands collection
        const commandsData = client.commands.map(command => command.data.toJSON());
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

        // Listen for rate limits and trigger a console warning
        rest.on('rateLimited', (rateLimitInfo) => {
            logger.error(`[RATE LIMIT WARNING] Discord API rate limit hit!`);
            logger.error(`Route: ${rateLimitInfo.route} | Time until reset: ${rateLimitInfo.timeToReset}ms`);
        });

        try {
            logger.log(`Started refreshing ${commandsData.length} application (/) commands.`);

            // Push the commands to Discord globally
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commandsData },
            );

            logger.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            logger.error('Error auto-registering commands:', error);
        }
    },
};