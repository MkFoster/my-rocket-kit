const rocketFacts = [
    `There many different types of model rockets for different ages and skill levels including foam air rockets, water rockets, and solid fuel rockets.
        They all work using the same principle. Thrust is created by the release of compressed gas or fluid.`,
    `Solid rocket engines used in model rocketry are made from a thick cardboard tube packed with a clay nozzle, propellant, delay and tracking \
        smoke, an ejection charge, and a clay cap.  When a rocket is launched an ignitor placed at the bottom of the engine ignites the propellant.
        The burning propellent forces hot exhaust gas out the clay nozzle to generate thrust.  After the propellent has been burned up a \
        delay burns and emits tracking smoke.  After a few seconds an ejection charge pops the nose cone off and a parachute or \
        a streamer is deployed.  A flame resistant tissue called recovery wadding is used to prevent damage to the parachute or streamer from the ejection charge.
        This all happens in a matter of seconds.`,
    `Model rockets that use solid engines are launched with an electrical launch control system.  The launch controller is typically a small \
        plastic box with batteries, a light bulb or LED, a hole for the launch key and a button to launch the rocket.  It also has a long wire with \
        clips on the end that connect to an ignitor inserted into the bottom of the rocket engine.  To launch a rocket you insert a metal key into the \
        launch controller.  If everything is working properly, the light on the controller will light up indicating it is ready for launch.
        You then count down and presses the launch button.  This passes an electrical current through the ignitor causing it to ignite along with \
        the rocket engine.`,
    `Apogee is a term used to describe when a rocket reaches the furthest point from earth during its flight.`,
    `Newton's laws of motion predict how a rocket will behave. 
        First Law: Objects at rest remain at rest and objects in motion remain in motion in a straight \
        line unless acted upon by an unbalanced force. 
        Second Law: Force equals mass times acceleration.
        Third Law: For every action there is an equal and opposite reaction.`,
    `A typical full size rocket produces more than a million pounds of thrust and travel at over twenty-two thousand miles per hour.`,
    `The first stage of a SpaceX Falcon 9 rocket has the ability to land on a barge in the middle of the ocean so it can be re-used for another launch.`
];

const rocketryInfo = [
    `The National Association of Rocketry website is a great place to learn more about rocketry.  You can find local rocket clubs and launches, safety codes, \
    and become an N.A.R. member.  Go to www.nar.org to learn more.`,
    `NASA offers a number of rocketry resources for a budding rocket scientist on multiple websites.  Do a web search for "NASA Beginner's Guide to Rockets".`,
    `Wikipedia has an excellent article on model rocketry.  Search for wikipedia and model rocket.`,
    `There are a variety of rocket kits to choose from.  Here are few manufacturers to check out: Apogee Rockets, Estes, and Quest Model Rockets.`
];

const narModelRocketSafetyCode = [
    `Materials. I will use only lightweight, non-metal parts for the nose, body, and fins of my rocket.`,
    `Motors. I will use only certified, commercially-made model rocket motors, and will not tamper with \
        these motors or use them for any purposes except those recommended by the manufacturer.`,
    `Ignition System. I will launch my rockets with an electrical launch system and electrical motor igniters. 
        My launch system will have a safety interlock in series with the launch switch, and will use a launch switch \
        that returns to the “off” position when released.`,
    `Misfires. If my rocket does not launch when I press the button of my electrical launch system, I will remove the \
        launcher’s safety interlock or disconnect its battery, and will wait 60 seconds after the last launch attempt \
        before allowing anyone to approach the rocket.`,
    `Launch Safety. I will use a countdown before launch, and will ensure that everyone is paying attention and is a safe \
        distance of at least 15 feet away when I launch rockets with D motors or smaller, and 30 feet when I launch larger rockets. 
        If I am uncertain about the safety or stability of an untested rocket, I will check the stability before flight and \
        will fly it only after warning spectators and clearing them away to a safe distance. When conducting a simultaneous \
        launch of more than ten rockets I will observe a safe distance of 1.5 times the maximum expected altitude of any launched rocket.`,
    `Launcher. I will launch my rocket from a launch rod, tower, or rail that is pointed to within 30 degrees of the vertical \
        to ensure that the rocket flies nearly straight up, and I will use a blast deflector to prevent the motor’s exhaust \
        from hitting the ground. To prevent accidental eye injury, I will place launchers so that the end of the launch rod \
        is above eye level or will cap the end of the rod when it is not in use.`,
    `Size. My model rocket will not weigh more than 1,500 grams (53 ounces) at liftoff and will not contain more than \
        125 grams (4.4 ounces) of propellant or 320 N-sec (71.9 pound-seconds) of total impulse.`,
    `Flight Safety. I will not launch my rocket at targets, into clouds, or near airplanes, and will not put any flammable \
        or explosive payload in my rocket.`,
    `Launch Site. I will launch my rocket outdoors, in an open area, \
        and in safe weather conditions with wind speeds no greater than 20 miles per hour. I will ensure that there is no \
        dry grass close to the launch pad, and that the launch site does not present risk of grass fires.`,
    `Recovery System. I will use a recovery system such as a streamer or parachute in my rocket so that it returns safely \
        and undamaged and can be flown again, and I will use only flame-resistant or fireproof recovery system wadding in my rocket.`,
    `Recovery Safety. I will not attempt to recover my rocket from power lines, tall trees, or other dangerous places.`,
    `That's all of them. Visit the National Association of Rocketry website for more information.`
];

module.exports = {

    getNumFacts() {
        return rocketFacts.length;
    },

    getFact(i) {
        return rocketFacts[i];
    },

    getNumSafetyCodes() {
        return narModelRocketSafetyCode.length;
    },

    getSafetyCode(i) {
        return narModelRocketSafetyCode[i];
    },

    getNumInfo() {
        return rocketryInfo.length;
    },

    getRocketryInfo(i) {
        return rocketryInfo[i];
    }

}

