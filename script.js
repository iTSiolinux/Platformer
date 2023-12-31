
const { Engine, Events, Render, Runner, Bodies, Body, Composite, World, Mouse, MouseConstraint } = Matter,
engine = Engine.create(),
runner = Runner.create();

var width = window.innerWidth,
height = window.innerHeight,
scale = 16,
sound = [],
renderOptions =  {
    width: 0,
    height: 0,
    wireframes: false,
    background: "lightblue",
    pixelRatio: 1
};

if (window.innerHeight < 512 || window.innerWidth < 256) {
    window.alert("Sorry, your window is too small to display the content properly. Please resize your window for a better experience.");
    window.location.reload()
} else {
    renderOptions.width = window.innerWidth * 0.95
    renderOptions.height = window.innerHeight * 0.95
}

const render = Render.create({
    element: document.body,
    engine: engine,
    options: renderOptions
});
const GAME = {
    player: {
        node: null,
        a: {
            radius: scale,
            render: {
                // fillStyle: "red",
                // strokeStyle: "black",
                // lineWidth: 1
                sprite: {
                    texture: "media/sci_fi/player/texture.png",
                    xScale: 0.125,
                    yScale: 0.125
                }
            },
            speed: {
                x: 4,
                y: 4
            }
        },
        bools: {
            movement: {
                up: false,
                left: false,
                right: false,
                down: false,
                interact: false
            },
            camera: {
                lockX: true,
                lockY: true
            },
            onGround: true
        },
        spawnPoint: { x: 0, y: -20 }
    },
    bgMusic: {
        src: "http://dm0qx8t0i9gc9.cloudfront.net/previews/audio/HNxwBHlArk43bm5tw/audioblocks-randon-nelson_pop_island-fever-full-120bpm-c_HgYts3S9n_NWM.mp3",
        volume: 1
    },
    zoom: 1,
    Map: {
        load: (map) => {
            GAME.Map.map = map;
            const blocks = map.blocks;
            const platforms = map.platforms;
            const bodies = []; 

            platforms.forEach((plat) => {
                if (plat.type === 'rect') {
                    const block = blocks.find((block) => block.id === plat.id);
                    if (block) {
                        const options = {
                            label: plat.label,
                            isStatic: block.isStatic,
                            render: block.render,
                        }
                        if (plat.group || block.group){
                            options.collisionFilter.group = plat.group || block.group;
                        }
                        if (plat.label || block.label){
                            options.label = plat.label || block.label;
                        }
                        const obj = Bodies.rectangle(plat.x, plat.y, block.scale.width, block.scale.height, options);
                        bodies.push(obj);
                    }
                }
            });
            Composite.allBodies(engine.world).forEach((body) => {
                if (body !== GAME.player.node) {
                    Composite.remove(engine.world, body);
                }
            });
            Composite.add(engine.world, bodies)
            GAME.player = { ...GAME.player, ...map.player}
            new Player()
        }
    }
}

var bgMusic = new Howl({
    src: [GAME.bgMusic.src],
    loop: true,
    volume: GAME.bgMusic.volume
});

const default_map = {
    PlayerAttributes: {
        spawnPoint: { x: 0, y: -40 },
        void: {low: 1000, top: -1000},
        displayTimer: false
    },
    blocks: [
        {
            id: 1,
            isStatic: true,
            render: {
                fillStyle: 'green',
                strokeStyle: 'brown',
                lineWidth: 1,
            },
            scale: {width: 40, height: 10}
        },
        {
            id: 3,
            isStatic: true,
            render: {
                sprite: {
                    texture: 'https://dabuttonfactory.com/button.png?t=Levels&f=Open+Sans-Bold&ts=26&tc=fff&hp=25&vp=19&c=11&bgt=unicolored&bgc=00f',
                  },
            },
            scale: {width: 128, height: 64}
        },
    ],
    platforms: [
        { id: 1, label: null, type: 'rect', x: 0, y: 0 },
        { id: 3, label: '{ "interact" : {"script": "GAME.Map.load(levels_map)"} }' , type: 'rect', x: 128, y: 128}
    ]
};

const levels_map = {
    leaveMap: default_map,
    PlayerAttributes: {
        spawnPoint: { x: 0, y: -40 },
        void: {low: 1000, top: -1000},
        displayTimer: false
    },
    blocks: [
        {
            id: 1,
            isStatic: true,
            render: {
                sprite: {
                    texture: "media/sci_fi/platforms/base.png",
                }
            },
            scale: {width: 128, height: 32}
        },
        {
            id: 2,
            isStatic: true,
            render: {
                sprite: {
                    texture: "https://dabuttonfactory.com/button.png?t=1&f=Open+Sans-Bold&ts=26&tc=fff&hp=27&vp=19&c=11&bgt=unicolored&bgc=15d798"
                }
            },
            scale: {width: 64, height: 64}
        }
    ],
    platforms: [
        { id: 1, label: null, type: 'rect', x: 0, y: 0 },
        { id: 2, label: '{ "interact" : {"script": "GAME.Map.load(level1)"} }', type: 'rect', x: 128, y: 0 },
    ]
};

const level1 = {
    leaveMap: levels_map,
    PlayerAttributes: {
        spawnPoint: { x: 0, y: -40 },
        void: {low: 1000, top: -1000},
        displayTimer: true
    },
    blocks: [
        {
            id: 2,
            isStatic: true,
            render: {
                sprite: {
                    texture: "media/sci_fi/platforms/base_end_flag.png",
                    xScale: 2,
                    yScale: 2
                }
            },
            scale: {width: 128, height: 32}
        },
        {
            id: 1,
            isStatic: true,
            render: {
                sprite: {
                    texture: "media/sci_fi/platforms/base.png",
                }
            },
            scale: {width: 128, height: 32}
        }
    ],
    platforms: [
        { id: 1, label: null, type: 'rect', x: 0, y: 64 },
        { id: 1, label: null, type: 'rect', x: 128, y: 64 },
        { id: 1, label: null, type: 'rect', x: 384, y: 128 },
        { id: 1, label: null, type: 'rect', x: 640, y: 256 },
        { id: 2, label: '{ "interact" : {"script": "GAME.Map.load(levels_map)"} }', type: 'rect', x: 896, y: 192 },
    ]
};

function updateCamera(){
    w = render.options.width / 2
    h = render.options.height / 2
    X = GAME.player.node.body.position.x - w
    Y = GAME.player.node.body.position.y  - h

    if (GAME.player.bools.camera.lockX && GAME.player.bools.camera.lockY){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, -X, -Y)
    } else if (GAME.player.bools.camera.lockX){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, -X, 0)
    } else if (GAME.player.bools.camera.lockY){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, 0, -Y)
    }
}

function resizeWindow() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    render.canvas.width = width;
    render.canvas.height = height;
}

function formatTimer(milliseconds) {
    // Calculate hours, minutes, seconds, and milliseconds
    const hours = Math.floor(milliseconds / 3600000);
    milliseconds -= hours * 3600000;
    const minutes = Math.floor(milliseconds / 60000);
    milliseconds -= minutes * 60000;
    const seconds = Math.floor(milliseconds / 1000);
    milliseconds -= seconds * 1000;

    // Ensure each component is two digits long
    const format = (val) => (val < 10 ? '0' : '') + val;

    // Initialize formattedTimer
    var formattedTimer = '';

    // Add hours, minutes, seconds, and milliseconds to the formattedTimer
    if (hours > 0) {
        formattedTimer += format(hours) + ' : ';
    }
    formattedTimer += format(minutes) + ' : ';
    formattedTimer += format(seconds) + ' : ';
    formattedTimer += format(milliseconds);

    return formattedTimer;
}

GAME.loop =  ()=>{
    if (GAME.player.node){
        GAME.player.node.update()
        updateCamera()
    }
    if (GAME.Map.map.PlayerAttributes.displayTimer){
        timer = document.getElementById("timer")
        timer.innerText = `time: ${formatTimer(GAME.player.node.aliveTime.getElapsedTime())}`
    } else {
        timer = document.getElementById("timer")
        timer.innerText = ``
    }
    // killing voiding entitys.
    const bodiesToRemove = [];
    const voidLow = GAME.Map.map.PlayerAttributes.void.low;
    Composite.allBodies(engine.world).forEach((body) => {
        if (body.position.y > voidLow) {
            bodiesToRemove.push(body);
        }
    });

    Composite.remove(engine.world, bodiesToRemove);
}

function keySetBoolean(e, fill) {
    if (e.key === 'w' || e.key === 'ArrowUp') {
        GAME.player.bools.movement.up = fill;

        if (GAME.player.bools.onGround && fill) {
            const playerVelocity = GAME.player.node.body.velocity;
            Body.setVelocity(GAME.player.node.body, { x: playerVelocity.x, y: -GAME.player.a.speed.y * 2 });
            GAME.player.bools.onGround = false;
        }
    }

    // check for hortizonal movement
    if (e.key === 'a' || e.key === 'ArrowLeft') {
        GAME.player.bools.movement.left = fill;
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
        GAME.player.bools.movement.right = fill;
    }

    // check for muting the music
    if (e.key === 'm' && !fill) {
        bgMusic.mute(!bgMusic._muted);
    }

    if (e.key == 'e') {
        GAME.player.bools.movement.interact = fill
    }
}

class Stopwatch {
    constructor(time) {
        this.startTime = 0;
        this.isRunning = false;
        this.elapsedTime = 0;
        this.intervalId = null;
        this.updateEach = time;
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
            }, this.updateEach);
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
        }
    }

    reset() {
        this.elapsedTime = 0;
    }

    getElapsedTime() {
        return this.elapsedTime;
    }
}



class Player {
    move;
    remove;
    body;
    aliveTime = new Stopwatch(1);
    check4 = () => {
        if (this.body.position.y < GAME.Map.map.PlayerAttributes.void.top){
            new Player()
        }
        if (this.body.position.y > GAME.Map.map.PlayerAttributes.void.low){
            new Player()
        }
    }
    collide = (otherBody) => {
        if (otherBody.label){
            const Label = JSON.parse(otherBody.label)

            if (Label.collide && Label.collide.script) {
                new Function(Label.collide.script)()
            }
            if (Label.interact && Label.interact.script && GAME.player.bools.movement.interact) {
                new Function(Label.interact.script)()
            }
        }
        if (GAME.player.node.body.position.y < otherBody.position.y){
            GAME.player.bools.onGround = true;
        }
    }
    constructor(){
        this.body = new Bodies.circle(GAME.player.spawnPoint.x, GAME.player.spawnPoint.y, GAME.player.a.radius, {
            render: GAME.player.a.render,
            label: "player"
        })
        Composite.add(engine.world, this.body);
        this.aliveTime.start()
        this.remove = () => {
            Composite.remove(engine.world, this.body);
        }
        this.move = () => {
            const { x, y } = GAME.player.node.body.velocity;
            if (GAME.player.bools.movement.right){
                Body.setVelocity(GAME.player.node.body, { x: GAME.player.a.speed.x, y });
            }
            if (GAME.player.bools.movement.left){
                Body.setVelocity(GAME.player.node.body, { x: -GAME.player.a.speed.x, y });
            }
        }
        if (GAME.player.node){
            GAME.player.node.remove()
        }
        GAME.player.node = this;
        Events.on(engine, 'collisionActive', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                if (pair.bodyA === GAME.player.node.body) {
                    const otherBody = pair.bodyB; 
                    this.collide(otherBody);
                } else if (pair.bodyB === GAME.player.node.body) {
                    const otherBody = pair.bodyA;
                    this.collide(otherBody);
                }
            }
        });
    }
    update = () => {
        this.move()
        this.check4()
    }
}

Render.run(render);
Runner.run(runner, engine);
setInterval(GAME.loop, 10)
setTimeout(() => {
    GAME.Map.load(default_map)
    new Player();
    sound.bgMusic = bgMusic.play()
}, window.onload)

// events handlers:
// window.addEventListener("resize", resizeWindow)
window.addEventListener("keydown",(e) => {keySetBoolean(e, true)})
window.addEventListener("keyup",(e) => {keySetBoolean(e, false)})
