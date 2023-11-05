
const { Engine, Events, Render, Runner, Bodies, Body, Composite, World, Mouse, MouseConstraint } = Matter;

var width = window.innerWidth,
height = window.innerHeight,
scale = 10;

var currentSound = null

var LevelsJSON = fetch("level.json")
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error("Error fetching JSON:", error);
  });

const engine = Engine.create();
const runner = Runner.create();

const render = Render.create({
element: document.body,
engine: engine,
options: {
    width: width,
    height: height,
    wireframes: false,
    background: "lightblue",
    pixelRatio: 1
}
});


const mouseConstraint = MouseConstraint.create(engine, {
        mouse: Mouse.create(render.canvas),
        constraint: {
            stiffness: 0.1,
            render: { visible: false }
          }
    });



World.add(engine.world, mouseConstraint);

var playerNode = null




const GAME = {
    player: {
        a: {
            radius: scale,
            color: {
                fill: "red",
                stroke: "black",
                strokeWidth: 1
            },
            speed: {
                x: 3,
                y: 2
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
}

var bgMusic = new Howl({
    src: [GAME.bgMusic.src],
    volume: GAME.bgMusic.volume
});

const default_map = {
    PlayerAttributes: {
        a: {
            radius: scale,
            color: {
                fill: "red",
                stroke: "black",
                strokeWidth: 1
            },
            speed: {
                x: 3,
                y: 2
            }
        },
        spawnPoint: { x: 0, y: -40 },
        void: {low: 1000, top: -100}
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
        { id: 3, label: '{ "interact" : {"script": "GAME.Map.map.events.levels()"} }' , type: 'rect', x: 128, y: 128}
    ],
    events: {
        levels: () => {console.log('Hi')} //const Levels = ;GAME.Map.load()
    }
};
GAME.Map = [];

GAME.Map.load  = (map) => {
    GAME.Map.map = map;
    const blocks = map.blocks;
    const platforms = map.platforms;
    const bodies = []; 
    GAME.Map.finish = new Function(map.events.finish)

    platforms.forEach((plat) => {
        if (plat.type === 'rect') {
            const block = blocks.find((block) => block.id === plat.id);

            if (block) {
                const obj = Bodies.rectangle(
                    plat.x,
                    plat.y,
                    block.scale.width,
                    block.scale.height,
                    {
                        label: plat.label,
                        isStatic: block.isStatic,
                        render: block.render,
                    }
                );
                bodies.push(obj);
            }
        }
    });
    Composite.allBodies(engine.world).forEach((body) => {
        if (body !== playerNode) {
            Composite.remove(engine.world, body);
        }
    });
    Composite.add(engine.world, bodies)
    GAME.player = { ...GAME.player, ...map.player}
    new Player()
}





function locatePlayer(){
    w = render.options.width / 2
    h = render.options.height / 2
    X = playerNode.body.position.x - w
    Y = playerNode.body.position.y  - h
    return {x: X, y: Y}
}

function updateCamera(){
    loc = locatePlayer()
    if (GAME.player.bools.camera.lockX && GAME.player.bools.camera.lockY){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, -loc.x, -loc.y)
    } else if (GAME.player.bools.camera.lockX){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, -loc.x, 0)
    } else if (GAME.player.bools.camera.lockY){
        render.context.setTransform(GAME.zoom, 0, 0, GAME.zoom, 0, -loc.y)
    }
}

function resizeWindow() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    render.canvas.width = width;
    render.canvas.height = height;
}

GAME.loop =  ()=>{
    if (playerNode){
        playerNode.move()
        playerNode.check4()
        updateCamera()
    }
}

function keySetBoolean(e, fill) {
    if (e.key === 'w' || e.key === 'ArrowUp') {
        GAME.player.bools.movement.up = fill;

        if (GAME.player.bools.onGround && fill) {
            const playerVelocity = playerNode.body.velocity;
            Body.setVelocity(playerNode.body, { x: playerVelocity.x, y: -GAME.player.a.speed.y * 2 });
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
    aliveTime = new Stopwatch();
    collide = (otherBody) => {
        if (otherBody.label){
            const Label = JSON.parse(otherBody.label)

            if (Label.interact.script && GAME.player.bools.movement.interact) {
                new Function(Label.interact.script)()
            }
            
            
        }
        
        if (playerNode.body.position.y < otherBody.position.y){
            GAME.player.bools.onGround = true;
        }

    }
    constructor(){
        
        this.body = new Bodies.circle(GAME.player.spawnPoint.x, GAME.player.spawnPoint.y, GAME.player.a.radius, {
            render: {
                fillStyle: GAME.player.a.color.fill,
                strokeStyle: GAME.player.a.color.stroke,
                lineWidth: GAME.player.a.color.strokeWidth
            },
            label: "player"
        })

        Composite.add(engine.world, this.body);
        this.aliveTime.start()
        
        this.remove = () => {
            Composite.remove(engine.world, this.body);
        }

        this.move = () => {
            const { x, y } = playerNode.body.velocity;
            if (GAME.player.bools.movement.right){
                Body.setVelocity(playerNode.body, { x: GAME.player.a.speed.x, y });
            }
            if (GAME.player.bools.movement.left){
                Body.setVelocity(playerNode.body, { x: -GAME.player.a.speed.x, y });
            }
        }

        this.check4 = ()=> {
            if (playerNode.body.position.y > GAME.Map.map.PlayerAttributes.void.low){
                new Player()
            }
            if (playerNode.body.position.y < GAME.Map.map.PlayerAttributes.void.top){
                new Player()
            }
        }

        if (playerNode){
            playerNode.remove()
        }
        playerNode = this;
        
        Events.on(engine, 'collisionActive', (event) => {
            
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
        
                if (pair.bodyA === playerNode.body) {
                    const otherBody = pair.bodyB; 
                    this.collide(otherBody);
                } else if (pair.bodyB === playerNode.body) {
                    const otherBody = pair.bodyA;
                    this.collide(otherBody);
                }
            }
        });
    }
}

Render.run(render);
Runner.run(runner, engine);
setInterval(GAME.loop, 10)

setTimeout(() => {
    GAME.Map.load(default_map)
    new Player();
    currentSound = bgMusic.play()
}, window.onload)

// events handlers:
window.addEventListener("resize", resizeWindow)
window.addEventListener("keydown",(e) => {keySetBoolean(e, true)})
window.addEventListener("keyup",(e) => {keySetBoolean(e, false)})
Events.on(mouseConstraint, "mousedown", e => {
    console.log(e)
  })
