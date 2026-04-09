const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateConfig } = require('../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uploadchannel')
        .setDescription('Updates the channel ID where videos are uploaded.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Select the target channel')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks), 
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        
        // Save to config.json
        updateConfig('uploadChannelId', channel.id);
        
        // Plain text response
        await interaction.reply({ content: `Upload channel successfully updated to <#${channel.id}>.`, ephemeral: true });
    },
};