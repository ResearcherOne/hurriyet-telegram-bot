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
  if(!surplusKeyword) {
    if (storageModule.isKeywordExist(keyword)) {
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
  } else {
    ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");   
  }
});

app.command('iptal', (ctx) => {
	let [cmdName, keyword, surplusKeyword] = ctx.message.text.split(' ');
  if(!surplusKeyword) {
  storageModule.removeUserFromNotificationList(keyword, userId, function(err, result){
		if(!err) {
    	ctx.reply("db sonuc: "+JSON.stringify(result));
		} else {
			ctx.reply("Oops, üzgünüm. Sistemimde bi ariza oldu.");
		}
  });
  } else {
    ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");   
  }
});

app.startPolling()