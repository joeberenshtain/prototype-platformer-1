let frame_time = new Date()
class Camera {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0 
    }
    move(x,y) {
        this.x += x || 0
        this.y += y || 0 
    }
    animate() {
        window.requestAnimationFrame(CAMERA.animate)
        let new_time = new Date()
        let dt = (new_time - frame_time) / 1000
        frame_time = new_time
        c.fillStyle = 'pink'
        c.fillRect(0,0, canvas.width, canvas.height)
        renderMap()

        player.update(1)
        ghost.update(1)
        CAMERA.x = ghost.position.x - canvas.width / 2 + ghost.size.x / 2;
        CAMERA.y = canvas.height/ 2 -ghost.position.y - ghost.size.y / 2;

    }
}
function in_square(x, y) {
    return Math.max(Math.abs(x), Math.abs(y))
}
class Sprite {
    GRAVITY = 1.2
    JUMP =   24
    constructor(position, size, velocity) {
        this.position = position;
        this.spawn_position = {x: position.x, y: position.y};
        this.size = size

        this.dy = velocity.y
        this.dx = velocity.x

        this.isFloored = true

        this.isUp = false
        this.isDown = false
        this.isRight = false
        this.isLeft = false
    }
    reset_position() {
        console.log(this.position, this.spawn_position)
        this.position.x = this.spawn_position.x;
        this.position.y = this.spawn_position.y;
        this.dy = 0.0
        this.dx = 0.0
    }
    draw() {
        if (this.position.x+this.size.x-CAMERA.x < 0 || this.position.x-CAMERA.x >= canvas.width ||
            this.position.y+this.size.y+CAMERA.y < 0 || this.position.y+CAMERA.y >= canvas.height ) return
        c.fillStyle = "red"
        c.fillRect(this.position.x-CAMERA.x, this.position.y+CAMERA.y, this.size.x, this.size.y)
    }
    update(dt) {
        this.dy += this.GRAVITY * dt
        let max_dist = in_square(this.position.x - ghost.position.x, this.position.y - ghost.position.y);
        if (max_dist >= 600) {
            death()
        } else {
        }
        if (this.isUp && this.isFloored) {
            this.dy -= this.JUMP
            this.isFloored = false
        }

        if (this.isLeft) {
            this.dx = Math.max(this.dx - 1 * dt, -12)
        }
        else if (this.isRight) {
            this.dx = Math.min(this.dx + 1 * dt, 12)
        }
        else this.dx = 0
        
        if (this.dx !== 0) {
           this.isCollisionX()    
        }
        this.position.x += this.dx * dt

        if (this.dy !== 0) {
            this.isCollisionY()    
        }
        this.position.y += this.dy * dt
        this.draw()

        
    }
    isCollision(x, y) {
        return x >= 0 && x < row &&
               y >= 0 && y < column &&
               map[y][x] >= 1
    }
    isCollisionY() {
        let minX = this.DIV(this.position.x, TILE_WIDTH)
        let maxX = this.DIV(this.position.x+this.size.x, TILE_WIDTH)
        let minY = 0;
        let maxY = 0;
        if (this.dy < 0) {
            minY = this.DIV(this.position.y+this.dy, TILE_HEIGHT);
            maxY = this.DIV(this.position.y,         TILE_HEIGHT);
        } else {
            minY = this.DIV(this.position.y+this.size.y,         TILE_HEIGHT);
            maxY = this.DIV(this.position.y+this.size.y+this.dy, TILE_HEIGHT);
        }

        loop:
        for (let y = minY; y <= maxY; ++y) {
            for (let x = minX; x <= maxX; ++x) {
                if (this.isCollision(x,y)) {
                    if (this.dy < 0.0) {
                        this.y = (y + 1) *TILE_HEIGHT
                    } else {
                        this.y = (y - 1) *TILE_HEIGHT// - this. - 1;
                        this.isFloored = true
                    }
                    this.dy = 0.0;
                    break loop;
                }
            }
        }
    }
    isCollisionX() {
        let minY = this.DIV(this.position.y, TILE_HEIGHT)
        let maxY = this.DIV(this.position.y+this.size.y, TILE_HEIGHT)
        let minX = 0;
        let maxX = 0;
        if (this.dx < 0) {
            minX = this.DIV(this.position.x+this.dx, TILE_WIDTH);
            maxX = this.DIV(this.position.x,         TILE_WIDTH);
        } else {
            minX = this.DIV(this.position.x+this.size.x,         TILE_WIDTH);
            maxX = this.DIV(this.position.x+this.size.x+this.dx, TILE_WIDTH);
        }

        loop:
        for (let y = minY; y <= maxY; ++y) {
            for (let x = minX; x <= maxX; ++x) {
                if (this.isCollision(x,y)) {
                    this.x = this.dx < 0.0 ?
                        (x + 1) *TILE_WIDTH:
                        (x - 1) *TILE_WIDTH// - this. - 1;
                
                    this.dx = 0.0;
                    break loop;
                }
            }
        }
    }
    DIV(i, w) {
        return (i - i%w)/w >= 0 ? (i - i%w)/w : 0
    }
}
class Ghost {
    SPEED = 14
    constructor(position, size, velocity) {
        this.position = position;
        this.spawn_position = {x: position.x, y: position.y};
        this.size = size

        this.dy = velocity.y
        this.dx = velocity.x

        this.sitting = true;
        this.angle = 0.0;

        this.isUp = false
        this.isDown = false
        this.isRight = false
        this.isLeft = false
        console.log(this.position, this.dy)
    }
    draw() {
        if (this.position.x+this.size.x-CAMERA.x < 0 || this.position.x-CAMERA.x >= canvas.width ||
            this.position.y+this.size.y+CAMERA.y < 0 || this.position.y+CAMERA.y >= canvas.height ) return
        c.fillStyle = "blue"
        c.fillRect(this.position.x-CAMERA.x, this.position.y+CAMERA.y, this.size.x, this.size.y)
    }
    reset_position() {
        this.position.x = this.spawn_position.x;
        this.position.y = this.spawn_position.y;
    }
    update(dt) {
        if (this.sitting) {
            this.sitting = false
            if (this.isUp) {
                if (this.isLeft) {
                    this.angle = 3.0 * Math.PI / 4.0;
                }
                else if (this.isRight) {
                    this.angle = Math.PI / 4.0;
                }
                else this.angle = Math.PI / 2.0;
            } else if (this.isDown) {
                if (this.isLeft) {
                    this.angle = -3.0 * Math.PI / 4.0;
                }
                else if (this.isRight) {
                    this.angle = -Math.PI / 4.0;
                }
                else this.angle = -Math.PI / 2.0;
            } else {
                if (this.isLeft) {
                    this.angle = -Math.PI ;
                }
                else if (this.isRight) {
                    this.angle = 0;
                }
                else {
                    this.sitting = true;
                }
            }
        }
        if (this.isLeft) {
            this.angle += 0.1 * dt;
        }
        if (this.isRight) {
            this.angle -= 0.1 * dt;
        }
        // if (this.isUp) {
        //     this.dy = -14
        // } else if (this.isDown) {
        //     console.log("HELLO")
        //     this.dy = 14
        // }
        // else this.dy = 0


        // if (this.isLeft) {
        //     this.dx = -14
        // }
        // else if (this.isRight) {
        //     this.dx = 14
        // }
        // else this.dx = 0
        
        this.dx = Math.cos(this.angle) * 6;
        this.dy = Math.sin(this.angle)* 6;
        if (!this.sitting) {
            this.position.x += this.dx * dt
            this.position.y += this.dy * dt
        }
        
        this.draw()

        
    }
}
function DIV(i, w) {
    return (i - i%w)/w >= 0 ? (i - i%w)/w : 0
}
function death() {
    console.log("hello")
    ghost.sitting = true;
    player.reset_position();
    ghost.reset_position();

}
function renderMap() {
    let maxY = (CAMERA.y - CAMERA.y % TILE_HEIGHT)/TILE_HEIGHT
    let minX = (CAMERA.x - CAMERA.x % TILE_WIDTH)/TILE_WIDTH
    let maxX = minX+DIV(canvas.width, TILE_WIDTH)+2 <= row ? minX+DIV(canvas.width, TILE_WIDTH)+2 : row;
    minX = minX < 1 ? 1 : minX
    maxY = maxY < 1 ? 1 : maxY
    
    for(let y = 0; y < column; y++){
        for(let x = minX-1; x < maxX; x++){
            switch(map[y][x]) {
                case 0: continue;
                case 1: c.fillStyle = "black"; break;
                default:continue
        }
        c.fillRect(x*TILE_WIDTH-CAMERA.x, y*TILE_HEIGHT+CAMERA.y, TILE_WIDTH-1, TILE_HEIGHT-1);
      }
    }
}
function parseMap(text) {
    let nm = text.split('\r\n')
    row = nm[0].length 
    column = nm.length
    for (let a = 0; a < nm.length; a++) {
        for (let b = 0; b < nm[a].length; b++) {
            map[a][b] = parseInt(nm[a][b])
        }
    }
    console.log(row, column)
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1336//1024
canvas.height = 768//576
var map = [ 
    [1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1] 
        ];
    
const TILE_WIDTH  = 72
const TILE_HEIGHT = 72
    
const CAMERA = new Camera(-100,0)
const player = new Sprite({x:200, y:90}, {x:50, y:50}, {x:100,y:1000})
const ghost = new Ghost({x:200, y:90}, {x:25, y:25}, {x:0, y: 0})
document.addEventListener('keydown', (e) => {
    switch(e.key.toUpperCase()) {
        case "W": player.isUp = true; break;
        case "S": player.isDown = true; break;
        case "A": player.isLeft = true; break;
        case "D": player.isRight = true; break;

        case "ARROWUP": ghost.isUp = true; break;
        case "ARROWDOWN": ghost.isDown = true; break;
        case "ARROWLEFT": ghost.isLeft = true; break;
        case "ARROWRIGHT": ghost.isRight = true; break;
    }

    
})
document.addEventListener('keyup', (e) => {
    switch(e.key.toUpperCase()) {
        case "W": player.isUp = false; break;
        case "S": player.isDown = false; break;
        case "A": player.isLeft = false; break;
        case "D": player.isRight = false; break;

        case "ARROWUP": ghost.isUp = false; break;
        case "ARROWDOWN": ghost.isDown = false; break;
        case "ARROWLEFT": ghost.isLeft = false; break;
        case "ARROWRIGHT": ghost.isRight = false; break;
}})

fetch('level-1.txt')
  .then(response => response.text())
  .then((text) => parseMap(text))
  .then(CAMERA.animate)