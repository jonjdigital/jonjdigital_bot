require('dotenv').config();
const Discord = require('discord.js');
const Client = new Discord.Client();
const fs = require('fs');

var prefix = "j";

Client.on('ready', ()=>{
    console.log("Bot Ready, Logged in as "+Client.user.tag)
})

//log any member joins to relevant channel, and adds the Public role if it exists
Client.on("guildMemberAdd", member=>{
    var channel = member.guild.systemChannel;
    if(!channel) {
        return
    }
    var guild = member.guild;
    var role = guild.roles.cache.find(role => role.name === 'Public');7
    if(role){
        // console.log('Public Role = '+role.id)
        member.roles.add(role.id)
    }
    channel.send(`Welcome to JonJDigital's Official server, ${member}. I hope you enjoy your stay, and please follow the rules.`)
})

//log any member leaves to relevant channel
Client.on("guildMemberRemove", member=>{
    var channel = member.guild.systemChannel;
    if(!channel) {
        return
    }
    var user_id = member.id;
    var user = Client.users.fetch(user_id);
    user.then(function(data){
        channel.send(`Welp, looks like ${data.username} has gone :crying_cat_face:. You will be missed`)
    })
})

//public commands
Client.on('message', message => {
    if (message.author === Client.user) return;
    //links, website, connect
})

//admin commands
Client.on('message', message => {
    if (message.author === Client.user) return;
    //ban, warn

    //kick command.
    if (message.content.startsWith(prefix + "kick")) {
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
            }else{
                message.reply("You cannot kick yourself.");
            }
        } else {
            message.reply("You do not have permission to use this command.")
            message.delete();
        }
    }

    //ban length is 7 days, permaban has no limit
    if (message.content.startsWith(prefix + "tempban") || message.content.startsWith(prefix+"ban")) {
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
                        .ban({days: 7,reason: banMsg}) //ban for 7 days
                        .catch(err => {
                            message.channel.send("I was not able to ban <@" + member + ">");
                            console.log("Ban Error: " + err)
                        }).then(res => {
                        console.log("Member banned");
                        message.channel.send("<@"+user.id+"> banned for 7 days. Reason: "+banMsg)
                    });
                }
            }else{
                message.reply("You cannot ban yourself.");
            }
        } else {
            message.reply("You do not have permission to use this command.")
            message.delete();
        }
    }

    if (message.content.startsWith(prefix + "permaban")) {
        var args = message.content.split(' ').slice(1); // All arguments behind the command name with the prefix
        var user = message.mentions.users.first(); // returns the user object if an user mention exists
        var banReason = args.slice(1).join(' '); // Reason of the ban (Everything behind the mention)
        if(!user){
            try{
                if(!message.guid.members.get(args.slice(0,1).join(' '))) throw new Error("Couldn't find a Discord user with that UserID!");
                user = message.guild.members.get(args.slice(0,1).join(' '));
                user = user.user;
            }catch(error){
                return message.reply("Couldn't find a Discord user with that UserID!")
            }
        }
        if(user === message.author) return message.reply("You cannot ban yourself!");
        if(!banReason) message.channel.send("You did not give a reason, so no reason will be saved.")
        if(!message.guild.member(user).bannable) return message.reply("This user cannot be banned, as the bot does not have sufficient priveleges.")

        var member = message.guild.member(user);
        member.ban({reason: banReason}).catch(console.error)

        const banComfEmbed = new Discord.MessageEmbed()
            .setColor('RED')
            .setDescription(`✅ ${user.tag} has been successfully banned! Reason: ${banReason}`);
        message.channel.send({
            embed: banComfEmbed
        })
    }

    //purge defaults to 10 messages if no amount is specified
    if(message.content.startsWith(prefix + "purge")){
        if (message.member.hasPermission("MANAGE_MESSAGES")) {
            var msgArr = [];
            message.delete();
            var args = message.content.split(' ').slice(1);
            var amount = args.join(' ');

            if (!amount) amount = 10;
            if (isNaN(amount)) return message.reply('Arguments must require a number.');

            if (amount > 100) return message.reply('You can`t delete more than 100 messages at once!'); // Checks if the `amount` integer is bigger than 100
            if (amount < 1) return message.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1

            message.channel.messages.fetch({limit: amount}).then(messages => {
                messages.forEach((value, key, map) => {
                    //display date of msg in console
                    var d = new Date();
                    //gets the timestamp from 14 days ago to help calc messages that can be delted
                    var apiDateLimit = d.getDate()-14;
                    var earliestDate = d.setDate(apiDateLimit);
                    //get timestamp of the message
                    var msgDate = new Date(value.createdTimestamp)
                    //get msg id and msg message
                    var msgId = value.id;
                    var msgMessage = value.content;
                    //if msg timestampo - earliest timestamp > 0, add to deletable messages arr
                    if(msgDate - earliestDate > 0) {
                        msgArr.push({id: msgId, msg: msgMessage})
                    }

                })
                //delete each message included in the array
                msgArr.forEach((key) => {
                    message.channel.messages.fetch(key.id).then(msg => msg.delete())
                })

                /**
                 * TO DO - Add feature to log deleted messages to a logs channel
                 * */
            }).catch(error => {
                console.log(error)
            })
        }else{
            return message.reply('You do not have permission to use this command.')
        }
    }

    //add/remove roles from users
    if(message.content.startsWith(prefix+"addrole ")){
        if(message.member.hasPermission("MANAGE_ROLES")){
            var args = message.content.split(" ").slice(1)

            var user = message.mentions.members.first();
            if(!user){
                message.reply("Please mention a valid Server Member.")
            }

            var role = message.mentions.roles.first();
            if(!role){
                message.reply("Please mention a valid Role")
            }

            user.roles.add(role)
        }

    }

    if(message.content.startsWith(prefix+"remrole ")){
        if(message.member.hasPermission("MANAGE_ROLES")){
            var args = message.content.split(" ").slice(1)

            var user = message.mentions.members.first();
            if(!user){
                message.reply("Please mention a valid Server Member.")
            }

            var role = message.mentions.roles.first();
            if(!role){
                message.reply("Please mention a valid Role")
            }

            user.roles.remove(role)
        }

    }

    //add mute & unmute command (add/remove silenced role)

    //add ability to log all mod actions to the logs channel
})

Client.login(process.env.TOKEN);