"use strict";

var request = require('request');
const uuid = require('uuid');
var url="http://localhost:5000/parse?q=";

var RasaRecognizer = function(token){
	console.log("===RasaRecognizer===");
    this.app = "";
};

RasaRecognizer.prototype.recognize = function (context, done){
    var intent = { score: 0.0 };
    try {            
        var sessionId = context.message.address.user.id + context.message.address.channelId;
        if (sessionId.length > 36){
            sessionId = sessionId.slice(0,35);
        }
    } catch(err) {
        var sessionId = uuid();
    }

    if (context.message.text){//some message exist
    	var userText=context.message.text.toLowerCase();
    	console.log("======================userText======================");
    	request(url+userText, function (error, response, body) {
			if (!error&&response.statusCode == 200) {
		  		console.log(body) // Show the HTML for the Google homepage. 
		  		var result = JSON.parse(body);
	            intent = { score: result.intent.confidence, intent: result.intent.name, entities: result["entities"]};
	          	done(null, intent);
	        }
		  	else {
		    	console.log("Error ",error)
		    	done(error);
		    	request.end();
		  	}
		})
	}
    else{
        intent = {score:1, intent:"None",entities:[]};
        done(null, intent);
    }
}

module.exports = RasaRecognizer;
