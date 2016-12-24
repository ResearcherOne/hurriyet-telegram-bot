const Telegraf 	= require('telegraf');
const app 			= new Telegraf("315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0");

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Merhaba!')
})

app.command('bildirim', (ctx) => {
	let [cmdName, keyword, surplusKeyword] = ctx.message.text.split(' ');
  console.log('\n message', JSON.stringify(ctx.message));
  if(surplusKeyword) {
    ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");   
  } else {
    ctx.reply("here it is: "+surplusKeyword);
  }
})

app.command('iptal', (ctx) => {
	let [cmdName, keyword, surplusKeyword] = ctx.message.text.split(' ');
	console.log('\n message', ctx.message.text)
  if(surplusKeyword) {
    ctx.reply("Oops, bu komut tek anahtar kelime kabul ediyor.");   
  } else {
    ctx.reply("here it is: "+surplusKeyword);
  }
})

app.startPolling()