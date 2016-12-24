const appConfig = {
	storageConfig: {
		url: "mongodb://umut:yoyo123@ds145128.mlab.com:45128/hurriyet-hao",
		collectionName: "notificationLists"
	}
};

const Telegraf      = require('telegraf')
const app           = new Telegraf("315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0")
const storageModule = require("./lib/storageModule")

function isValidCommand(cmdName, commandString){
	var parsedCommmand = commandString.split(' ');
	var isValid;
	if(cmdName === "bildirim") { 				//single argument
		isValid =
			parsedCommmand.length == 2 &&
				parsedCommmand[1];
	} else if(cmdName === "iptal") {		//single argument
		isValid =
			parsedCommmand.length == 2 &&
				parsedCommmand[1];
	} else {
		throw new Error("invalid command name.");
	}
		return isValid;
}

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Merhaba!')
});

app.command('bildirim', (ctx) => {
	const userId = ctx.message.from.id;
	const commandString = ctx.message.text;
	let [cmdName, keyword, surplusKeyword] = commandString.split(' ');
	
	if(isValidCommand("bildirim", commandString)){
		storageModule.isKeywordExist(keyword, function(err, isKeyExists) {
			if(!err) {
				if(isKeyExists) {
					//if !userHasKeyword
						storageModule.addToNotificationList(keyword, userId, function(err, result){ //this method also must modify user collection.
							if(!err) {
								ctx.reply(keyword+" bildirim listene eklendi.");
							} else {
								ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
							}
						});
					//else
						//you already has dat keyword
				} else {
					storageModule.newKeywordWithUser(keyword, userId, function(err, result) { //this method also must modify user collection.
						if(!err) {
							ctx.reply(keyword+" bildirim listene eklendi.");
						} else {
							ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
						}
					});
				}
			} else {
				ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
			}
		});
	} else {
		if(!keyword) {
			ctx.reply("Oops, bu komutla beraber bir anahtar kelime girmen gerekiyor.")
		} else if(surplusKeyword) {
			ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");  
		}
	}
});

app.command('iptal', (ctx) => {
	const userId = ctx.message.from.id;
	const commandString = ctx.message.text;
	let [cmdName, keyword, surplusKeyword] = commandString.split(' ');
	
	if(isValidCommand("iptal", commandString)){
		//if userHasKeyword
			storageModule.removeUserFromNotificationList(keyword, userId, function(err, result){ //this method also must modify user collection.
				if(!err) {
					ctx.reply(keyword+" bildirim listenden çıkarıldı.");
					console.log("db sonuc: "+JSON.stringify(result));
				} else {
					ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
				}
			});
		//else
			//you no have dat keyword.
	} else {
		if(!keyword) {
			ctx.reply("Oops, bu komutla beraber bir anahtar kelime girmen gerekiyor.")
		} else if(surplusKeyword) {
			ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");  
		}
	}
});

storageModule.initializeModule(appConfig.storageConfig.url, appConfig.storageConfig.collectionName, function(err, result){
	if(!err) {
		app.startPolling();
		console.log("Application is started, yay!");
	} else {
		throw new Error("Dafuq, unable to initialize storage module.");
	}
});