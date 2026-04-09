const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const { updateConfig } = require(path.join(__dirname, '../../utils/configManager.js'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('searchchannel')
        .setDescription('Updates the channel ID to search within.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Select the target channel')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        
        updateConfig('searchChannelId', channel.id);
        
        await interaction.reply({ content: `Search channel successfully updated to <#${channel.id}>.`, ephemeral: true });
    },
};