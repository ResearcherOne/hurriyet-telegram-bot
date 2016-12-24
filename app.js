const appConfig = {
	storageConfig: {
		url: "mongodb://umut:yoyo123@ds145128.mlab.com:45128/hurriyet-hao",
		collectionName: "notificationLists"
	}
};

const Telegraf      = require('telegraf')
const app           = new Telegraf("315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0")
const storageModule = require("./lib/storageModule")

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Merhaba!')
});

app.command('bildirim', (ctx) => {
	let [cmdName, keyword, surplusKeyword] = ctx.message.text.split(' ');
  console.log('\n message', JSON.stringify(ctx.message));
	userId = ctx.message.from.id;
  if(!surplusKeyword && keyword !== undefined) {
    if (storageModule.isKeywordExist(keyword, function(err, result) {
			if(!err) {
				storageModule.addToNotificationList(keyword, userId, function(err, result){
					if(!err) {
						ctx.reply(keyword+" bildirim listene eklendi.");
						console.log("db sonuc: "+JSON.stringify(result));
					} else {
						ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
					}
				});
			} else {
				storageModule.newKeywordWithUser(keyword, userId, function(err, result) {
					if(!err) {
						ctx.reply(keyword+" bildirim listene eklendi.");
						console.log("db sonuc: "+JSON.stringify(result));
					} else {
						ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
					}
				});
			}
		}));
  } else {
		if(keyword === undefined) {
			ctx.reply("Oops, bu komutla beraber bir anahtar kelime girmen gerekiyor.")
		} else if(surplusKeyword) {
			ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");  
		}
  }
});

app.command('iptal', (ctx) => {
	let [cmdName, keyword, surplusKeyword] = ctx.message.text.split(' ');
	userId = ctx.message.from.id;
  if(!surplusKeyword) {
  storageModule.removeUserFromNotificationList(keyword, userId, function(err, result){
		if(!err) {
    	ctx.reply(keyword+" bildirim listenden çıkarıldı.");
			console.log("db sonuc: "+JSON.stringify(result));
		} else {
			ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
		}
  });
  } else {
    ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");   
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