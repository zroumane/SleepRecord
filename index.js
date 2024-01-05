import 'dotenv/config'
import { Telegraf, Telegram } from 'telegraf'
import { message } from 'telegraf/filters'
import { MongoClient } from 'mongodb'

let client
let users
let records
let telegram
let bot
let registerState = 0

const countdown = (id, cb) => {
	setTimeout(() => {
		if (registerState != 0) {
			telegram.sendMessage(id, 'Time out')
			cb()
		}
	}, 30 * 1000)
}

const run = async () => {
  try {
  	// client = new MongoClient(process.env.URI)
  	// const database = client.db('sleep_record')
  	// users = database.collection('users')
  	// records = database.collection('records')

    telegram = new Telegram(process.env.TOKEN)
		bot = new Telegraf(process.env.TOKEN)
  	
  	bot.launch()
  } 
  catch (err) {
  	console.dir(err)
    if (client) await client.close()
    if (bot) {
			telegram.sendMessage(process.env.ADMIN, 'Bot Quitting')
			bot.stop()
		}
		process.exit()	
  }
}

await run()

const registered = (id) => {
	return id == process.env.ADMIN
}

bot.start((ctx) => ctx.reply('👋'))
bot.help((ctx) => ctx.reply('👋'))

bot.command('register', (ctx) => {
	if (ctx.from.id == process.env.ADMIN) {
		ctx.reply('Waiting for contact')
		registerState = 1
		countdown(ctx.from.id, () => { registerState = 0 })
	}
	else ctx.reply('Not allowed')
})

bot.command('unregister', (ctx) => {
	if (ctx.from.id == process.env.ADMIN) {
		ctx.reply('Waiting for contact')
		registerState = 2
		countdown(ctx.from.id, () => { registerState = 0 })
	}
	else ctx.reply('Not allowed')
})

bot.command('awake', (ctx) => {
	if (registered(ctx.from.id)) {
		ctx.reply('Record Sleep')
	}
	else ctx.reply('Not allowed')
})

bot.command('awake', (ctx) => {
	if (registered(ctx.from.id)) {
		ctx.reply('Record Awake')
	}
	else ctx.reply('Not allowed')
})

bot.on(message(), (ctx) => {
	if (ctx.update.message.contact && ctx.from.id == process.env.ADMIN) {
		let id = ctx.update.message.contact.id
		let name = ctx.update.message.contact.first_name
		if (registerState == 1) {
			ctx.reply('registering ' + name)
			registerState = 0
		}
		else if (registerState == 2) {
			ctx.reply('unregistering' + name)
			registerState = 0
		}
	}
})
