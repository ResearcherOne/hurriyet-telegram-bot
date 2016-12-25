const Telegraf      				= require('telegraf');
const chatterStorageModule 	= require("./chatterStorageModule");
const lowerCase 						= require('lower-case');

let app;
let _latestNewsRequestReceived;
let _fetchRequestReceived;
let _isMonitorModeOn = true;
let _adminIdList = [160010038, 262637366];

function _pushAdminNotification(message) {
	if(_isMonitorModeOn) {
		_sendMessageToAdmins("SYSTEM NOTIFICATION: "+message);
	}
}

function _isSysAdmin(userId) {
	var isAdmin = false;
	_adminIdList.forEach(function(adminId){
		if(userId == adminId)
			isAdmin = true;
	});
	return isAdmin;
}

function _sendMessageToAdmins(message) {
	_adminIdList.forEach(function(adminId){
			_sendMessageToUser(adminId, message);
		});
}

function _sendMessageToUser(userId, message) {
	app.telegram.sendMessage(userId, message);
}

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
	} else if(cmdName === "listele") {
		isValid =
			parsedCommmand.length == 1;
	} else if(cmdName === "gecmis") {
		isValid =
			parsedCommmand.length == 1 &&
				parsedCommmand[1];
	} else if(cmdName === "yardim") {
		isValid =
			parsedCommmand.length == 1;
	} else {
		throw new Error("invalid command name.");
	}
		return isValid;
}


var initializeCommandHandlers = function() {
	app.command('perish_news_cache', (ctx) => {
		const userId = ctx.message.from.id;
		if (_isSysAdmin(userId)) {
			//chatterStorageModule.perishDb();
			let a = chatterStorageModule.perishCollection("newsDataCollection");
			let b = chatterStorageModule.perishCollection("newsIdCollection");
			if (a && b)
				ctx.reply("News cache is successfully perished.");
			else
				ctx.reply("Oops, error occoured during the process. I am so sorry :(");
		}
	});
	
	app.command('help', (ctx) => {
		const userId = ctx.message.from.id;
		if (_isSysAdmin(userId)) {
			ctx.reply("Commands \n" +
								"* perish_news_cache \n" +
								"* toggle_monitor_mode \n" +
								"* fetch_news [newsCount] \n" +
								"* help \n"
							 );
		}
	});
	
	app.command('toggle_monitor_mode', (ctx) => {
		const userId = ctx.message.from.id;
		if (_isSysAdmin(userId)) {
			_isMonitorModeOn = !_isMonitorModeOn;
			if(_isMonitorModeOn)
				ctx.reply("Monitor mode is on");
			else
				ctx.reply("Monitor mode is off");
		}
	});
	
	app.command('fetch_news', (ctx) => {
		const userId = ctx.message.from.id;
		if (_isSysAdmin(userId)) {
			const commandString = lowerCase(ctx.message.text, 'tr');
			let [cmdName, newsCount] = commandString.split(' ');
			if(_fetchRequestReceived) {
				_fetchRequestReceived(newsCount);
			} else {
				console.log("_fetchRequestReceived ERROR");
			}
			ctx.reply("I'll fetch latest "+newsCount);
		}
	});

	/*
	const userId = ctx.message.from.id;
		const commandString = lowerCase(ctx.message.text, 'tr');
		let [cmdName, keyword, surplusKeyword] = commandString.split(' ');
	*/
	
	app.command('start', (ctx) => {
		const userId = ctx.message.from.id;
		chatterStorageModule.createEmptyProfile(userId, function(err, result){
		if(!err) {
			ctx.reply('Merhaba, ben hurriyet bot. Sana şu komutlar aracalığı ile yardımcı olabilirim:' +
								"\n /bildirim anahtarKelime" +
								"\n /iptal anahtarKelime" +
								"\n /bildirimlerim" +
								"\n /sondakika" +
								"\n /yardim");
		} else {
			ctx.reply("Merhaba, ben hurriyet bot. Şu anda sistemimde bir ariza var daha sonra tekrar /start komutunu çalıştırmayı dener misin?");
		}
		});
	});
	
	app.command('yardim', (ctx) => {
		ctx.reply('Sana şu komutlar aracalığı ile yardımcı olabilirim:' +
						 	"\n /bildirim anahtarKelime" +
						 	"\n /iptal anahtarKelime" +
						 	"\n /bildirimlerim" +
						 	"\n /sondakika" +
						 	"\n /yardim");
	});
	
	app.command('bildirimlerim', (ctx) => {
		const userId = ctx.message.from.id;
		chatterStorageModule.getSpecificUserKeywords(userId, function(err, keywordList){
			if(!err) {
				let message = "Takip ettiğin kelimeler: \n";
				if(keywordList.length === 0) {
					message += "* Hiç";
				} else {
					keywordList.forEach(function(keyword){
						message += "* "+keyword+"\n";
					});	
				}
				ctx.reply(message);	
			} else {
				ctx.reply("Oops, sistemimde bir ariza oldu :(");	
			}
		});
	});
	
	app.command('sondakika', (ctx) => {
		const userId = ctx.message.from.id;
		if(_latestNewsRequestReceived) {
			_latestNewsRequestReceived(userId);
		}
	});

	app.command('bildirim', (ctx) => {
		const userId = ctx.message.from.id;
		const commandString = lowerCase(ctx.message.text, 'tr');
		let [cmdName, keyword, surplusKeyword] = commandString.split(' ');

		if(isValidCommand("bildirim", commandString)){
			let isKeyExists = chatterStorageModule.isKeywordExist(keyword);
			if(isKeyExists) {
				chatterStorageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
					if(err) throw err;
					if(!isUserFound) {
						chatterStorageModule.addToNotificationList(keyword, userId, function(err, result){
							if(!err) {
								chatterStorageModule.addKeywordToUserProfile(keyword, userId, function(err, result){
									if (!err)
										ctx.reply(keyword+" bildirim listene eklendi.");
									else
										ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
								});
							} else {
								ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
							}
						});
					} else {
						ctx.reply("Oops, bunu zaten takip ediyorsun.");
					}
				});
			} else {
				chatterStorageModule.newKeywordWithUser(keyword, userId, function(err, result) {
					if(!err) {
						chatterStorageModule.addKeywordToUserProfile(keyword, userId, function(err, result){
									if (!err)
										ctx.reply(keyword+" bildirim listene eklendi.");
									else
										ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
								});
					} else {
						ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
					}
				});
			}
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
		const commandString = lowerCase(ctx.message.text, 'tr');
		let [cmdName, keyword, surplusKeyword] = commandString.split(' ');

		if(isValidCommand("iptal", commandString)){
				chatterStorageModule.isUserInNotificationList(keyword, userId, function(err, isUserFound) {
					if(err) throw err;
					if(isUserFound) {
						chatterStorageModule.removeUserFromNotificationList(keyword, userId, function(err, result){
							if(!err) {
								chatterStorageModule.removeKeywordFromUserProfile(keyword, userId, function(err, result){
									if(!err)
										ctx.reply(keyword+" bildirim listenden çıkarıldı.");
									else
										ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
								});
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
	initializeModule: function(telegramApiKey, mongoUrl, notificationListName, keywordListName, userCollectionName, callback){
		app = new Telegraf(telegramApiKey);
		chatterStorageModule.initializeModule(mongoUrl, notificationListName, keywordListName, userCollectionName, function(err, result){
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
		_sendMessageToUser(userId, message);
	},
	getUserKeywords: function(){
		return chatterStorageModule.getKeywordList();
	},
	getNotificationList: function(keyword, callback) {
		console.log("chatterModule - getNotificationList");
		chatterStorageModule.getNotificationList(keyword, callback);
	},
	setLatestNewsRequestReceivedCallback: function(callback) {
		_latestNewsRequestReceived = callback;
	},
	pushAdminNotification: function(message) {
		_pushAdminNotification(message);
	},
	setFetchRequestReceivedCallback: function(callback) {
		_fetchRequestReceived = callback;
	}
};