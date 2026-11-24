const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
  new SlashCommandBuilder()
    .setName("anunt")
    .setDescription("Posteaza un anunt formatat in marketplace")
    .addStringOption((opt) =>
      opt.setName("titlu").setDescription("Titlul anuntului").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("descriere").setDescription("Descrierea scurta").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("pret").setDescription("Ex: $100,000").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("telefon").setDescription("Numarul de contact").setRequired(true)
    )
    .addAttachmentOption((opt) =>
      opt
        .setName("imagine")
        .setDescription("Incarca o poza direct din telefon")
        .setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`Botul ${client.user.tag} este online si comanda /anunt este activa!`);
  } catch (err) {
    console.error("Eroare la inregistrarea comenzii:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "anunt") return;

  const titlu = interaction.options.getString("titlu");
  const descriere = interaction.options.getString("descriere");
  const pret = interaction.options.getString("pret");
  const telefon = interaction.options.getString("telefon");
  const imagine = interaction.options.getAttachment("imagine");

  const embed = new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle(titlu)
    .setDescription(descriere)
    .addFields(
      { name: "Pret", value: pret, inline: false },
      { name: "Telefon", value: telefon, inline: false }
    )
    .setFooter({ text: "Nexo Marketplace" })
    .setTimestamp();

  if (imagine) {
    embed.setImage(imagine.url);
  }

  await interaction.reply({ embeds: [embed] });
});

client.login(TOKEN);
