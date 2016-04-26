/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */


function AlexaSkill(appId) {
    this._appId = appId;
}

AlexaSkill.speechOutputType = {
    PLAIN_TEXT: 'PlainText',
    SSML: 'SSML'
}

AlexaSkill.prototype.requestHandlers = {
    LaunchRequest: function (event, context, response) {
        this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
    },

    IntentRequest: function (event, context, response) {
        this.eventHandlers.onIntent.call(this, event.request, event.session, response);
    },

    SessionEndedRequest: function (event, context) {
        this.eventHandlers.onSessionEnded(event.request, event.session);
        context.succeed();
    }
};

/**
 * Override any of the eventHandlers as needed
 */
AlexaSkill.prototype.eventHandlers = {
    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    onSessionStarted: function (sessionStartedRequest, session) {
    },

    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    onLaunch: function (launchRequest, session, response) {
        throw "onLaunch should be overriden by subclass";
    },

    /**
     * Called when the user specifies an intent.
     */
    onIntent: function (intentRequest, session, response) {
        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    },

    /**
     * Called when the user ends the session.
     * Subclasses could have overriden this function to close any open resources.
     */
    onSessionEnded: function (sessionEndedRequest, session) {
    }
};

/**
 * Subclasses should override the intentHandlers with the functions to handle specific intents.
 */
AlexaSkill.prototype.intentHandlers = {};

AlexaSkill.prototype.execute = function (event, context) {
    try {
        console.log("session applicationId: " + event.session.application.applicationId);

        // Validate that this request originated from authorized source.
        if (this._appId && event.session.application.applicationId !== this._appId) {
            console.log("The applicationIds don't match : " + event.session.application.applicationId + " and "
                + this._appId);
            throw "Invalid applicationId";
        }

        if (!event.session.attributes) {
            event.session.attributes = {};
        }

        if (event.session.new) {
            this.eventHandlers.onSessionStarted(event.request, event.session);
        }

        // Route the request to the proper handler which may have been overriden.
        var requestHandler = this.requestHandlers[event.request.type];
        requestHandler.call(this, event, context, new Response(context, event.session));
    } catch (e) {
        console.log("Unexpected exception " + e);
        context.fail(e);
    }
};

var Response = function (context, session) {
    this._context = context;
    this._session = session;
};

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam.speech
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam.speech || optionsParam
        }
    }
}

Response.prototype = (function () {
    var buildSpeechletResponse = function (options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession: options.shouldEndSession
        };
        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt)
            };
        }
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: "Simple",
                title: options.cardTitle,
                content: options.cardContent
            };
        }
        var returnResult = {
                version: '1.0',
                response: alexaResponse
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }
        return returnResult;
    };

    return {
        tell: function (speechOutput) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                shouldEndSession: true
            }));
        },
        tellWithCard: function (speechOutput, cardTitle, cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: true
            }));
        },
        ask: function (speechOutput, repromptSpeech) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                shouldEndSession: false
            }));
        },
        askWithCard: function (speechOutput, repromptSpeech, cardTitle, cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: false
            }));
        }
    };
})();

//module.exports = AlexaSkill;

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.b24af45c-3cd9-4ae0-8de8-f5eca40af046"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
// var AlexaSkill = AlexaSkill(APP_ID);

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */

var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'ap-northeast-1',
  accessKeyId: 'AKIAI5YUCTXMVWPUHDZQ',
  secretAccessKey: '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'
});
 
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Nutrunner onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Nutrunner onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Amazon Bosch Hackday.";
    var repromptText = "Say hello and state your name to begin your nutrunner training.";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Nutrunner onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "Reset": function (intent, session, response) {
        response.tell("Okay I resetted the Bosch Nexo nutrunner for you. Try again now!");
    },
    "Hello": function (intent, session, response) {
        // response.ask("Welcome new player " + intent.slots.playername.value, "Which nut would you like to fasten?");
		// Call Alex' Lambda Function: newTighteningProcess
		
		console.log('Trying to invoke newTighteningProcess');
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:newTighteningProcess', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: JSON.stringify(intent.slots.playername),
			  Qualifier: '$LATEST'
			};
			
		lambda.invoke(params, function(err, data) {
			  if (err)
			  {
				  console.log(err, err.stack); 
			  }
			  else 
			  {
				  console.log("Result from lambda invocation: "+data);           // successful response
				  response.ask("welcome new player " + intent.slots.playername.value + " which nut would you like to screw?");
				  
				  session.attributes.userId=intent.slots.playername.value;
			  }
			});		
		
    },
    "SelectNut": function (intent, session, response) {
        // response.tell("Start fastening your nuts, begin with this nut now.");
		
		if (!session.userId) {
			response.ask("i do not know you yet. please say hello and state your name.");
			return;
		}
			
		
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:updateNexoProgram', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: JSON.stringify(intent.slots.nutname),
			  Qualifier: '$LATEST'
			};
		lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  // response.tell("welcome new player " + intent.slots.playername.value);
				  // response.tell("Okay i am done loading the new program number " + intent.slots.program);
				  response.tell("Start fastening your nuts, begin with this nut now: " + data.Payload);
				  
				  session.attributes.nut_number=data.Payload;
			  }
			});	
		
    },
    "LoadProgram": function (intent, session, response) {
		// updateNexoProgram
		
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:updateNexoProgram', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: JSON.stringify(intent.slots.programname),
			  Qualifier: '$LATEST'
			};
		lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  // response.tell("welcome new player " + intent.slots.playername.value);
				  response.tell("Okay i am done loading the new program number " + intent.slots.program);
			  }
			});	
    },
    "GetBattery": function (intent, session, response) {
        // Call Bosch IoT Things using JavaScript to retrieve the battery status of Nutrunner from
        //response.tell("Oh my gosh my battery is dieing. please help me and stick a new battery in.");
		
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:getNexoBatteryStatus', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: null,
			  Qualifier: '$LATEST'
			};
			lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  response.tell("Oh my gosh my battery is dieing. please help me and stick a new battery in.");
			  }
			});		
		
    },
    "WhichProgram": function (intent, session, response) {
			var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:getProgramNumber', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: null,
			  Qualifier: '$LATEST'
			};
			lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  response.tell("the nexo is equipped with program number " + data.Payload);
			  }
			});		

    },
    "GetLastJob": function (intent, session, response) {
        
		// evaluateTighteningResult
		
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:evaluateTighteningResult', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: null,
			  Qualifier: '$LATEST'
			};
			lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  response.tell("You have been doing wonderful, keep going");
			  }
			});	
    },
    "GetSummary": function (intent, session, response) {
        // evaluateTighteningResult
		
		var params = {
			  FunctionName: 'arn:aws:lambda:ap-northeast-1:011615027733:function:evaluateTighteningResult', /* should be ARN */
			  ClientContext: null,
			  InvocationType: 'RequestResponse',
			  LogType: 'Tail',
			  Payload: null,
			  Qualifier: '$LATEST'
			};
			lambda.invoke(params, function(err, data) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else {
				  console.log(data);           // successful response
				  response.tell("You have been doing wonderful, keep going");
			  }
			});	
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.tell("Ask me to restart", "Ask me to restart");
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        response.tell("Okay your tightening training has been cancelled. Come back soon and try again.");
    },
    "AMAZON.RepeatIntent": function (intent, session, response) {
        response.tell("Upsi somethign went wrong. Why don't you try again.");
    },
    "AMAZON.StartOverIntent": function (intent, session, response) {
        response.tell("Okay let's try again my son");
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        response.tell("Training session has ended. Come back tomorrow.");
    }
};

var exports = module.exports = { };

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};