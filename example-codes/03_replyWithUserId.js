const Telegraf 	= require('telegraf');
const app 			= new Telegraf("315275698:AAF6ED0BY4P2n8PiT0FsddkLREaXLpbxFS0");

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Merhaba!')
})


app.hears('hi', (ctx) => ctx.reply("Your message object: " +ctx.message.from.id));

app.startPolling()