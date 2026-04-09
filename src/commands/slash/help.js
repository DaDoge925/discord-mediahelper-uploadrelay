const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands and bot information.'),
    async execute(interaction) {
        // Create the Embed
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF) // Professional Blue
            .setTitle('discord-video-uploadrelay help')
            .setDescription('Welcome! Here is a list of commands you can use with this bot.')
            .addFields(
                { name: '`/searchchannel`', value: ': Set the source channel.\n`/uploadchannel`: Set the destination channel.', inline: false },
                { name: '`/help`', value: ': Shows this menu.', inline: false },
                { name: 'ℹ️ Information', value: 'This bot monitors message edits to capture and mirror video content automatically.', inline: false }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Send the embed as the response
        await interaction.reply({ embeds: [helpEmbed] });
    },
};