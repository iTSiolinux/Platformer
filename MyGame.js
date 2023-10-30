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

var bgMusic = new Howl({
    src: ['', 'http://dm0qx8t0i9gc9.cloudfront.net/previews/audio/HNxwBHlArk43bm5tw/audioblocks-randon-nelson_pop_island-fever-full-120bpm-c_HgYts3S9n_NWM.mp3'],
    volume: 0.9
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
    background: "lightblue"
}
});

var playerNode = null

const playerProperties = {
    a : {
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
            lockY : true
        }
    },
    spawnPoint : {x: 0, y: -20}
}

const ground = Bodies.rectangle(0, 0, 40, 10, { isStatic: true });
Composite.add(engine.world, ground);
function locatePlayer(){
    w = render.options.width / 2
    h = render.options.height / 2
    X = playerNode.body.position.x - w
    Y = playerNode.body.position.y  - h
    return {x: X, y: Y}
}

function updateCamera(){
    loc = locatePlayer()
    if (playerProperties.bools.camera.lockX && playerProperties.bools.camera.lockY){
        render.context.setTransform(1, 0, 0, 1, -loc.x, -loc.y)
    } else if (playerProperties.bools.camera.lockX){
        render.context.setTransform(1, 0, 0, 1, -loc.x, 0)
    } else if (playerProperties.bools.camera.lockY){
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
            playerProperties.bools.movement.up = fill;
            break;
        
        case 'a':
        case 'ArrowLeft':
            playerProperties.bools.movement.left = fill;
            break;

        case 'd':
        case 'ArrowRight':
            playerProperties.bools.movement.right = fill;
            break;
    }
}



class Player {
    move;
    body;
    remove;
    constructor(){

        this.body = new Bodies.circle(playerProperties.spawnPoint.x, playerProperties.spawnPoint.y, playerProperties.a.radius, {
            render: {
                fillStyle: playerProperties.a.color.fill,
                strokeStyle: playerProperties.a.color.stroke,
                lineWidth: playerProperties.a.color.strokeWidth
            }
        })

        Composite.add(engine.world, this.body);

        this.remove = () => {
            Composite.remove(engine.world, this.body);
        }

        this.move = () => {
            const { x, y } = playerNode.body.velocity;
            if (playerProperties.bools.movement.up){
                Body.setVelocity(playerNode.body, { x, y: -playerProperties.a.speed.y * 2 });
            }
            if (playerProperties.bools.movement.right){
                Body.setVelocity(playerNode.body, { x: playerProperties.a.speed.x, y });
            }
            if (playerProperties.bools.movement.left){
                Body.setVelocity(playerNode.body, { x: -playerProperties.a.speed.x, y });
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
        playerProperties.onGround = true; // Player is on the ground
    }
}

Render.run(render);
Runner.run(runner, engine);
setInterval(loop, 10)
setTimeout(() => {
    new Player();
    currentSound = bgMusic.play()
}, window.onload)

// events handlers:
window.addEventListener("resize", resizeWindow)
window.addEventListener("keydown",(e) => {keySetBoolean(e, true)})
window.addEventListener("keyup",(e) => {keySetBoolean(e, false)})
