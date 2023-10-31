const Engine = Matter.Engine,
Events = Matter.Events,
Render = Matter.Render,
Runner = Matter.Runner,
Bodies = Matter.Bodies,
Body = Matter.Body,
Composite = Matter.Composite,
World = Matter.World;

var width = window.innerWidth,
height = window.innerHeight,
scale = 10;

var currentSound = null



const engine = Engine.create();
const runner = Runner.create();

const render = Render.create({
element: document.body,
engine: engine,
options: {
    width: width,
    height: height,
    wireframes: false,
    background: "lightblue"
}
});

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
                down: false
            },
            camera: {
                lockX: true,
                lockY: true
            }
        },
        spawnPoint: { x: 0, y: -20 }
    },
    bgMusic: {
        src: "http://dm0qx8t0i9gc9.cloudfront.net/previews/audio/HNxwBHlArk43bm5tw/audioblocks-randon-nelson_pop_island-fever-full-120bpm-c_HgYts3S9n_NWM.mp3",
        volume: 1
    }
}

var bgMusic = new Howl({
    src: [GAME.bgMusic.src],
    volume: GAME.bgMusic.volume
});

const default_map = {
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
    ],
    platforms: [
        { id: 1, label: null, type: 'rect', x: 0, y: 0 },
        { id: 1, label: null, type: 'rect', x: 80, y: 0 },
    ],
};

function loadMap(map) {
    const blocks = map.blocks;
    const platforms = map.platforms;
    const bodies = []; 

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
                        isStatic: block.isStatic,
                        render: block.render,
                    }
                );
                bodies.push(obj);
            }
        }
    });
    Composite.add(engine.world, bodies)
    
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
        render.context.setTransform(1, 0, 0, 1, -loc.x, -loc.y)
    } else if (GAME.player.bools.camera.lockX){
        render.context.setTransform(1, 0, 0, 1, -loc.x, 0)
    } else if (GAME.player.bools.camera.lockY){
        render.context.setTransform(1, 0, 0, 1, 0, -loc.y)
    }
}

function resizeWindow() {
    width = window.innerWidth,
    height = window.innerHeight;
    
    render.options.width = width;
    render.options.height = height
}

function loop(){
    if (playerNode){
        playerNode.move()
        updateCamera()
    }
}

function keySetBoolean(e, fill) {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            GAME.player.bools.movement.up = fill;
            break;
        
        case 'a':
        case 'ArrowLeft':
            GAME.player.bools.movement.left = fill;
            break;

        case 'd':
        case 'ArrowRight':
            GAME.player.bools.movement.right = fill;
            break;

        case 'm':
            if (!fill) { bgMusic.mute(!bgMusic._muted); }
            
    }
}



class Player {
    move;
    body;
    remove;
    constructor(){

        this.body = new Bodies.circle(GAME.player.spawnPoint.x, GAME.player.spawnPoint.y, GAME.player.a.radius, {
            render: {
                fillStyle: GAME.player.a.color.fill,
                strokeStyle: GAME.player.a.color.stroke,
                lineWidth: GAME.player.a.color.strokeWidth
            }
        })

        Composite.add(engine.world, this.body);

        this.remove = () => {
            Composite.remove(engine.world, this.body);
        }

        this.move = () => {
            const { x, y } = playerNode.body.velocity;
            if (GAME.player.bools.movement.up && GAME.player.onGround){
                Body.setVelocity(playerNode.body, { x, y: -GAME.player.a.speed.y * 2 });
            }
            if (GAME.player.bools.movement.right){
                Body.setVelocity(playerNode.body, { x: GAME.player.a.speed.x, y });
            }
            if (GAME.player.bools.movement.left){
                Body.setVelocity(playerNode.body, { x: -GAME.player.a.speed.x, y });
            }
        }


        if (playerNode){
            playerNode.remove()
        }
        playerNode = this;
        Events.on(this.body, 'collisionStart', function (event) {
            const pairs = event.pairs;
        
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
        
                // Check if the "player" body is involved in the collision
                if (pair.bodyA === playerNode.body) {
                    const otherBody = pair.bodyB; // Get the other body involved in the collision
                    playerCollidedWith(otherBody);
                } else if (pair.bodyB === playerNode.body) {
                    const otherBody = pair.bodyA; // Get the other body involved in the collision
                    playerCollidedWith(otherBody);
                }
            }
        });
    }
}

function playerCollidedWith(otherBody) {
    console.log(otherBody)
    if (playerNode.body.position.y < otherBody.position.y){
        GAME.player.onGround = true; // Player is on the ground
    }
}

Render.run(render);
Runner.run(runner, engine);
setInterval(loop, 10)

setTimeout(() => {
    loadMap(default_map)
    new Player()
    currentSound = bgMusic.play()
}, window.onload)

// events handlers:
window.addEventListener("resize", resizeWindow)
window.addEventListener("keydown",(e) => {keySetBoolean(e, true)})
window.addEventListener("keyup",(e) => {keySetBoolean(e, false)})
