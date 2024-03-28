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
    name: "rps-bot",
    description: "Play 'rock, paper, scissors' with a bot.",
    dm_permission: false,

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            const embed = new EmbedBuilder()
                .setTitle("Rock, Paper, Scissors!")
                .setDescription(`It's ${interaction.user}'s turn.`)
                .setColor("Blue")
                .setTimestamp(new Date())

            const buttons = choices.map((choice) => {
                return new ButtonBuilder()
                    .setCustomId(choice.name)
                    .setLabel(choice.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(choice.emoji)
            });

            const row = new ActionRowBuilder().addComponents(buttons);

            const reply = await interaction.reply({
                content: `It's ${interaction.user}'s turn now.`,
                embeds: [embed],
                components: [row]
            });

            const initialUserInteraction = await reply.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 15_000,
            }).catch(async (error) => {
                embed.setDescription("You didn't respond in time.")
                await reply.edit({
                    content: "Round stopped.",
                    embeds: [embed],
                    components: []
                });
            });

            if (!initialUserInteraction) return;

            const initialUserChoice = choices.find(
                (choice) => choice.name === initialUserInteraction.customId
            )

            const randomNum = Math.floor(Math.random() * choices.length)
            const randomChoice = choices[randomNum]

            let result;

            if (randomChoice.beats === initialUserChoice.name) {
                result = `Bot won!`
            };

            if (initialUserChoice.beats === randomChoice.name) {
                result = `${interaction.user} won!`
            };

            if (initialUserChoice.name === randomChoice.name) {
                result = `It was a tie!`
            };

            embed.setDescription(
                `**Bot** picked ${randomChoice.name + randomChoice.emoji}\n${interaction.user} picked ${initialUserChoice.name + initialUserChoice.emoji}\n\n**${result}**`
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
