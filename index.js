import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@adiwajshing/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import axios from "axios";
import fs from "fs";
import config from "./config.json" assert { type: "json" };

const { ownerName, ownerNumbers, botName, author, photo } = config;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log(`✅ ${botName} Connected!`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";

    // Full menu
    if (body === ".menu" || body === ".help") {
      const menuMsg = `
╭━━★彡 ${botName} 彡★━━╮
┃  𖤓 Prefix: .
┃  𖤓 Name: ${botName}   
┃  𖤓 Creator: ${author}  
╰━━━━━━━━━━━━━╯  
ꕥ *.support* for official group

*🎴 CARDS 🎴*  
┣ ✦ .cards [on/off]  
┣ ✦ .card [index]  
┣ ✦ .ci [name] [tier]  
┣ ✦ .cardinfo [name] [tier]  
┣ ✦ .si [name]  
┣ ✦ .ss [series_name] 
┣ ✦ .slb [series_name]
┣ ✦ .clb
┣ ✦ .deck  
┣ ✦ .col
┣ ✦ .cardshop
┣ ✦ .sellc [index] [price]
┣ ✦ .rc [index]
┣ ✦ .vs
┣ ✦ .claim [id]  
┣ ✦ .sc [@] [index] [price]  
┣ ✦ .tc [@] [index] [index]  
┣ ✦ .lendcard / lc  
┣ ✦ .auction  
┣ ✦ .submit [index] [price]  
┣ ✦ .myauc  
┣ ✦ .remauc [index]
┣ ✦ .listauc  
┗━━━━━━━━━━━  

*🎮 ECONOMY 🎮*  
┣ ✦ .balance / bal  
┣ ✦ .daily  
┣ ✦ .withdraw / wd  
┣ ✦ .deposit / dep  
┣ ✦ .donate 
┣ ✦ .lottery  
┣ ✦ .rich  
┣ ✦ .richg  
┣ ✦ .profile / p  
┣ ✦ .edit  
┣ ✦ .bio [bio]
┣ ✦ .setage [age]
┣ ✦ .inventory / inv  
┣ ✦ .use [item name]  
┣ ✦ .sell [item_name]  
┣ ✦ .shop  
┣ ✦ .dig  
┣ ✦ .fish  
┣ ✦ .leaderboard / lb  
┣ ✦ .roast  
┣ ✦ .gamble  
┣ ✦ .beg  
┗━━━━━━━━━━━  

*🎮 GAMES 🎮*  
┣ ✦ .ttt
┣ ✦ .startbattle
┣ ✦ .akinator / aki
┣ ✦ .greekgod / gg
┣ ✦ .c4
┣ ✦ .wcg
┣ ✦ .chess
┗━━━━━━━━━━━  

*🏰 GUILDS 🏰*
┣ ✦ .guild info  
┣ ✦ .guild create [name]  
┣ ✦ .guild accept  
┣ ✦ .guild decline  
┣ ✦ .guild emblem  
┗━━━━━━━━━━━  

*🎰 GAMBLE 🎰*  
┣ ✦ .slots  
┣ ✦ .cf  
┣ ✦ .dice  
┣ ✦ .db  
┣ ✦ .dp  
┣ ✦ .roulette  
┣ ✦ .horse  
┗━━━━━━━━━━━  

*🐾 PETS 🐾*  
┣ This section is under development.  
┗━━━━━━━━━━━  

*⚔️ RPG ⚔️* 
┣ This section is under development.  
┗━━━━━━━━━━━  

*👤 INTERACTION 👤*  
┣ ✦ .hug  
┣ ✦ .kiss  
┣ ✦ .slap  
┣ ✦ .wave  
┣ ✦ .pat  
┣ ✦ .dance  
┣ ✦ .sad  
┣ ✦ .smile  
┣ ✦ .laugh  
┣ ✦ .lick  
┣ ✦ .punch  
┣ ✦ .jihad  
┣ ✦ .crusade  
┣ ✦ .kill  
┣ ✦ .bonk  
┣ ✦ .fuck  
┣ ✦ .tickle  
┣ ✦ .shrug  
┣ ✦ .wank  
┣ ✦ .kidnap  
┗━━━━━━━━━━━  

*👤 FUN 👤*  
┣ ✦ .gay  
┣ ✦ .lesbian  
┣ ✦ .simp  
┣ ✦ .ship
┣ ✦ .skill  
┣ ✦ .duality 
┣ ✦ .gen 
┣ ✦ .pov 
┣ ✦ .social 
┣ ✦ .relation
┣ ✦ .pp
┣ ✦ .wouldyourather/wyr
┣ ✦ .joke
┣ ✦ .truth
┣ ✦ .dare
┣ ✦ .td
┣ ✦ .uno
┗━━━━━━━━━━━  

*📲 DOWNLOADERS 📲*
┣ ✦ .ig 
┣ ✦ .ttk 
┣ ✦ .yt
┣ ✦ .x
┣ ✦ .fb
┣ ✦ .play
┗━━━━━━━━━━━  

*🔍 SEARCH 🔍*
┣ ✦ .pinterest / pint  
┣ ✦ .sauce / reverseimg  
┣ ✦ .wallpaper 
┣ ✦ .lyrics 
┗━━━━━━━━━━━  

*🤖 Ai 🤖*
┣ ✦ .copilot  
┣ ✦ .gpt 
┣ ✦ .perplexity 
┣ ✦ .imagine 
┣ ✦ .upscale 
┣ ✦ .translate / tt 
┣ ✦ .transcribe / tb
┗━━━━━━━━━━━  

*👤 CONVERTER 👤*
┣ ✦ .sticker / s
┣ ✦ .take
┣ ✦ .toimg
┣ ✦ .tovid
┣ ✦ .rotate
┗━━━━━━━━━━━  

*🎮 ANIME SFW 🎮*   
┣ ✦ .waifu  
┣ ✦ .neko  
┣ ✦ .maid  
┣ ✦ .mori-calliope  
┣ ✦ .raiden-shogun  
┣ ✦ .oppai  
┣ ✦ .selfies  
┣ ✦ .uniform  
┣ ✦ .kamisato-ayaka  
┗━━━━━━━━━━━ 

*🎮 ANIME NSFW 🎮* 
┣ ✦ .nsfw on/off 
┣ ✦ .milf  
┣ ✦ .ass  
┣ ✦ .hentai  
┣ ✦ .oral  
┣ ✦ .ecchi  
┣ ✦ .paizuri  
┣ ✦ .ero  
┣ ✦ .ehentai  
┣ ✦ .nhentai  
┗━━━━━━━━━━━  

*⚙️ ADMIN ⚙️* 
┣ ✦ .kick  
┣ ✦ .delete  
┣ ✦ .antilink  
┣ ✦ .warn @mention [reason]  
┣ ✦ .resetwarn  
┣ ✦ .groupstats / gs  
┣ ✦ .welcome on/off
┣ ✦ .setwelcome  
┣ ✦ .leave on/off  
┣ ✦ .setleave  
┣ ✦ .purge [code]  
┣ ✦ .blacklist add [code]  
┣ ✦ .blacklist remove [code]  
┣ ✦ .blacklist list  
┣ ✦ .promote  
┣ ✦ .demote  
┣ ✦ .mute  
┣ ✦ .unmute  
┣ ✦ .hidetag  
┣ ✦ .tagall  
┣ ✦ .activity  
┣ ✦ .active 
┣ ✦ .inactive 
┣ ✦ .open 
┣ ✦ .close 
┗━━━━━━━━━━━
      `;
      await sock.sendMessage(from, { image: { url: photo }, caption: menuMsg });
    }

    // AI chatbot commands
    if (body.startsWith(".gpt") || body.startsWith(".gemini") || body.startsWith(".imagine") || body.startsWith(".flux")) {
      const question = body.split(" ").slice(1).join(" ");
      if (!question) return sock.sendMessage(from, { text: "❌ Please provide a question or prompt!" });

      try {
        const res = await axios.get(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(question)}&botname=${botName}&ownername=${ownerName}`);
        await sock.sendMessage(from, { text: `🤖 ${res.data.message}` });
      } catch (err) {
        await sock.sendMessage(from, { text: "⚠️ AI service unavailable. Try again later." });
      }
    }

  });
}

connectToWhatsApp();
