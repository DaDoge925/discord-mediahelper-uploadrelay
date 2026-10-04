const { Events } = require('discord.js');
const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');

const VOICE_CHANNEL_ID = '1406993445049995434';
const RECONNECT_DELAY_MS = 5000;

let reconnectTimer = null;
let targetGuildId = null;
const watchedConnections = new WeakSet();

function log(message) {
    console.log(`[hjoinvoicechat] ${message}`);
}

function scheduleReconnect(client) {
    if (reconnectTimer) return;

    log(`Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectToVoiceChannel(client);
    }, RECONNECT_DELAY_MS);
}

async function connectToVoiceChannel(client) {
    let channel;
    try {
        channel =
            client.channels.cache.get(VOICE_CHANNEL_ID) ||
            (await client.channels.fetch(VOICE_CHANNEL_ID));
    } catch (error) {
        log(`Failed to fetch channel ${VOICE_CHANNEL_ID}: ${error.message}`);
        scheduleReconnect(client);
        return;
    }

    if (!channel || !channel.isVoiceBased()) {
        log(`Channel ${VOICE_CHANNEL_ID} is missing or not a voice channel.`);
        scheduleReconnect(client);
        return;
    }

    targetGuildId = channel.guild.id;
    log(`Joining "${channel.name}" (${channel.id})...`);

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: true,
    });

    if (watchedConnections.has(connection)) return;
    watchedConnections.add(connection);

    connection.on(VoiceConnectionStatus.Ready, () => {
        log('Connected and ready.');
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        log('Disconnected; checking whether the connection is recovering...');
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5000),
            ]);
            log('Connection is recovering on its own.');
        } catch {
            log('Connection did not recover; destroying it before retrying.');
            connection.destroy();
        }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
        log('Voice connection destroyed.');
        scheduleReconnect(client);
    });

    connection.on('error', (error) => {
        log(`Voice connection error: ${error.message}`);
    });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        client.on(Events.VoiceStateUpdate, (oldState, newState) => {
            if (
                newState.id !== client.user?.id ||
                (targetGuildId && newState.guild.id !== targetGuildId) ||
                newState.channelId === VOICE_CHANNEL_ID
            ) {
                return;
            }

            log('Moved out of the target voice channel; returning shortly.');
            scheduleReconnect(client);
        });

        connectToVoiceChannel(client);
    },
};
