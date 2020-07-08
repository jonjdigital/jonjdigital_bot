require('dotenv').config();
const Discord = require('discord.js');
const Client = new Discord.Client();

var prefix = "j";

Client.on('ready', ()=>{
    console.log("Bot Ready, Logged in as "+Client.user.tag)
})

//log any member joins to relevant channel
Client.on("guildMemberAdd", member=>{
    var channel = member.guild.systemChannel;
    if(!channel) {
        return
    }
    channel.send(`Welcome to JonJDigital's Official server, ${member}. I hope you enjoy your stay, and please follow the rules.`)
    member.addRole(member.guild.roles.find(role => role.name === "Public"));

})

//log any member leaves to relevant channel
Client.on("guildMemberRemove", member=>{
    var channel = member.guild.systemChannel;
    if(!channel) {
        return
    }
    channel.send(`Welp, looks like ${member} has gone :crying_cat_face:. You will be missed`)

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
                user = message.guild.members.get(args.slice(0,1).joni(' '));
                user = user.user;
            }catch(error){
                return message.reply("Couldn't find a Discord user with that UserID!")
            }
        }
        if(user === message.author) return message.reply("You cannot ban yourself!");
        if(!reason) message.channel.send("You did not give a reason, so no reason will be saved.")
        if(!message.guild.member(user).bannable) return message.reply("This user cannot be banned, as the bot does not have sufficient priveleges.")

        message.guild.ban(user)

        const banComfEmbed = new Discord.RichEmbed()
            .setColor('RED')
            .setDescription(`✅ ${user.tag} has been successfully banned! Reason: ${banReason}`);
        message.channel.send({
            embed: banComfEmbed
        })
        /*if (message.member.hasPermission("BAN_MEMBERS")) {
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
                        .ban({days: 0,reason: banMsg})
                        .catch(err => {
                            message.channel.send("I was not able to ban <@" + member + ">");
                            console.log("Ban Error: " + err)
                        }).then(res => {
                        console.log("Member banned");
                        message.channel.send("<@"+user.id+"> permanently banned. Reason: "+banMsg)
                    });
                }
            }else{
                message.reply("You cannot ban yourself.");
            }
        } else {
            message.reply("You do not have permission to use this command.")
            message.delete();
        }*/
    }
})

Client.login(process.env.BETA_TOKEN);