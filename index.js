const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
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
  new SlashCommandBuilder()
    .setName("panel-ticket")
    .setDescription("Trimite panoul de tickete cu meniu derulant")
    .addStringOption((opt) =>
      opt
        .setName("logo")
        .setDescription("Link direct catre logo (optional)")
        .setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`Botul ${client.user.tag} este online si comenzile sunt active!`);
  } catch (err) {
    console.error("Eroare la inregistrarea comenzilor:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "anunt") {
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
      return;
    }

    if (interaction.commandName === "panel-ticket") {
      const logoUrl = interaction.options.getString("logo");

      const panelEmbed = new EmbedBuilder()
        .setColor(0xfacc15)
        .setAuthor({ name: "NEXO MARKETPLACE • TICKETE" })
        .setTitle("NEXO MARKETPLACE - TICKETE")
        .setDescription(
          "Alege categoria potrivita din meniul de mai jos.\n\n" +
            "🛡️ **RECLAMATII STAFF**\n" +
            "🔒 **CERERE UNBAN**\n" +
            "❗ **RECLAMATIE JUCATOR**\n" +
            "📋 **ALTELE**\n\n" +
            "Deschide un ticket doar cand ai toate detaliile pregatite."
        )
        .setFooter({ text: "Nexo Marketplace • Suport" })
        .setTimestamp();

      if (logoUrl) {
        panelEmbed.setThumbnail(logoUrl);
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_ticket_category")
        .setPlaceholder("Alege categoria ticketului")
        .addOptions(
          {
            label: "RECLAMATII STAFF",
            value: "reclamatii_staff",
            emoji: "🛡️",
          },
          {
            label: "CERERE UNBAN",
            value: "cerere_unban",
            emoji: "🔒",
          },
          {
            label: "RECLAMATIE JUCATOR",
            value: "reclamatie_jucator",
            emoji: "❗",
          },
          {
            label: "ALTELE",
            value: "altele",
            emoji: "📋",
          }
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
      await interaction.reply({
        content: "Panoul de tickete a fost trimis.",
        ephemeral: true,
      });
      return;
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "select_ticket_category") {
    const selectedValue = interaction.values[0];
    const cleanUsername = interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 15);

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${cleanUsername || "user"}`,
      type: ChannelType.GuildText,
      parent:https:1574406033848270888
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
          ],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor(0xfacc15)
      .setTitle("Ticket deschis")
      .setDescription(
        `Salut <@${interaction.user.id}>! Ai deschis un ticket la categoria **${selectedValue.replace("_", " ").toUpperCase()}**.`
      )
      .setFooter({ text: "Nexo Marketplace" })
      .setTimestamp();

    await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed] });
    await interaction.reply({
      content: `Ticketul tau a fost creat: ${ticketChannel}`,
      ephemeral: true,
    });
  }
});

client.login(TOKEN);
