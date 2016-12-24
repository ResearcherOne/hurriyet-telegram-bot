const Telegraf      = require('telegraf');
const storageModule = require("./lib/storageModule");
let app;

function isValidCommand(cmdName, commandString){
	var parsedCommmand = commandString.split(' ');
	var isValid;
	if(cmdName === "bildirim") {
		isValid =
			parsedCommmand.length == 2 &&
				parsedCommmand[1];
	} else if(cmdName === "iptal") {
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
					storageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
						if(err) throw err;
						if(!isUserFound) {
							storageModule.addToNotificationList(keyword, userId, function(err, result){
								if(!err) {
									ctx.reply(keyword+" bildirim listene eklendi.");
								} else {
									ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
								}
							});
						} else {
							ctx.reply("Oops, bunu zaten takip ediyorsun.");
						}
					});
				} else {
					storageModule.newKeywordWithUser(keyword, userId, function(err, result) {
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
			storageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
				if(err) throw err;
				if(isUserFound) {
					storageModule.removeUserFromNotificationList(keyword, userId, function(err, result){
						if(!err) {
							ctx.reply(keyword+" bildirim listenden çıkarıldı.");
							console.log("db sonuc: "+JSON.stringify(result));
						} else {
							ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
						}
					});
				} else {
					ctx.reply("Oops, takip etmediğin şeyi iptal edemezsin.");
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


module.exports = {
	initializeModule: function(config, callback){
		app = new Telegraf(config.telegram.telegramApiKey);
		storageModule.initializeModule(config.storageConfig.url, config.storageConfig.collectionName, function(err, result){
			let isSucceed = false;
			if(!err) {
				app.startPolling();
				isSucceed = true;
				callback(null, isSucceed);
			} else {
				callback(err, isSucceed);
			}
		});
	},
	sendMessageToUser:function(userId, message) {
		app.telegram.sendMessage(userId, message);
	},
	getUserKeywords: function(){
		return storageModule.getKeywordList();
	},
	getNotificationList: function(keyword, callback) {
		storageModule.getNotificationList(keyword, callback);
	}
};