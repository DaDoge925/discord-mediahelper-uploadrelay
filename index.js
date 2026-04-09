const { Client, GatewayIntentBits, Partials } = require('discord.js');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const config = require('./config.json');
const env = require('dotenv').config();

function hstartBot4() {

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.partial) {
    try { oldMessage = await oldMessage.fetch(); }
    catch (err) {
      console.error('Failed to fetch old message:', err);
      return;
    }
  }

  // Ignore self-edits or content-identical edits
  if (newMessage.author.id === client.user.id || oldMessage.content === newMessage.content) {
    return;
  }
/*
  // Your logging…
  console.log('--- Edited Message Detected ---');
  console.log(`Author: ${newMessage.author.tag}`);
  console.log(`Channel: #${newMessage.channel.name}`);
  console.log(`Old Content: ${oldMessage.content}`);
  console.log(`New Content: ${newMessage.content}`);
  console.log('-------------------------------');
*/
  // Regexes
// Matches: [`filename`](https://mh.lurc.cc/upload/...)
const videoUrlRegex = /\[`?([^\]]+?)`?\]\((https:\/\/mh\.lurc\.cc\/upload\/[^\s\)]+)\)/;

// Matches: [View original](<https://...>) or [View original](https://...)
const originalUrlRegex = /\[View original\]\(<?(https?:\/\/[^\s>]+)>?\)/;


  const videoMatch    = newMessage.content.match(videoUrlRegex);
  const originalMatch = newMessage.content.match(originalUrlRegex);
/*
  console.log(
    `Video regex match result: ${videoMatch ? 'Found a match!' : 'No match found.'}`
  );
  console.log(
    `Original URL regex match result: ${originalMatch ? 'Found a match!' : 'No match found.'}`
  );
*/
  if (!(videoMatch && originalMatch)) {
    console.log('Could not find both video and original URLs. Aborting.');
    return;
  }

  const [, fileName, videoUrl] = videoMatch;
  const [, originalUrl]        = originalMatch;
/*
  console.log(`Extracted video URL: ${videoUrl}`);
  console.log(`Extracted original URL: ${originalUrl}`);
  console.log(`Extracted filename: ${fileName}`);
*/
  // Find the target channel
  const targetChannel = client.channels.cache.get(config.uploadChannelId);
  if (!targetChannel) {
    console.error('Target channel not found! Check your config.json file.');
    return;
  }

  // Download + upload
  const filePath = path.join(__dirname, fileName);
  const fileStream = fs.createWriteStream(filePath);

//  console.log('Starting video download...');
  https
    .get(videoUrl, (response) => {
      response.pipe(fileStream);
      fileStream.on('finish', async () => {
        fileStream.close();
     //   console.log('Video downloaded successfully.');

        const messageContent = `-# \`${fileName}\` <${originalUrl}>`;
        await targetChannel.send({
          content: messageContent,
          files: [filePath]
        });
  //      console.log(`Video uploaded to #${targetChannel.name}.`);

        fs.unlinkSync(filePath);
    //    console.log('Temporary file deleted.');
      });
    })
    .on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error('Error downloading file:', err.message);
    });
});

client.login(TOKEN);
}

module.exports = hstartBot4;
