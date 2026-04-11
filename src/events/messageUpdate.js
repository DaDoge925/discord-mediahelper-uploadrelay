const { Events } = require('discord.js');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../utils/configManager');
const logger = require('../utils/logger');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (oldMessage.partial) {
            try { 
                oldMessage = await oldMessage.fetch(); 
            } catch (err) {
                logger.error('Failed to fetch old message:', err);
                return;
            }
        }
        const mediaHelperDiscordId = '1026547091121655808';
        if (
            newMessage.author.id !== mediaHelperDiscordId ||
            newMessage.author.id === newMessage.client.user.id ||
            oldMessage.content === newMessage.content
        ) {
            return;
        }

        const videoUrlRegex = /\[`?([^\]]+?)`?\]\((https:\/\/mh\.lurc\.cc\/upload\/[^\s\)]+)\)/;
        const originalUrlRegex = /\[View original\]\(<?(https?:\/\/[^\s>]+)>?\)/;

        const videoMatch = newMessage.content.match(videoUrlRegex);
        const originalMatch = newMessage.content.match(originalUrlRegex);

        if (!(videoMatch && originalMatch)) {
            return;
        }

        const [, fileName, videoUrl] = videoMatch;
        const [, originalUrl] = originalMatch;

        const config = getConfig();
        const targetChannel = newMessage.client.channels.cache.get(config.uploadChannelId);
        
        if (!targetChannel) {
            logger.error('Target channel not found! Check your config.json file.');
            return;
        }

        // It is safer to store temp files outside of the source tree
        const filePath = path.join(__dirname, '../../', fileName);
        const fileStream = fs.createWriteStream(filePath);

        https.get(videoUrl, (response) => {
            response.pipe(fileStream);
            fileStream.on('finish', async () => {
                fileStream.close();

                const messageContent = `-# \`${fileName}\` <${originalUrl}>`;
                await targetChannel.send({
                    content: messageContent,
                    files: [filePath]
                });

                fs.unlinkSync(filePath);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            logger.error('Error downloading file:', err.message);
        });
    },
};