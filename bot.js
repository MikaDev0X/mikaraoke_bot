//load the discord library
const Discord = require('discord.js');

// load filesystem management libaries
const fs = require('fs');
const createIfNotExist = require("create-if-not-exist");

// array containing the current karaoke list
var karaokeList = new Array();

// remove function for a specific entry
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// string replace all
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// display list function
function displayList(karaokeList, channelID) {
    // write the json backup file (used when the bot is disconnected/restarting)
    var json = JSON.stringify(karaokeList);
    fs.writeFile('./queues/'+channelID+'_karaokeList.json', json, 'utf8', function(err){ if(err) throw err; });
    
    // display list and commands
    if (typeof karaokeList !== 'undefined' && karaokeList.length > 0) {
        var singerList = "<@" + karaokeList.toString().replaceAll(",",">\n<@") + ">";
        // nicknames override
        //singerList = singerList.replaceAll("147817084162670592>","147817084162670592> [Bamboo Eater]");
        
        bot.channels.get(channelID).send("**__Karaoke list:__** \n\n"+singerList+"\n\n**__Commands:__**\n\n**!join** or **!1** : join the list / entrer en file d'attente\n**!leave** or **!q** : leave the list / quitter\n**!next** or **!!** to pass your turn / passer votre tour\n**!rejoin** or **!!1** : next+requeue/ suivant+rechanter en fin de liste\n**!list** or **!l** : display the current queue / affiche la file d'attente").catch(function() {
              //Something
             });
    } else {
        bot.channels.get(channelID).send("**__Karaoke list:__** \n\n*The list is empty / La liste est vide*\n\n**__Commands:__**\n\n**!join** or **!1** : join the list / entrer en file d'attente\n**!leave** or **!q** : leave the list / quitter\n**!next** or **!!** to pass your turn / passer votre tour\n**!rejoin** or **!!1** : next+requeue / suivant+rechanter en fin de liste\n**!list** or **!l** : display the current queue / affiche la file d'attente").catch(function() {
              //Something
             });
    }
}

// load configuration
const config = require('./config.json');

// initialize Discord Bot
const bot = new Discord.Client();

// event
bot.on('ready', () => {

    console.log('Logged in as: ' + bot.user.username + ' (id: ' + bot.user.id + ')');

});

bot.on('message', message => {
    
    // ignore bot messages
    if (message.author.bot) {
        return;
    }
    
    // ignore messages which don't start with command prefixes
    if ((message.content.indexOf(config.prefix) !== 0) && (message.content.indexOf(config.prefix_master) !== 0) &&
        (message.content.indexOf(config.prefix_addroles) !== 0) && (message.content.indexOf(config.prefix_delroles) !== 0)) return;
    
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with prefix.config 
    if (message.content.indexOf(config.prefix) == 0) {

        // ignore if the channel name don't start with karaoke        
        if (message.channel.name.indexOf("karaoke") == -1) return;

        // get arguments and convert command to lowercase
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        var channelID = message.channel.id;
        var userID = message.author.id;
       
        // check if karaoke list file for this channel exists, create empty list if not
        createIfNotExist('./queues/' + channelID + '_karaokeList.json', '[]');

        // get karaoke list for this channel
        var data = fs.readFileSync('./queues/' + channelID + '_karaokeList.json', 'utf8');
        karaokeList = JSON.parse(data);

        switch(cmd) {
            case '1':
            case 'join':
                if (karaokeList.includes(userID)) {
                    message.reply("You can only join once! / Vous ne pouvez être qu'une fois dans la liste!").catch(function() {
                        //Something
                    });
                } else {
                    karaokeList.push(userID);
                    displayList(karaokeList, channelID);
                }
            break;

            case 'q':                
            case 'leave':                
                karaokeList.remove(userID);
                displayList(karaokeList, channelID);                
            break;

            case '!':
            case 'next':
                if (karaokeList[0]==userID) {
                    karaokeList.shift();
                    displayList(karaokeList, channelID);                    
                } else {
                    message.reply("Only the current singer can use the this command / Seul le chanteur actuel peut utiliser cette commande").catch(function() {
                        //Something
                    });;
                }
            break;   
 
            case '!1':
            case 'rejoin':
                if (karaokeList[0]==userID) {
                    karaokeList.shift();
                    karaokeList.push(userID);
                    displayList(karaokeList, channelID);                    
                } else {
                    message.reply("Only the current singer can use the this command / Seul le chanteur actuel peut utiliser cette commande").catch(function() {
                        //Something
                    });;
                }
            break;   
           
            case 'help':
            case 'list':
            case 'l':
                displayList(karaokeList, channelID);                
            break;        
        }
    }
   
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `#!`
    if (message.content.indexOf(config.prefix_master) == 0) {
        // get arguments and convert command to lowercase
        const args = message.content.slice(config.prefix_master.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        var channelID = message.channel.id;
        var userID = message.author.id;

        if (userID == "107976208779608064") {
            switch(cmd) {
                case 'reset':
                    var optionalChannelID = channelID;
                    if (args[0]) {
                        optionalChannelID=args[0];
                        // get karaoke list for this channel
                        var data = fs.readFileSync('./queues/' + optionalChannelID + '_karaokeList.json', 'utf8');
                        karaokeList = JSON.parse(data);
                    }
                    for (var i = karaokeList.length; i > 0; i--) {
                        karaokeList.shift();
                    }
                    displayList(karaokeList, optionalChannelID);
                break;
                case 'say':
                    var outputChannelID = channelID;
                    var outputMessage=message.content.slice(config.prefix_master.length).trim().slice(cmd.length+args[0].length+2);
                    if (args[0]) {
                        outputChannelID = args[0];
                    }
                    bot.channels.get(outputChannelID).send(outputMessage);
                    message.reply('"'+outputMessage+'" sent to channel '+ bot.channels.get(outputChannelID).name).catch(function() {
                        //Something
                    });;
                break;
                case 'kick':
                    var optionalChannelID = channelID;
                    if (args[1]) {
                        optionalChannelID=args[1];
                        // get karaoke list for this channel
                        var data = fs.readFileSync('./queues/' + optionalChannelID + '_karaokeList.json', 'utf8');
                        karaokeList = JSON.parse(data);
                    }

                    if (karaokeList.indexOf(args[0]) !== -1) {
                        karaokeList.remove(args[0]);
                        bot.channels.get(optionalChannelID).send("<@"+args[0]+">" + " has been kicked... / a été expulsé(e)...");
                        displayList(karaokeList, optionalChannelID);
                    } else {
                        message.reply("This person is not in the karaoke list! / Cette personne n'est pas dans la liste!").catch(function() {
                            //Something
                        });;
                    }
                break;
            }
        } else {
            message.reply("Sorry, you don't have permissions to use this! / Désolé, vous ne pouvez pas utiliser cette commande!").catch(function() {
                //Something
            });;
        }
        
    }

    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `+`
    if (message.content.indexOf(config.prefix_addroles) == 0) {
        
        if (message.channel.name.indexOf("role") == -1) return;
        
        // get arguments and convert command to lowercase
        const args = message.content.slice(config.prefix_addroles.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        var member = message.member;
        var role;

        switch(cmd) {
            // Add the role
            case 'mixeur':
                role = message.guild.roles.find("name", "Mixeur");
                member.addRole(role);
                message.delete(5000);
            break;
            case 'animateur':
                role = message.guild.roles.find("name", "Animateur");
                member.addRole(role);
                message.delete(5000);
            break;
            case 'dessinateur':
                role = message.guild.roles.find("name", "Dessinateur");
                member.addRole(role);
                message.delete(5000);
            break;
            case 'musicien':
                role = message.guild.roles.find("name", "Musicien");
                member.addRole(role);
                message.delete(5000);
            break;
            case 'chanteur':
                role = message.guild.roles.find("name", "Chanteur");
                member.addRole(role);
                message.delete(5000);
            break;
        }

        console.log(message.author.username+" +"+cmd);
    }

    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `-`
    if (message.content.indexOf(config.prefix_delroles) == 0) {
        // get arguments and convert command to lowercase
        const args = message.content.slice(config.prefix_delroles.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        var member = message.member;
        var role;

        switch(cmd) {
            case 'mixeur':
                role = message.guild.roles.find("name", "Mixeur");
                member.removeRole(role);
                message.delete(5000);
            break;
            case 'animateur':
                role = message.guild.roles.find("name", "Animateur");
                member.removeRole(role);
                message.delete(5000);
            break;
            case 'dessinateur':
                role = message.guild.roles.find("name", "Dessinateur");
                member.removeRole(role);
                message.delete(5000);
            break;
            case 'musicien':
                role = message.guild.roles.find("name", "Musicien");
                member.removeRole(role);
                message.delete(5000);
            break;
            case 'chanteur':
                role = message.guild.roles.find("name", "Chanteur");
                member.removeRole(role);
                message.delete(5000);
            break;
        }

        console.log(message.author.username+" -"+cmd);
    }

});

// bot login
bot.login(config.token).catch(err => console.log(err));
