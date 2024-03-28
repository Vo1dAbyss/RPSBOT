const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require("discord.js")

const choices = [
    {
        name: "Rock",
        emoji: "🪨",
        beats: "Scissors",
    },
    {
        name: "Paper",
        emoji: "📄",
        beats: "Rock",
    },
    {
        name: "Scissors",
        emoji: "✂️",
        beats: "Paper",
    },
]

module.exports = {
    name: "rps",
    description: "Play 'rock, paper, scissors' with another user.",
    dm_permission: false,
    options: [
        {
            name: "user",
            description: "The user you want to play with.",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            const targetUser = interaction.options.get("user");

            if (interaction.user.id === targetUser.user.id) {
                interaction.reply({
                    content: "❌ You cannot play 'rock, paper, scissors' with yourself!",
                    ephemeral: true,
                });

                return;
            }

            if (targetUser.user.bot) {
                interaction.reply({
                    content: "❌ You cannot play 'rock, paper, scissors' with a bot!",
                    ephemeral: true,
                });

                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Rock, Paper, Scissors!")
                .setDescription(`Waiting for round to be accepted...`)
                .setColor("Blue")
                .setTimestamp(new Date())

            const buttons = choices.map((choice) => {
                return new ButtonBuilder()
                    .setCustomId(choice.name)
                    .setLabel(choice.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(choice.emoji)
            });

            const startButton = new ButtonBuilder()
                .setCustomId("Accept")
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success)
                .setEmoji("✔")
          
            const startRow = new ActionRowBuilder().addComponents(startButton);
          
            const row = new ActionRowBuilder().addComponents(buttons);

            const reply = await interaction.reply({
                content: `${targetUser.user}, you have been challenged to a game of 'Rock, Paper, Scissors' by ${interaction.user}! To start playing, click "Accept" button.`,
                embeds: [embed],
                components: [startRow]
            });

            const initialInteraction = await reply.awaitMessageComponent({
                filter: (i) => i.user.id === targetUser.user.id,
                time: 30_000
            }).catch(async (error) => {
                embed.setDescription(`Game over! ${targetUser.user} did not accept in time.`)
                await reply.edit({ 
                  content: "Round stopped.",
                  embeds: [embed], 
                  components: [] })
            });

            if (initialInteraction) {
              embed.setDescription(`It's currently ${targetUser.user}'s turn.`)
              await reply.edit({
                content: "Game started!",
                embeds: [embed], 
                components: [row]
              })
            } else {
              return;
            }

            const targetUserInteraction = await reply.awaitMessageComponent({
                filter: (i) => i.user.id === targetUser.user.id,
                time: 30_000
            }).catch(async (error) => {
                embed.setDescription(`Game over! ${targetUser.user} did not accept in time.`)
                await reply.edit({ 
                  content: "Round stopped.",
                  embeds: [embed], 
                  components: [] 
                });
            });

            if (!targetUserInteraction) return;

            const targetUserChoice = choices.find(
                (choice) => choice.name === targetUserInteraction.customId
            );

            await targetUserInteraction.reply({
                content: `You picked ${targetUserChoice.name + targetUserChoice.emoji}`,
                ephemeral: true
            });

            // Edit embed with user turn
            embed.setDescription(`It's currently ${interaction.user}'s turn.`);

            await reply.edit({
                content: `${interaction.user}, it's your turn now.`,
                embeds: [embed]
            });

            const initialUserInteraction = await reply.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 30_000
            }).catch(async (error) => {
                embed.setDescription(`Game over! ${interaction.user} did not respond in time.`)
                await reply.edit({ 
                  content: "Round stopped.",
                  embeds: [embed], 
                  components: [] 
                });
            });

            if (!initialUserInteraction) return;

            const initialUserChoice = choices.find(
                (choice) => choice.name === initialUserInteraction.customId
            );

            let result;

            if (targetUserChoice.beats === initialUserChoice.name) {
                result = `${targetUser.user} won!`
            };

            if (initialUserChoice.beats === targetUserChoice.name) {
                result = `${interaction.user} won!`
            };

            if (initialUserChoice.name === targetUserChoice.name) {
                result = `It was a tie!`
            };

            embed.setDescription(
                `${targetUser.user} picked ${targetUserChoice.name + targetUserChoice.emoji}\n${interaction.user} picked ${initialUserChoice.name + initialUserChoice.emoji}\n\n**${result}**`
            );

            await reply.edit({
                embeds: [embed],
                components: [],
            });
        } catch (error) {
            console.error("Error with rps!: " + error)
        }
    }
}
