const { ActivityType } = require("discord.js")

module.exports = (client) => {
  client.user.setActivity({
    name: "'Rock, Paper, Scissors'", 
    typ: ActivityType.Playing
  });
};