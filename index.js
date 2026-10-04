const path = require('path');
// Force dotenv to read from the absolute path of this directory
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message]
});

// Setup a Collection to store commands
client.commands = new Collection();

// Load Commands dynamically using absolute paths
const commandsPath = path.join(__dirname, 'src', 'commands', 'slash');
// Ensure the directory exists to prevent crash on first run
if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => {
    const filePath = path.join(commandsPath, file);
    const stat = fs.statSync(filePath);
    const ext = path.extname(file);

    return stat.isFile() && (ext === '.js' || ext === '.cjs' || ext === '');
});

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load Events dynamically using absolute paths
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Log in
client.login(process.env.DISCORD_BOT_TOKEN);