let gameBox = document.querySelector("#game-box");
let gameStats = document.querySelector("#game-stats")
let userLives = document.querySelector("#user-lives");
let userPoints = document.querySelector("#user-points");
let lastScore = document.querySelector("#last-score");

let cat = document.querySelector("#cat");
let catPosition = parseInt(getComputedStyle(cat).left);

let bulletNumber = 1;
let enemyNumber = 1;
let allBullets = [];
let allEnemies = [];
let bulletList = {};
let enemyList = {};

let bulletSpeed = 9;
let enemySpawnRate = 1250;
let enemySpeed = 25;

let lives = 3;
let points = 0;

class Bullet {
    constructor() {
        this.startingXPosition = catPosition + 27.5,
        this.currentYPosition = 25;
        this.bulletBody = document.createElement("div");
        this.bulletName;
        this.bulletRemove = false;
    }
    create(number) {
        this.bulletName = `bullet${number}`

        this.bulletBody.classList.add("bullet")
        this.bulletBody.style.left = `${this.startingXPosition}px`
        gameBox.append(this.bulletBody)
    }
    moveUp() {
        this.currentYPosition += 5;
        this.bulletBody.style.bottom = `${this.currentYPosition}px`

        if(this.currentYPosition >= 400) {
            return false
        } else {
            return true
        }     
    }
    updateCoordinates() {
        //returns x midpoint and y top
        return [(this.startingXPosition + 1.5),(this.currentYPosition)]
    }
    remove(bulletName) {
        if(bulletName === this.bulletName){
            this.bulletBody.remove()
            this.bulletRemove = true;
        }
    }
    stopBulletInterval() {
        if (this.bulletRemove) {
            return true
        }
    }
}
class Enemy {
    constructor() {
        this.startingXPosition = 5 + Math.floor(Math.random() * 740);
        this.currentYPosition = 0;
        this.enemyBody = document.createElement("div");
        this.enemyName;
        this.enemyRemove = false;
    }
    create(number) {
        this.enemyName = `enemy${number}`

        this.enemyBody.classList.add("enemy")
        this.enemyBody.style.left = `${this.startingXPosition}px`
        gameBox.append(this.enemyBody)
    }
    moveDown() {
        this.currentYPosition += 2;
        this.enemyBody.style.top = `${this.currentYPosition}px`

        if(this.currentYPosition >= 415) {
            return false
        } else {
            return true
        }     
    }
    updateCoordinates() {
        if(!this.enemyRemove){
            //returns x left, x right, y top, y bottom
            return [(this.startingXPosition), (this.startingXPosition + 40), (400 - this.currentYPosition), (400 - this.currentYPosition - 30)]
        } else {
            return ""
        }
    }
    remove(enemyName) {
        if(enemyName === this.enemyName){
            this.enemyBody.remove()   
            this.enemyRemove = true;
        }
    }
    removeAll() {
        this.enemyBody.remove()
        this.enemyRemove = true;
    }
    stopEnemyInterval() {
        if (this.enemyRemove) {
            return true
        }
    }
}

// Moving the game piece left and right
function moveCat(event) {
    if(lives > 0) {
        if(event.key === "ArrowLeft") {
            moveCatLeft()
        } else if(event.key === "ArrowRight") {
            moveCatRight()
        }
    }
}
function moveCatLeft() {
    if(catPosition > 0) {
        catPosition = catPosition - 25;
        cat.style.left = `${catPosition}px`
    }
}
function moveCatRight() {
    if(catPosition < 750) {
        catPosition = catPosition + 25;
        cat.style.left = `${catPosition}px`
    }
}


//Shooting Bullets
function fireBullet(event) {
    if(event.key === " " && lives > 0) {
        var bullet = new Bullet;
        bullet.create(bulletNumber)
        bulletNumber++

        allBullets.push(bullet)
        bulletList[bullet.bulletName] = bullet.updateCoordinates()

        let movingBullet = setInterval(
            function() {
                let move = bullet.moveUp()
                
                
                bulletList[bullet.bulletName] = bullet.updateCoordinates()

                checkCollision();

                let stop = bullet.stopBulletInterval();

                if(!move || stop) {
                    clearInterval(movingBullet)
                }
            }
        ,bulletSpeed)

    }
}

//Falling Items
function enemiesAppearing() {
    enemiesRate = setInterval(
        function() {
            let enemy = new Enemy;
            enemy.create(enemyNumber);
            enemyNumber++

            allEnemies.push(enemy)
            enemyList[enemy.enemyName] = enemy.updateCoordinates()

            let movingEnemy = setInterval(
                function() {

                    if(lives > 0) {
                        let move = enemy.moveDown();
                        

                        enemyList[enemy.enemyName] = enemy.updateCoordinates();

                        let stop = enemy.stopEnemyInterval();

                        if(!move || stop) {
                            clearInterval(movingEnemy)
                            if(!move) {
                                lives--;
                                updateScoreBoard()
                                
                                if(lives <= 0) {
                                    clearInterval(enemiesRate)
                                    gameOver();
                                }
                            }
                        }
                        
                    }
                }
            ,enemySpeed)
        }
    ,enemySpawnRate)
}

function checkCollision() {
    for (let [bulletKey, bulletValue] of Object.entries(bulletList)) {
        for (let [enemyKey, enemyValue] of Object.entries(enemyList)) {
            
            //if bullet coordinates are in the enemy coordinate box
            if((bulletValue[0] > enemyValue[0]) && (bulletValue[0] < enemyValue[1]) && (bulletValue[1] < enemyValue[2]) && (bulletValue[1] > enemyValue[3])) {
                points++
                updateScoreBoard();
                updateEnemieRates();

                bulletList[bulletKey] = ""
                enemyList[enemyKey] = ""
                removeBulletAndEnemy(bulletKey, enemyKey)
            }

        }
    }
}

function removeBulletAndEnemy(bulletRemove, enemyRemove) {
    allBullets.forEach(bullet => {
        bullet.remove(bulletRemove);
    })

    allEnemies.forEach(enemy => {
        enemy.remove(enemyRemove)
    })

}

function updateScoreBoard() {
    userLives.textContent = lives;
    userPoints.textContent = points;
}

function updateEnemieRates() {
    //console.log("updating")
    //change spawn and speed of enemies
    if(points % 3 === 0) {
        if (enemySpeed > 15) {
            enemySpeed -= 2
            //console.log("Enemy Speed: " + enemySpeed)
        } else if (enemySpeed >= 10) {
            enemySpeed -= 1
            //console.log("Enemy Speed: " + enemySpeed)
        }
    }

}

function gameOver() {
    allEnemies.forEach(enemy => {
        enemy.removeAll()
    })

    lastScore.textContent = points;
    
    overlay.style.display = "flex";
    startButton.style.display = "block";
    gameOverText.style.display = "block";
    cat.style.display = "none";
    
}

function resetVariables() {
    bulletNumber = 1;
    enemyNumber = 1;
    allBullets = [];
    allEnemies = [];
    bulletList = {};
    enemyList = {};

    bulletSpeed = 9;
    enemySpeed = 25;

    lives = 3;
    points = 0;
}

function startShooterGame() {
    if (gameStart) {
        gameStats.style.display = "block";
        cat.style.display = "block";

        resetVariables()
        updateScoreBoard();
        enemiesAppearing();
        document.addEventListener("keydown", moveCat);
        document.addEventListener("keydown", fireBullet)
    }
}

