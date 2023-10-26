        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            World = Matter.World;

        var width = window.innerWidth,
            height = window.innerHeight,
            scale = 10;

        
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
            console.log("resizing window pane")
        }

        function loop(){
            if (playerNode){
                playerNode.move()
            }
            
        }

        function keySetBoolean(e, fill){
            if (e.key == 'w' || 'ArrowUp'){
                playerProperties.bools.movement.up = fill;
            }
            if (e.key == 'a' || 'ArrowLeft'){
                playerProperties.bools.movement.left = fill;
            }
            if (e.key == 'd' || 'ArrowRight'){
                playerProperties.bools.movement.right = fill;

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
                    if (playerProperties.bools.movement.up){
                        
                    }
                    if (playerProperties.bools.movement.right){
                    
                    }
                    if (playerProperties.bools.movement.left){

                    }
                    updateCamera()
                }


                if (playerNode){
                    playerNode.remove()
                }
                playerNode = this;
            }
        }

        Render.run(render);
        Runner.run(runner, engine);
        setInterval(loop, 10)
        new Player()

        // events handlers:
        window.addEventListener("resize", resizeWindow)
        window.addEventListener("keydown",(e) => {keySetBoolean(e, true)})
        window.addEventListener("keyup",(e) => {keySetBoolean(e, false)})