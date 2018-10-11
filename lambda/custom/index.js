/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const _ = require('lodash');
const rocketFacts = require('./rocket-facts.js');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

const s3BucketUrl = 'https://mkwebserver.s3.amazonaws.com/my-rocket-kit';

const SKILL_NAME = 'My Rocket Kit';
const ACTIONS = [
    '"build rocket"',
    '"build rocket" or "launch rocket"',
    '"build rocket", "launch rocket", or "get rocket fact"',
    '"build rocket", "launch rocket", or "get rocket fact"',
    '"build rocket", "launch rocket", "get rocket fact", or "get safety code"',
    '"build rocket", "launch rocket", "get rocket fact", "get safety code", or "get info"'
];

function getLaunchMsg(level) {
    if (level === 0) {
        return `Welcome to your rocket kit where you can build and launch virtual model rockets.  
        Successful launches allow you to advance skill levels and unlock new features.  To get started say ${ACTIONS[0]}.`
    } else if (level === 5) {
        return 'Welcome back.  Say "help" if you need it.'
    } else {
        return `Welcome back to your rocket kit.  To get started, say ${ACTIONS[level]}.`;
    }
}

function getLaunchReprompt(level) {
    return `Say ${ACTIONS[level]} to get started.`;
}

function getHelp(level) {
    return `You can say ${ACTIONS[level]}.`;
}

function getBuildRocketCompleteMsg(level, numFins, noseConeShape, color) {
    const description = `It has ${numFins} fins, a ${noseConeShape} nose cone, and is painted ${color}.`;
    if (level === 0) {
        return `Congratulations, you have finished your first rocket. ${description} 
            For your rocket's first test flight you will be using an "A" engine.  It has a \
            small amount of propellent that provides two point five newton seconds of thrust.  
            To launch your rocket, countdown from five and say "ignition"`;
    } else {
        return `Congratulations, you have finished your rocket. ${description} 
            To launch your rocket, count down from five and say "liftoff"`;
    }
}

function getLaunchRocketCompleteMsg(level) {
    const engineA = `Your rocket launches into the sky leaving a thin trail of smoke behind it.  
        It reaches an altitude of 270 feet or 82 meters using your "A" test engine.`;
    const engineB = `Your rocket climbs high into the sky and reaches an altitude of 570 feet or 174 meters using your "B" engine.`;
    const engineC = `Your rocket climbs so high into the sky that it is difficult to see.  
        It reaches an altitude of over 1100 feet or 335 meters using your "C" engine.`;
    const engineSkillLevels = [engineA, engineB, engineB, engineC, engineC, engineC];
    const LAUNCH_ROCKET_COMPLETE_BASE_MESSAGE = `<audio src="${s3BucketUrl}/sounds/model-rocket-launch.mp3"/>  
        ${engineSkillLevels[level]} An ejection charge pops the nose cone off and your parachute deploys.  
        Your rocket safely falls back to earth where you recover it for another flight.`;
    const LAUNCH_ROCKET_COMPLETE_MESSAGE = `${LAUNCH_ROCKET_COMPLETE_BASE_MESSAGE} Congratulations on a successful flight!`;
    const launchRocketCompleteMsgs = [
        `${LAUNCH_ROCKET_COMPLETE_BASE_MESSAGE}  Congratulations on your first successful flight!
            You have achieved Skill Level one and have unlocked a new "B" engine which is twice as powerful as your previous "A" engine.
            It delivers five newton seconds of thrust.
            Your progress has been saved.  Say ${ACTIONS[1]} to continue.`,
        `${LAUNCH_ROCKET_COMPLETE_MESSAGE} You have achieved Skill Level two and unlocked the rocket fact feature. Say "get rocket fact" to try it.
            Your progress has been saved.`,
        `${LAUNCH_ROCKET_COMPLETE_MESSAGE} You have achieved Skill Level three and unlocked the "C" engine. It is twice as powerful as a "B" engine. 
            It provides ten newton seconds of thrust.
            Your progress has been saved.  Say ${ACTIONS[3]} to continue.`,
        `${LAUNCH_ROCKET_COMPLETE_MESSAGE} You have achieved Skill Level four and unlocked the rocket safety code feature.  This is a list of safety codes \n
            recommended by the National Association of Rocketry.  Say "get safety code" to use it.`,
        `${LAUNCH_ROCKET_COMPLETE_MESSAGE} You have achieved Skill Level five, the highest skill level you can get.  Nice work!
            You have unlocked the "get info" feature where you can find out how to continue your journey as a budding rocket scientist. 
            You can say ${ACTIONS[5]}.`,
        `${LAUNCH_ROCKET_COMPLETE_MESSAGE} You can say ${ACTIONS[5]}.`
    ];
    return launchRocketCompleteMsgs[level];
}

const REPROMPT = `Say "build rocket" or "launch rocket" to continue or "exit" to signoff.`;
const RESET = 'Your user data has been reset.';
const STOP_MESSAGE = 'Leaving My Rocket Kit!';

const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({ tableName : 'MyRocketKitUsers', createTable: true })

const requiredSlots = [
    'NumberOfFins',
    'NoseConeShape',
    'Color',
    'Stickers',
    'Window'
];

function getImage(desc, url) {
    const image = new Alexa.ImageHelper()
        .withDescription(desc)
        .addImageInstance(url)
        .getImage();
    return image;
}

function richTextMaker(primaryText, secondaryText, tertiaryText) {
    const myTextContent = new Alexa.RichTextContentHelper();

    if (primaryText)
        myTextContent.withPrimaryText(primaryText);

    if (secondaryText)
        myTextContent.withSecondaryText(secondaryText);

    if (tertiaryText)
        myTextContent.withTertiaryText(tertiaryText);

    return myTextContent.getTextContent();
}

function supportsDisplay(handlerInput) {
    var hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    return hasDisplay;
}

function getLevel(attributes) {
    if ((Object.keys(attributes).length === 0) || (typeof attributes.level === 'undefined') || (attributes.level < 1)) {
        attributes.level = 0;
        return 0;
    } else if ((typeof attributes.level !== 'undefined') && (attributes.level >= 1)) {
        return attributes.level;
    }
}

async function getAttributes(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const attributes = await attributesManager.getPersistentAttributes() || {};
    if (!attributes.hasOwnProperty('level') || (typeof attributes.level !== 'number')) {
        attributes.level = 0;
        await setSaveAttributes(handlerInput, attributes);
    }
    return attributes;
}

async function setSaveAttributes(handlerInput, attributes) {
    const attributesManager = handlerInput.attributesManager;
    attributesManager.setSessionAttributes(attributes);
    attributesManager.setPersistentAttributes(attributes);
    await attributesManager.savePersistentAttributes();
}

const LaunchHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest'
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        const speech = getLaunchMsg(getLevel(attributes));
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(getLaunchReprompt(getLevel(attributes)))
                .withSimpleCard(SKILL_NAME, getLaunchMsg(getLevel(attributes)))
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    token: 'launch',
                    backgroundImage: getImage('My Rocket Kit printed on a blackboard', `${s3BucketUrl}/images/welcome2-1024x600.jpg`)
                })
                .getResponse(speech);
        } else {
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(getLaunchReprompt(getLevel(attributes)))
                .withSimpleCard(SKILL_NAME, getLaunchMsg(getLevel(attributes)))
                .getResponse(speech);
        }
    }
};

const BuildRocketInProgressHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' 
          && request.intent.name === 'BuildRocket'
          && request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        let prompt = '';
        for (const slotName of Object.keys(handlerInput.requestEnvelope.request.intent.slots)) {
            const currentSlot = currentIntent.slots[slotName];
            if (currentSlot.confirmationStatus !== 'CONFIRMED'
              && currentSlot.resolutions
              && currentSlot.resolutions.resolutionsPerAuthority[0]) {
                if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                    if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                        prompt = 'Which would you like';
                        const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;

                        currentSlot.resolutions.resolutionsPerAuthority[0].values
                        .forEach((element, index) => {
                            prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
                        });

                        prompt += '?';

                        return handlerInput.responseBuilder
                        .speak(prompt)
                        .reprompt(prompt)
                        .addElicitSlotDirective(currentSlot.name)
                        .getResponse();
                    }
                } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
                    if (requiredSlots.indexOf(currentSlot.name) > -1) {
                        prompt = `What ${currentSlot.name} would you like?`;

                        return handlerInput.responseBuilder
                        .speak(prompt)
                        .reprompt(prompt)
                        .addElicitSlotDirective(currentSlot.name)
                        .getResponse();
                    }
                }
            }
        }

        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    }
};

const BuildRocketCompletedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' 
            && request.intent.name === 'BuildRocket'
            && request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        let numFins = _.get(handlerInput, 'requestEnvelope.request.intent.slots.NumberOfFins.value');
        if (!numFins) {
            numFins = 'three';
        }
        let noseConeShape = _.get(handlerInput, 'requestEnvelope.request.intent.slots.NoseConeShape.value');
        if (!noseConeShape) {
            noseConeShape = 'pointed';
        }
        let color = _.get(handlerInput, 'requestEnvelope.request.intent.slots.Color.value');
        if (!color) {
            color = 'red';
        }
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(getBuildRocketCompleteMsg(getLevel(attributes), numFins, noseConeShape, color))
                .withShouldEndSession(false)
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    title: 'Build complete!',
                    token: 'build-complete',
                    backgroundImage: getImage('Model rocket ready for take off', `${s3BucketUrl}/images/alpha3-ready-1024x600.jpg`)
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(getBuildRocketCompleteMsg(getLevel(attributes), numFins, noseConeShape, color))
                .withShouldEndSession(false)
                .getResponse();
        }
    }
};

const LaunchRocketInProgressHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' 
          && request.intent.name === 'LaunchRocket'
          && request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    }
};

const LaunchRocketCompletedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' 
            && request.intent.name === 'LaunchRocket';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        const speech = getLaunchRocketCompleteMsg(attributes.level);
        let reprompt = getLaunchReprompt(attributes.level);
        if (attributes.level < 5) {
            attributes.level++;
        }
        await setSaveAttributes(handlerInput, attributes);
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(reprompt)
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    title: 'Liftoff!',
                    token: 'liftoff',
                    backgroundImage: getImage('Model rocket lifting off', `${s3BucketUrl}/images/alpha3-1024x600.jpg`)
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speech)
                .reprompt(reprompt)
                .getResponse();
        }
    }
};

const GetRocketFactHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
          && request.intent.name === 'RocketFact';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        if (!attributes.hasOwnProperty('currentFactNumber') || (typeof attributes.currentFactNumber !== 'number')) {
            attributes.currentFactNumber = 0;
        }
        let speech = rocketFacts.getFact(attributes.currentFactNumber);
        speech += ' Say "get fact" to get another fact.';
        attributes.currentFactNumber++;
        const numFacts = rocketFacts.getNumFacts();
        if (attributes.currentFactNumber >= numFacts) {
            attributes.currentFactNumber = 0;
        }
        await setSaveAttributes(handlerInput, attributes);
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    title: 'Rocket Fact',
                    token: 'rocket-fact',
                    textContent: richTextMaker(null, speech),
                    backgroundImage: getImage('Work table with rocket parts', `${s3BucketUrl}/images/background-1024x600.jpg`)
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .getResponse();
        }
    }
};

const GetRocketryInfoHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
          && request.intent.name === 'RocketInfo';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        if (!attributes.hasOwnProperty('currentInfoNumber') || (typeof attributes.currentInfoNumber !== 'number')) {
            attributes.currentInfoNumber = 0;
        }
        let speech = rocketFacts.getRocketryInfo(attributes.currentInfoNumber);
        speech += ' Say "get info" to get more rocketry info.';
        attributes.currentInfoNumber++;
        const numInfo = rocketFacts.getNumInfo();
        if (attributes.currentInfoNumber >= numInfo) {
            attributes.currentInfoNumber = 0;
        }
        await setSaveAttributes(handlerInput, attributes);
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    title: 'Rocketry Info',
                    token: 'rocket-info',
                    textContent: richTextMaker(null, speech),
                    backgroundImage: getImage('Work table with rocket parts', `${s3BucketUrl}/images/background-1024x600.jpg`)
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .getResponse();
        }
    }
};

const GetSafetyHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
          && request.intent.name === 'Safety';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        if (!attributes.hasOwnProperty('currentSafetyCodeNumber') || (typeof attributes.currentSafetyCodeNumber !== 'number')) {
            attributes.currentSafetyCodeNumber = 0;
        }
        const speech = `N.A.R. Safety Code. ${rocketFacts.getSafetyCode(attributes.currentSafetyCodeNumber)} Say "get next code" to get the next safety code.`;
        attributes.currentSafetyCodeNumber++;
        const numSafetyCode = rocketFacts.getNumSafetyCodes();
        if (attributes.currentSafetyCodeNumber >= numSafetyCode) {
            attributes.currentSafetyCodeNumber = 0;
        }
        await setSaveAttributes(handlerInput, attributes);
        if (supportsDisplay(handlerInput)) {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .addRenderTemplateDirective({
                    type: 'BodyTemplate1',
                    backButton: 'HIDDEN',
                    title: 'National Association of Rocketry Safety Code',
                    token: 'rocket-safety',
                    textContent: richTextMaker(null, speech),
                    backgroundImage: getImage('Work table with rocket parts', `${s3BucketUrl}/images/background-1024x600.jpg`)
                })
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(SKILL_NAME, speech)
                .reprompt(getLaunchReprompt(attributes.level))
                .getResponse();
        }
    }
};

const ResetHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'Reset';
    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        attributesManager.setPersistentAttributes({});
        await attributesManager.savePersistentAttributes();
        return handlerInput.responseBuilder
            .speak(`${RESET} ${getLaunchReprompt(0)}`)
            .reprompt(REPROMPT)
            .getResponse();
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        return handlerInput.responseBuilder
            .speak(`${getHelp(attributes.level)} If you want to reset your progress back to skill level zero, say "reset".`)
            .reprompt(getHelp(attributes.level))
            .getResponse();
    }
};

const FallbackHandler = {
    // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
    //              This handler will not be triggered except in that locale, so it can be
    //              safely deployed for any locale.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.FallbackIntent';
    },
    async handle(handlerInput) {
        const attributes = await getAttributes(handlerInput);
        return handlerInput.responseBuilder
            .speak(getLaunchReprompt(attributes.level))
            .reprompt(getLaunchReprompt(attributes.level))
            .getResponse();
    }
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.')
            .reprompt(getHelp(0))
            .getResponse();
    }
};

let skill;
exports.handler = async (event, context) => {
    console.log(`REQUEST:\n\n${JSON.stringify(event, null, 4)}`);
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            LaunchHandler,
            BuildRocketInProgressHandler,
            BuildRocketCompletedHandler,
            GetRocketFactHandler,
            GetSafetyHandler,
            GetRocketryInfoHandler,
            LaunchRocketInProgressHandler,
            LaunchRocketCompletedHandler,
            HelpHandler,
            ExitHandler,
            FallbackHandler,
            SessionEndedRequestHandler,
            ResetHandler
        )
        .withPersistenceAdapter(dynamoDbPersistenceAdapter)
        .addErrorHandlers(ErrorHandler)
        .create();
    }

    const response = await skill.invoke(event, context);
    console.log(`RESPONSE:\n\n${JSON.stringify(response)}`);

    return response;
}