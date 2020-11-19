require('dotenv').config();
const Discord = require('discord.js');
const Client = new Discord.Client({ disableMentions: 'everyone' });
const fs = require('fs');
const emb = new Discord.MessageEmbed();
var dateFormat = require('dateformat');
let db = JSON.parse(fs.readFileSync("./database.json",'utf8'))
var ownerID = 229244232064434177;

const jonjdigitalServerId = "726895718060785744";
const artCafeServerId = "251756539457568772";

var prefix = process.env.prefix;

var bannedWords = [
    'anal','ballsack','bastard','bitch','biatch','blowjob','blow job','bollock','bollok','boner','buttplug','clitoris','cock','coon','cunt','dick','dildo','dyke','fag','fellate','fellatio','felching','fudgepacker','fudge packer', 'flange', 'homo', 'jizz', 'knobend', 'knob end', 'labia', 'muff', 'penis', 'piss', 'prick', 'pube', 'pussy', 'scrotum', 'sex', 's hit', 'sh1t', 'slut', 'smegma', 'spunk', 'tit', 'tosser', 'turd', 'twat', 'vagina', 'wank', 'whore'
]

var instantBanWords = [
    'nigga','nigger','queer'
]

function levelling(message) {
    // if the user is not on db add the user and change his values to 0
    if (!db[message.author.id]) db[message.author.id] = {
        xp: 0,
        level: 0
    };
    db[message.author.id].xp++;
    let userInfo = db[message.author.id];
    if (userInfo.xp > (100 * userInfo.level)) {
        userInfo.level++
        userInfo.xp = 0
        message.channel.send(message.author.username + ", Congratulations, you levelled up to level " + userInfo.level)
    }
    const args = message.content.slice(prefix).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd === prefix + "info") {
        var info = db[message.author.id];
        let member = message.mentions.members.first();
        let memberInfo = db[member.id]
        if (member && memberInfo) {
            // message.channel.send(embed);
            let embed2 = new Discord.MessageEmbed()
                .setTitle("Profile For: " + member.user.username)
                .setThumbnail(member.user.avatarURL())
                .setColor(0x4286f4)
                .addField("Level", memberInfo.level)
                .addField("XP", memberInfo.xp + "/100")
            return message.channel.send(embed2)
        }else if(member && (memberInfo == null)) {
            return message.channel.send("User has no levels as they have not spoken yet.")
        }
        // console.log(message.author)
        let level = 100 * info.level;
        let embed = new Discord.MessageEmbed()
            .setThumbnail(message.author.avatarURL())
            .setColor(0x4286f4)
            .addField("Level", info.level)
            .addField("XP", info.xp + "/" + level);
        // if(!member) return message.channel.send(embed)
        return message.channel.send(embed)
        // console.log(member)

    }
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
    });
}

function banner(message,reason) {
    msgReason = `You have been banned from ${message.guild.name} for: ${reason}`
    // console.log(reason)
    var member = message.guild.members.cache.get(message.author.id);

    var msg = emb
        .setColor('#d95136')
        .setTitle("You have been Banned!")
        .setThumbnail(message.guild.iconURL())
        .addField("Important!",msgReason)
        .setTimestamp()

    if(member.bannable) {
        message.author.send(emb)
            .then(
                member.ban({reason: "Using banned word: " + reason })
                    // .then(console.log)
                    .catch()
            )
            .catch(
            member.ban({reason: "Using banned word: " + reason })
                // .then(console.log)
                .catch()
        )
    }
    return message.delete()
}


function wordCheck (message) {
    var content = message.content.toLowerCase().split(" ")
    content.forEach(element => {
        if(instantBanWords.includes(element)){
            var user = message.author
            if(message.guild.member(user).bannable){
                banner(message,"Using an instant bannable word in a message.")
            }else{
                message.reply("Please watch your language.")
                message.delete()
            }

        }else if(bannedWords.includes(element)){
            message.reply("Please watch your language.")
            message.delete()
        }
    })
}

Client.on('ready', ()=>{
    console.log("Bot Ready, Logged in as "+Client.user.tag)
})

function logModAction(message,action){
    var msg = new Discord.MessageEmbed()
    var logs = message.guild.channels.cache.find(channel => channel.name === 'logs')
    if(action.type === "purge"){
        msg.setColor('#32a887')
            .setTitle('Purge Command Used')
            .setAuthor(action.user.username)
            .setThumbnail(action.user.avatar)
        action.values.reverse()
        action.values.forEach(function(element){
            if(element.msg == ""){
                element.msg = "No Text, Possible Image or Embed"
            }
            var data = element.author + ": " + element.msg
            msg.addField(element.date, data)
        })
        logs.send(msg)
    }
}

//log any member joins to relevant channel, and adds the Public role if it exists
Client.on("guildMemberAdd", member=>{
    var guild = member.guild;
    var channel = guild.systemChannel;
    if(!channel) {
        return
    }
    // console.log(guild.id)


        if (guild.id === jonjdigitalServerId) {
            var role = guild.roles.cache.find(role => role.name === 'Public');


            if (role) {
                // console.log('Public Role = '+role.id)
                member.roles.add(role.id)
            }
            if(member.id !="691346983494877216") {
                channel.send(`Welcome to JonJDigital's Official server, ${member}. I hope you enjoy your stay, and please follow the rules.`)
            }
        } else if (guild.id === artCafeServerId) {
            var mortalRole = guild.roles.cache.find(role => role.name === 'Mortals');
            if (mortalRole) {
                member.roles.add(mortalRole.id)
            }
            var djRole = guild.roles.cache.find(role => role.name === 'DJ');
            if (djRole) {
                member.roles.add(djRole.id)
            }
            if(member.id !="691346983494877216") {
                channel.send(`Welcome to the ArtCafé ${member}. I hope you enjoy your stay, and please follow the rules.`)
            }
        }
})

//log any member leaves to relevant channel
Client.on("guildMemberRemove", member=>{
    if(member.id !="691346983494877216") {
        var channel = member.guild.systemChannel;
        if (!channel) {
            return
        }
        var user_id = member.id;
        var user = Client.users.fetch(user_id);
        user.then(function (data) {
            channel.send(`Welp, looks like ${data.username} has gone :crying_cat_face:. You will be missed`)
        })
    }
})

Client.on('message', message => {
    if (message.author.id === Client.user.id) return;
    levelling(message);
    // banner(message,message.content)
    wordCheck(message)

    /**
     * PUBLIC COMMANDS
     */
    //links, website, connect

    /**
     *ADMIN COMMANDS
     */

    //kick command.
    if (message.content.toLowerCase().startsWith(prefix + "kick")) {
        if(message.guild != null) {
            if (message.member.hasPermission("KICK_MEMBERS")) {
                var user = message.mentions.users.first();
                var member = message.guild.member(user);
                var content = message.content.split(" ");
                if (message.author.id !== user.id) {
                    //remove command and user from msg
                    content.shift();
                    content.shift();
                    if (content.length < 1) {
                        var kickMsg = "No Kick Message Provided."
                    } else {
                        var kickMsg = content.join(" ")
                    }
                    if (member) {
                        member
                            .kick(kickMsg)
                            .catch(err => {
                                message.channel.send("I was not able to kick <@" + member + ">");
                                console.log("Kick Error: " + err)
                            }).then(res => {
                            console.log("Member kicked");
                            message.channel.send("Member kicked")
                        });
                    }
                } else {
                    message.reply("You cannot kick yourself.");
                }
            } else {
                message.reply("You do not have permission to use this command.")
                message.delete();
            }
        }
    }

    //ban length is 7 days, permaban has no limit
    if (message.content.toLowerCase().startsWith(prefix + "tempban") || message.content.startsWith(prefix+"ban")) {
        if(message.guild != null) {
            if (message.member.hasPermission("BAN_MEMBERS")) {
                var user = message.mentions.users.first();
                var member = message.guild.member(user);
                var content = message.content.split(" ");
                if (message.author.id !== user.id) {
                    //remove command and user from msg
                    content.shift();
                    content.shift();
                    if (content.length < 1) {
                        var banMsg = "No reason provided."
                    } else {
                        var banMsg = content.join(" ")
                    }
                    if (member) {
                        member
                            .ban({days: 7, reason: banMsg}) //ban for 7 days
                            .catch(err => {
                                message.channel.send("I was not able to ban <@" + member + ">");
                                console.log("Ban Error: " + err)
                            }).then(res => {
                            console.log("Member banned");
                            message.channel.send("<@" + user.id + "> banned for 7 days. Reason: " + banMsg)
                        });
                    }
                } else {
                    message.reply("You cannot ban yourself.");
                }
            } else {
                message.reply("You do not have permission to use this command.")
                message.delete();
            }
        }
    }

    if (message.content.toLowerCase().startsWith(prefix + "permaban")) {
        if(message.guild != null) {
            var args = message.content.split(' ').slice(1); // All arguments behind the command name with the prefix
            var user = message.mentions.users.first(); // returns the user object if an user mention exists
            var banReason = args.slice(1).join(' '); // Reason of the ban (Everything behind the mention)
            if (!user) {
                try {
                    if (!message.guid.members.get(args.slice(0, 1).join(' '))) throw new Error("Couldn't find a Discord user with that UserID!");
                    user = message.guild.members.get(args.slice(0, 1).join(' '));
                    user = user.user;
                } catch (error) {
                    return message.reply("Couldn't find a Discord user with that UserID!")
                }
            }
            if (user === message.author) return message.reply("You cannot ban yourself!");
            if (!banReason) message.channel.send("You did not give a reason, so no reason will be saved.")
            if (!message.guild.member(user).bannable) return message.reply("This user cannot be banned, as the bot does not have sufficient priveleges.")

            var member = message.guild.member(user);
            member.ban({reason: banReason}).catch(console.error)

            const banComfEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(`✅ ${user.tag} has been successfully banned! Reason: ${banReason}`);
            message.channel.send({
                embed: banComfEmbed
            })
        }
    }

    //purge defaults to 10 messages if no amount is specified
    if(message.content.toLowerCase().startsWith(prefix + "purge")) {
        if (message.guild != null) {
            if (message.member.hasPermission("MANAGE_MESSAGES")) {
                var msgArr = [];
                // message.delete();
                var args = message.content.split(' ').slice(1);
                var amount = args.join(' ');

                if (!amount) amount = 10;
                if (isNaN(amount)) return message.reply('Arguments must require a number.');

                if (amount > 100) {
                    message.reply('You can`t delete more than 100 messages at once!');
                    return message.delete()
                } // Checks if the `amount` integer is bigger than 100
                if (amount < 1) return message.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1

                message.channel.messages.fetch({limit: amount}).then(messages => {
                    messages.forEach((value, key, map) => {
                        //display date of msg in console
                        var d = new Date();
                        //gets the timestamp from 14 days ago to help calc messages that can be delted
                        var apiDateLimit = d.getDate() - 14;
                        var earliestDate = d.setDate(apiDateLimit);
                        //get timestamp of the message
                        var msgDate = new Date(value.createdTimestamp)
                        //get msg id and msg message
                        var msgId = value.id;
                        var msgMessage = value.content;
                        //if msg timestampo - earliest timestamp > 0, add to deletable messages arr
                        if (msgDate - earliestDate > 0) {
                            msgArr.push({
                                id: msgId,
                                msg: msgMessage,
                                date: dateFormat(msgDate),
                                author: value.author.username
                            })
                        }
                    })
                    //delete each message included in the array
                    msgArr.forEach((key) => {
                        message.channel.messages.fetch(key.id).then(msg => msg.delete())
                    })
                    var action = {
                        'type': 'purge',
                        'values': msgArr,
                        'user': {
                            'id': message.author.id,
                            'username': message.author.username,
                            'avatar': message.author.avatarURL()
                        },
                        'channel': message.channel.name
                    }
                    logModAction(message, action)
                }).catch(error => {
                    console.log(error)
                })
            } else {
                return message.reply('You do not have permission to use this command.')
            }
        }
    }

    //add/remove roles from users
    if(message.content.toLowerCase().startsWith(prefix+"addrole ")){
        if(message.guild != null) {
            if (message.member.hasPermission("MANAGE_ROLES")) {
                // var args = message.content.split(" ").slice(1)
                var user = message.mentions.members.first();
                if (!user) {
                    message.reply("Please mention a valid Server Member.")
                }
                var role = message.mentions.roles.first();
                if (!role) {
                    message.reply("Please mention a valid Role")
                }
                message.delete()
                user.roles.add(role)
            } else {
                message.delete()
                message.reply("You do not have permission to use this command.")
            }
        }
    }

    if(message.content.toLowerCase().startsWith(prefix+"remrole ")){
        if(message.member.hasPermission("MANAGE_ROLES")){
            var args = message.content.split(" ").slice(1)
            var user = message.mentions.members.first();
            if(!user){
                message.reply("Please mention a valid Server Member.")
            }
            var role = message.mentions.roles.first();
            if(!role) {
                message.reply("Please mention a valid Role")
            }
            message.delete()
            user.roles.remove(role)
        }else{
            message.delete()
            message.reply("You do not have permission to use this command.")
        }

    }

    //add mute & unmute command (add/remove silenced role)

    //add ability to log all mod actions to the logs channel
})

Client.login(process.env.TOKEN);