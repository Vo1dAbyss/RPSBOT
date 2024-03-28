require("dotenv").config();

const { Client, IntentsBitField } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

const express = require(`express`);

const server = express();

server.all(`/`, (req, res) => {
    res.send(`RPS! secret website!`)
})

server.listen(3000, () => { console.log(`Website ready!`) })

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ]
});

eventHandler(client);

client.login(process.env.TOKEN);