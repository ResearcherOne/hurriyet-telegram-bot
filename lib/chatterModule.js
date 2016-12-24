const Telegraf      				= require('telegraf');
const chatterStorageModule 	= require("./chatterStorageModule");
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

var initializeCommandHandlers = function() {
	app.command('start', (ctx) => {
		console.log('start', ctx.from)
		ctx.reply('Merhaba!')
	});

	app.command('bildirim', (ctx) => {
		console.log("YIYI");
		const userId = ctx.message.from.id;
		const commandString = ctx.message.text;
		let [cmdName, keyword, surplusKeyword] = commandString.split(' ');

		if(isValidCommand("bildirim", commandString)){
			console.log("yep, it is valid");
			
			let isKeyExists = chatterStorageModule.isKeywordExist(keyword);
			if(isKeyExists) {
				console.log("till here");
				chatterStorageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
					if(err) throw err;
					if(!isUserFound) {
						chatterStorageModule.addToNotificationList(keyword, userId, function(err, result){
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
				console.log("woah here");
				chatterStorageModule.newKeywordWithUser(keyword, userId, function(err, result) {
					if(!err) {
						ctx.reply(keyword+" bildirim listene eklendi.");
					} else {
						ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
					}
				});
			}
		} else {
			console.log("nop, it is not valid");
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
				chatterStorageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
					if(err) throw err;
					if(isUserFound) {
						chatterStorageModule.removeUserFromNotificationList(keyword, userId, function(err, result){
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
	app.startPolling();
}



module.exports = {
	initializeModule: function(telegramApiKey, mongoUrl, notificationListName, keywordListName, callback){
		app = new Telegraf(telegramApiKey);
		chatterStorageModule.initializeModule(mongoUrl, notificationListName, keywordListName, function(err, result){
			let isSucceed = false;
			if(!err) {
				initializeCommandHandlers();
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
		return chatterStorageModule.getKeywordList();
	},
	getNotificationList: function(keyword, callback) {
		console.log("chatterModule - getNotificationList");
		chatterStorageModule.getNotificationList(keyword, callback);
	}
};