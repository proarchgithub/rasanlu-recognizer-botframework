var restify = require('restify');
var builder = require('botbuilder');

var istorage= require('./lib/IStorageClient');
var azure = require('./lib/AzureBotStorage.js');
var conf = require('./config/conf.js');

//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3980, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId:conf.appId,
    appPassword:conf.appPass
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var Rasarecognizer = require('./lib/RasaRecognizer.js');
RasarecognizerObj=new Rasarecognizer();
var dialog = new builder.IntentDialog({ recognizers: [RasarecognizerObj] });//pass here Rasa Recognizer instead of luis
var intents = new builder.IntentDialog();

//Store session and context into mnongodb
var docDbClient = new istorage.IStorageClient();
var tableStorage = new azure.AzureBotStorage({ gzipData: false },docDbClient);
var bot = new builder.UniversalBot(connector)//.set('storage', tableStorage);//set your storage here
bot.use(builder.Middleware.dialogVersion({ version: 3.0, resetCommand: /^reset/i }));

bot.dialog('/',dialog);

dialog.matches('welcomeDialog','welcomeDialog');
bot.dialog('welcomeDialog', [
    function (session, args, next) {
      
      var username=session.message.user.name;
      session.send("hello %s",username); 
      session.endConversation();   
    }
]);

dialog.matches('pleasantries','pleasantries');
bot.dialog('pleasantries', [
    function (session, args, next) {
       session.send("i am fine");
       session.endConversation();     
    }    
]);

dialog.onDefault([
    function (session, args, next) {
        session.send("sorry i didn't understand command,you are in default dialog");
        session.endConversation();
    }
])        

