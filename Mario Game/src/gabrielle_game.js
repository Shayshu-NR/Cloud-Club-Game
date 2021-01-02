//Actual Game
// Initialize the Phaser Game object and set default game window size
const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
})

// Declare shared variables at the top so all methods can access them
var score = 0
var scoreText
var platforms
var diamonds
var cursors
var player
var enemy
var text;
var qBlock
var timedEvent
var hazard
var hammer
var hammer_instance = 0
var derivative
var integral;
var book
var lazer
var powerUp
var state = 3
var lives = 3
var timing
var powerUpHierarchy = { 'fireflower': 4, 'hammer': 3, 'integral': 3, 'text': 2, 'derivative': 2, 'coffee': 1, 'mushroom': 1, 'small': 0 }
var fireballs;
var playerPowerUp;
var keyReset = false
var keyResetJump = false;
var lastHit = 520
var hammerReturn = false;

/**
 * put check enemies height in the collision
 * try lazer.false
 */
function preload() {
    //~~~~~ Json file ~~~~~
    game.load.text("shayshu_json", "./JSON Files/game.json")
        //~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Background ~~~~~
    game.load.image('sky', './assets/sky.png')
    game.load.image('space', './assets/Space/Space_Background.jpg')
        //~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Neutral blocks ~~~~~
    game.load.image('ground', './assets/platform.png')
    game.load.image('brick', './assets/brick.png')
    game.load.spritesheet('qBlock', './assets/Question_block.png', 32, 32)
    game.load.image('iron', './assets/iron-block.png')
    game.load.image('flag_pole', './assets/flag_pole.png')
    game.load.image('asteroid', './assets/Space/Asteroid.png')
        //~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Enemies ~~~~~
    game.load.image('steve', './assets/steve.png')
    game.load.image('spike', './assets/spike.png')
    game.load.spritesheet('goomba', './assets/bluegoomba.png', 32, 32)
    game.load.spritesheet('astronaut', './assets/frosh_astronaut64x64.png', 64, 64)
        //~~~~~~~~~~~~~~~~~~~

    //~~~~~ Power ups ~~~~~
    game.load.image('fireflower', './assets/fireflower.png')
    game.load.image('hammer', './assets/32x32_hammer.png')
    game.load.image('mushroom', './assets/temp_mushroom.png')
    game.load.image('fireball', './assets/5d08f167c3a6a5d.png') <<
    
      
    game.load.spritesheet('text', './assets/textbook.png', 32, 32)
    game.load.image('derivative', './assets/derivative_1.png')
    game.load.image('integral', './assets/integral_1.png')
    game.load.image('coffee', './assets/powerups/coffee_1_30x32.png') >>>
     
        //~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Player model ~~~~~
    game.load.image('diamond', './assets/diamond.png')
    game.load.spritesheet('player', './assets/MainSprite2.png', 32, 32)
    game.load.spritesheet('big_purple_player', './assets/Big_Main_SpritePowerup.png', 32, 64)
    game.load.spritesheet('big_player', './assets/bigmainsprite2.png', 32, 64)
        //~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Sound ~~~~~
    game.load.audio("mario_die", './assets/smb_mariodie.wav')
        //~~~~~~~~~~~~~~~~~

    //~~~~~ Misc ~~~~~
    game.load.image("space_ship", './assets/lazer_red.png')
        //~~~~~~~~~~~~~~~~
}

function create() {
    //~~~~~ Loading json file ~~~~~
    console.log(Phaser.Keyboard);
    json_parsed = JSON.parse(game.cache.getText('shayshu_json'))
    console.log("Json file structure: ", json_parsed)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Physics engine ~~~~~
    game.physics.startSystem(Phaser.Physics.ARCADE)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Background ~~~~~
    var background_location = json_parsed.Background
    for (var i = 0; i < background_location.length; i++) {
        var bgd_x = background_location[i].x
        var bgd_y = background_location[i].y
        var bgd_src = background_location[i].src
        var bgd_tile = background_location[i].tile


        if (bgd_tile) {
            var bgd_height = background_location[i].height
            var bgd_width = background_location[i].width
            const new_tile = game.add.tileSprite(bgd_x, bgd_y, bgd_width, bgd_height, bgd_src)
            new_tile.fixedToCamera = true
            new_tile.tilePosition.x = game.camera.x * -0.2
        } else {
            const new_background = game.add.image(bgd_x, bgd_y, bgd_src)
        }
    }

    //~~~~~ Groups ~~~~~
    platforms = game.add.group()
    brick = game.add.group()
    qBlock = game.add.group()
    diamonds = game.add.group()
    powerUp = game.add.group()
    enemy = game.add.group()
    fireballs = game.add.group()
    hammer = game.add.group()
    hazard = game.add.group()
    derivative = game.add.group()
    integral = game.add.group()
    book = game.add.group()
    flag = game.add.group()
    lazer = game.add.group()
        //~~~~~~~~~~~~~~~~~~

    //~~~~~ Enable body ~~~~~
    platforms.enableBody = true
    brick.enableBody = true
    qBlock.enableBody = true
    diamonds.enableBody = true
    powerUp.enableBody = true
    enemy.enableBody = true
    fireballs.enableBody = true
    hammer.enableBody = true
    hazard.enableBody = true
    flag.enableBody = true
    lazer.enableBody = true
    derivative.enableBody = true
    integral.enableBody = true
    book.enableBody = true
        //~~~~~~~~~~~~~~~~~~~~~~~
    

    //~~~~~ Ground/ledge creation ~~~~~
    var ground_location = json_parsed.Ground
    for (var i = 0; i < ground_location.length; i++) {
        var grnd_start_x = ground_location[i].start_x
        var grnd_end_x = ground_location[i].end_x
        var grnd_height = ground_location[i].height
        var grnd_src = ground_location[i].src

        const ground = platforms.create(grnd_start_x, grnd_height, grnd_src);
        ground.scale.setTo((grnd_end_x - grnd_start_x) / 400, grnd_height / 32);
        ground.body.immovable = true
    }

    var platform_location = json_parsed.Platform
    for (var i = 0; i < platform_location.length; i++) {
        var plt_x = platform_location[i].x
        var plt_y = platform_location[i].y
        var plt_src = platform_location[i].src
        var plt_height = platform_location[i].height
        var plt_width = platform_location[i].width

        const ground = platforms.create(plt_x, plt_y, plt_src);
        ground.scale.setTo(plt_width / 400, plt_height / 32)
        ground.body.immovable = true
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Player attributes ~~~~~
    player = game.add.sprite(32, game.world.height - 150, 'player')
    game.physics.arcade.enable(player)
    player.lives = 3
    player.state = 3
    player.facing = 1;
    player.body.bounce.y = 0
    player.body.gravity.y = 1000
    player.body.collideWorldBounds = true
    player.currentState = 'small'

    player.animations.add('left', [10, 9, 8, 10, 7, 6, 10], 10, true)
    player.animations.add('left_blink', [10, 23, 9, 23, 8, 23, 10, 23, 7, 23, 6, 23, 10, 23], 10, true)
    player.animations.add('right_blink', [0, 23, 1, 23, 2, 23, 0, 23, 3, 23, 4, 23, 0, 23], 10, true)
    player.animations.add('right', [0, 1, 2, 0, 3, 4, 0], 10, true)
    player.animations.add('stop', [5], 10, true)
    player.animations.add('stop_blink', [23, 5, 23], 10, true)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Create the score text and timer ~~~~~
    scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#000' })
    scoreText.text = 'Score: 0';

    this.timeLimit = 500
    this.timeText = game.add.text(700, 20, "00:00")
    this.timeText.fill = "#000000"
    this.timer = game.time.events.loop(1000, tick, this)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Cursors ~~~~~
    cursors = game.input.keyboard.createCursorKeys({
            w: 'up',
            down: 'down',
            left: 'left',
            right: 'right',
            space: 'spacebar'
        })
        //~~~~~~~~~~~~~~~~~~~

    //~~~~~ Brick and Qblock parsing from json file ~~~~~
    var qBlock_location = json_parsed.QBlocks
    for (var i = 0; i < qBlock_location.length; i++) {
        var qBlock_x = qBlock_location[i].x
        var qBlock_y = qBlock_location[i].y
        var power_Up = qBlock_location[i].powerUp

        const question_block = qBlock.create(qBlock_x, qBlock_y, 'qBlock')
        question_block.powerUp = power_Up
        question_block.broken = false
        question_block.body.immovable = true
        question_block.animations.add('q_break', [0, 1, 2, 3], 150, true)
    }

    var brick_location = json_parsed.Bricks
    for (var i = 0; i < brick_location.length; i++) {
        var brick_x = brick_location[i].x
        var brick_y = brick_location[i].y
        var brick_counter = brick_location[i].counter

        const block = brick.create(brick_x, brick_y, 'brick')
        block.body.immovable = true
        block.counter = brick_counter
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~~~~~~~ Enemy creation ~~~~~~~~~~~~~~~
    var enemy_location = json_parsed.Enemies
    for (var i = 0; i < enemy_location.length; i++) {
        var nme_x = enemy_location[i].x
        var nme_y = enemy_location[i].y
        var nme_src = enemy_location[i].src
        var nme_tween_x = enemy_location[i].tween_x
        var nme_tween_y = enemy_location[i].tween_y
        var nme_tween_speed = enemy_location[i].tween_speed
        const nme_animate = enemy_location[i].animate
        const new_nme = enemy.create(nme_x, nme_y, nme_src)
        new_nme.static = enemy_location[i].static
        new_nme.health = enemy_location[i].health


        if (nme_tween_x != false) {
            var new_tween = game.add.tween(new_nme)
            new_tween.to({ x: nme_tween_x, y: nme_tween_y }, nme_tween_speed, null, true, 0, 100000000, true)
        }

        if (nme_animate != false) {
            new_nme.animations.add(nme_animate.name, nme_animate.frames, nme_animate.delay, true)
            new_nme.animations.play(nme_animate.name)
        }

        if (enemy_location[i].lazer) {
            var event = game.time.events.loop(2500, function(enemy_projectile) {
                const new_lazer = lazer.create(enemy_projectile[0].position.x, enemy_projectile[0].position.y, "space_ship");
                new_lazer.body.velocity.x = -500;
                console.log("Lazer: ", enemy_projectile[0].position);
            }, this, [new_nme])

            new_nme.lazer_timer = event
        }
        
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ Add Flag pole for end of level ~~~~~
    var flag_position = json_parsed.FlagPole
    const end_of_level = flag.create(flag_position.x, flag_position.y, flag_position.src)
    end_of_level.scale.setTo(1.5, 1.5)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //~~~~~ World and camera settings ~~~~~
    var world_bounds = json_parsed.World
    game.world.setBounds(0, 0, world_bounds.x, world_bounds.y)
    game.camera.follow(player)
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
}

function update() {
    //  We want the player to stop when not moving
    player.body.velocity.x = 0

    timing = Math.floor(this.timeLimit)
    if ((lastHit - timing) > 2) {
        player.isInvincible = false
    }

    //  Setup collisions for the player, diamonds, and our platforms
    game.physics.arcade.collide(player, platforms)
    game.physics.arcade.collide(diamonds, platforms)
    game.physics.arcade.collide(enemy, platforms)
    game.physics.arcade.collide(player, qBlock, question_break, null, this)
    game.physics.arcade.collide(player, brick, brick_break, null, this)
    game.physics.arcade.collide(diamonds, qBlock)
    game.physics.arcade.collide(powerUp, qBlock)
    game.physics.arcade.collide(player, powerUp, powerUp_ingest, null, this)
    game.physics.arcade.collide(hazard, platforms)
    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this)
    game.physics.arcade.collide(fireballs, enemy, function enemyKill(fireballs, enemy) {
        enemy.kill();
        fireballs.kill();

        enemy.lazer_timer.loop = false

    }, null, this)
    game.physics.arcade.collide(derivative, enemy, function enemyKill(derivative, enemy) {
        enemy.kill();
        derivative.kill();
        enemy.lazer_timer.loop = false
    }, null, this)
    game.physics.arcade.collide(integral, enemy, function enemyKill(integral, enemy) {
        enemy.kill();
        integral.kill();
        enemy.lazer_timer.loop = false
    }, null, this)
    game.physics.arcade.collide(platforms, fireballs, fireballKill, null, this)
    game.physics.arcade.collide(player, flag, function next_level(player, flag) {
        //alert("You won");
        location.reload(true);
    }, null, this)
    game.physics.arcade.collide(platforms, integral, integralKill, null, this)
    game.physics.arcade.collide(platforms, derivative, derivativeKill, null, this)
    game.physics.arcade.collide(hammer, enemy, function enemyKill(hammer, enemy) {
        enemy.kill();
        enemy.lazer_timer.loop = false
        hammer.body.velocity.x *= -1;
    }, null, this)
    game.physics.arcade.collide(hammer, player, hammerGrab, null, this)
    

    if (!player.isInvincible){
        game.physics.arcade.overlap(player, enemy, function(enemy, player){
            kill_mario(enemy, player)
        }, null, this);
        game.physics.arcade.collide(player, lazer, kill_mario, null, this)
    }

    //does the mario coin brick interaction where the diamond gets killed and added to score board
    //issue - we can't have diamonds prespawned on bricks
    game.physics.arcade.collide(brick, diamonds, collectBDiamond, null, this)

    //  Call callectionDiamond() if player overlaps with a diamond
    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this)



    var velocity_x = 300
    var velocity_y = -500
        // Configure the controls!
    if (player.currentState == 'coffee') {
        velocity_x = 700;
    }
    if (cursors.left.isDown) {
        player.body.velocity.x = -velocity_x;
        if (player.isInvincible) {
            player.animations.play('left_blink')
        } else {
            player.animations.play('left')
        }
    } else if (cursors.right.isDown) {
        player.body.velocity.x = velocity_x;
        if (player.isInvincible) {
            player.animations.play('right_blink')
        } else {
            player.animations.play('right')
        }
    } else {
        if (player.isInvincible) {
            player.animations.play('stop_blink')
        } else {
            player.animations.play('stop')
        }
    }
    if (player.currentState == 'bubbletea') {
        velocity_y = -700
    }

    //  This allows the player to jump!
    if (player.body.touching.down) {
        jumpCount = 2;
    }
    if (game.input.keyboard.justPressed(Phaser.Keyboard.W) && jumpCount > 0 && !keyResetJump) {
        keyResetJump = true;
        player.body.velocity.y = velocity_y;
        jumpCount--;
    }
    if (game.input.keyboard.justReleased(Phaser.Keyboard.UP)) {
        keyResetJump = false;
    }

    if (player.position.y >= 568) {
        falloutofworld(player);
    }

    if (player.currentState == 'fireflower') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            Fireballs(fireballs, player)
        }
        if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            keyReset = false;
        }
    }

    if (player.currentState == 'hammer') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            console.log("Make hammer")
            hammer_instance = hammerTime(hammer, player)
        }
    }

    if (player.currentState == 'text') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            TextBook(book, player)
        }
        if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            keyReset = false;
        }

    }

    if (player.currentState == 'text') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            TextBook(book, player)
        }
        if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            keyReset = false;
        }
    }

    if (player.currentState == 'derivative') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            Derivatives(derivative, player)
        }
        if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            keyReset = false;
        }
    }

    if (player.currentState == 'integral') {
        if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && !keyReset) {
            keyReset = true;
            Integrals(integral, derivative, player)
        }
        if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            keyReset = false;
        }
    }

    if (hammer_instance != 0) {
        if (hammer_instance.body.position.x >= hammer_instance.forward_limit) {
            hammer_instance.body.velocity.x *= -1
        } else if (hammer_instance.body.position.x < hammer_instance.backwards_limit) {
            console.log("Reached backwards limit")
            hammer_instance.kill()
            keyReset = false
            hammer_instance = 0
        }
    }

    this.timeText.x = 700 + this.camera.view.x
    scoreText.x = 16 + this.camera.view.x

}

//~~~~~ Render ~~~~~
function render() {
    this.game.debug.text(`Debugging Phaser ${Phaser.VERSION}`, 200, 20, 'yellow', 'Segoe UI');
    this.game.debug.cameraInfo(this.game.camera, 200, 32);
    this.game.debug.spriteInfo(player, 500, 32);
}
//~~~~~~~~~~~~~~~~~~



//~~~~~ Timer and score ~~~~~
var tick = function() {
    this.timeLimit--;
    var minutes = Math.floor(this.timeLimit / 60);
    var seconds = this.timeLimit - (minutes * 60);
    var timeString = addZeros(minutes) + ":" + addZeros(seconds);
    this.timeText.text = timeString;
    if (this.timeLimit === 0) {
        outofTime();
    }
};

var addZeros = function(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return num;
};

var outofTime = function() {
    var die_noise = game.add.audio("mario_die");
    die_noise.play();
    alert("Out of Time!");
    location.reload();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~ Death Scripts ~~~~~
function falloutofworld(player) {
    player.kill();
    var die_noise = game.add.audio("mario_die");
    die_noise.play();
    alert("Game over");
    location.reload();
}

function kill_mario(player, hazard) {
    //this checks whether mario has a power up or not.
    if(!hazard.static && hazard.position.y>player.position.y + player.height){
        
        //add if the sprite is a certain texture kill the event for that texture
        // bullets for astronauts
        if(hazard.health>=0){
            console.log(hazard.health)
            if(hazard.health!=0){
                hazard.health--
            }
            else hazard.kill()
        }
        
    }
    else if(powerUpHierarchy[player.currentState] >= 1) {

        player.state--
        console.log("State:" + powerUpHierarchy[player.currentState])
        lastHit = timing
        player.isInvincible = true

        if (powerUpHierarchy[player.currentState] >= 2) {
            player.currentState = "mushroom";
            player.loadTexture("big_player");
        } else if (powerUpHierarchy[player.currentState] == 1) {
            player.currentState = "small";
            player.loadTexture("player");
        }

    } else {
        //life is lost
        lives--
        if (lives <= 0) {
            //needs to be across the screen in big red letters
            alert("All lives lost! Game over");
            this.input.keyboard.enabled = false
        }
        player.kill();

        var die_noise = game.add.audio("mario_die");
        //die_noise.play();

        location.reload(true);
    }
    
}

//~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~ Neutral Block Collision ~~~~~
function brick_break(player, block) {
    //Only break the brick when the player is below 
    //and not hittin gon the sides
    console.log('Player (x,y):', "(", player.position.x, player.position.y, ")")
    console.log('Block (x,y):', "(", block.position.x, block.position.y, ")")

    var player_x = player.position.x
    var player_y = player.position.y

    var block_x = block.position.x
    var block_y = block.position.y

    if (player_y < block_y) {
        return
    } else if (player_x > block_x + 16) {
        return
    } else if (player_x < block_x - 16) {
        return
    } else if (block.counter > 0) {
        block.counter--
            var break_sound = game.add.audio('brick_sound')
        break_sound.play()
        const dia = diamonds.create(block_x, block_y - 50, 'diamond')
        dia.body.gravity.y = 1000
        dia.body.velocity.y = -100
        dia.body.bounce.y = 1
    } else {
        block.kill()
    }

}

function question_break(player, block) {
    //Only break the question mark block when the player is below 
    //and not hittin on the sides

    var player_x = player.position.x
    var player_y = player.position.y

    var block_x = block.position.x
    var block_y = block.position.y

    if (player_y < block_y) {
        return
    } else if (player_x > block_x + 16) {
        return
    } else if (player_x < block_x - 16) {
        return
    } else if (!block.broken) {
        console.log(block)
        block.animations.play('q_break', 60, false)
            // block.loadTexture('iron')
        var break_sound = game.add.audio('brick_sound')
        break_sound.play()

        //get powerup to slide up from question mark brick
        const new_powerUp = powerUp.create(block_x, block_y - 32, block.powerUp)
        new_powerUp.power_type = block.powerUp
        new_powerUp.body.gravity.y = 0.98
        new_powerUp.body.bounce.y = 0.3 + Math.random() * 0.2
        block.broken = true
    } else {
        return
    }

}

function collectDiamond(player, diamond) {
    console.log("Unique ID for diamound: ", diamond.unique)
        // Removes the diamond from the screen
    diamond.kill()

    //  And update the score
    score += 10
    scoreText.text = 'Score: ' + score
}

function collectBDiamond(brick, diamond) {
    // Removes the diamond from the screen for the brick and diamond interaction
    diamond.kill()

    //  And update the score
    score += 10
    scoreText.text = 'Score: ' + score
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~ Power Up Ingestion ~~~~~
function powerUp_ingest(player, powerUp) {
    console.log(player)

    if (powerUpHierarchy[player.currentState] <= powerUpHierarchy[powerUp.power_type]) {
        player.body.height = 64
        player.currentState = powerUp.power_type

        if (powerUp.power_type == 'fireflower') {
            player.loadTexture('big_purple_player')
            powerUp.kill()
        } else if (powerUp.power_type == 'mushroom') {
            player.loadTexture('big_player')
            powerUp.kill()
        } else if (powerUp.power_type == "hammer") {
            player.loadTexture("big_player")
            powerUp.kill()
        } else if (powerUp.power_type == "text") {
            player.loadTexture("big_player")
            powerUp.kill()
        } else if (powerUp.power_type == "derivative") {
            player.loadTexture("big_player")
            powerUp.kill()
        } else if (powerUp.power_type == "integral") {
            player.loadTexture("big_player")
            powerUp.kill()
        } else if (powerUp.power_type == 'coffee') {
            player.loadTexture('big_player');
            game.time.events.add(10000, function(player) {
                console.log("Getting rid of coffee")
                player[0].currentState = "mushroom";
            }, this, [player])
        }
    }
    powerUp.kill()
    console.log(player.currentState)
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~ Player Projectiles ~~~~~
function Derivatives(derivative, player) {
    console.log(player.body.velocity)
    const d = derivative.create(player.position.x, player.position.y, "derivative")
    d.body.gravity.y = 400;
    d.body.velocity.y = 0;
    d.bounce = 0;
    d.body.velocity.x = 500 * player.facing;
}

function Integrals(integral, derivative, player) {
    console.log(player.body.velocity)
    const i = integral.create(player.position.x, player.position.y, "integral")
    i.body.gravity.y = 400;
    i.body.velocity.y = 0;
    i.bounce = 0;
    i.body.velocity.x = 500 * player.facing;

    const d = derivative.create(player.position.x, player.position.y, "derivative")
    d.body.gravity.y = 300;
    d.body.velocity.y = 0;
    d.bounce = 0; 
    d.body.velocity.x = 600 * -player.facing 
}

function TextBook(book, player) {
    const t = derivative.create(player.position.x, player.position.y, 'text')
    t.body.gravity.y = 300;
    t.body.velocity.y = 0;
    t.bounce = 0;
    t.body.velocity.x = 600 * player.facing
    t.animations.add('rotate', [0, 1, 2, 3], 500, true)
    t.animations.play('rotate')

    d.body.velocity.x = 600 * -player.facing 
        
}

function TextBook(book, player) {
    const t = derivative.create(player.position.x, player.position.y, 'text')
    t.body.velocity.y = 0;
    t.bounce = 0;
    t.body.velocity.x = 600 * player.facing
    t.animations.add('rotate', [0, 1, 2, 3], 10, true)
    t.animations.play('rotate')
}

function hammerTime(hammer, player) {
    var player_x = player.position.x;
    var player_y = player.position.y;

    //depends on player size, if the player is big, we need the projectile to be slightly lower to hit the enemy
    const h = hammer.create(player_x, player_y + 16, 'hammer')

    h.forward_limit = player_x + (300 * player.facing)
    h.backwards_limit = player_x
        //adding some spin

    h.return = false;
    h.body.angularVelocity = 1000;
    h.body.velocity.y = 0;
    h.body.velocity.x = 200 * player.facing;
    return h;
}

function Fireballs(fireballs, player) {

    console.log(player.body.velocity)
    const f = fireballs.create(player.position.x, player.position.y, "fireball")
    f.body.gravity.y = 400;
    f.body.velocity.y = 0;
    f.bounce = 0;
    f.body.velocity.x = 400 * player.facing;

}

function fireballKill(platforms, fireballs) {
    console.log("Platfors in FBK: ", platforms.position.y, fireballs.position.y)
    if (fireballs.position.y + 28 >= platforms.position.y) {
        fireballs.kill();
        return;
    }

    fireballs.body.velocity.y = -100;
    fireballs.bounce++;
    if (fireballs.bounce == 5) {
        fireballs.kill();
    }

}

function derivativeKill(platforms, derivative) {
    derivative.body.velocity.y = -100;
    derivative.bounce++;
    if (derivative.bounce == 5) {
        derivative.kill();
    }
}

function integralKill(platforms, integral) {
    integral.body.velocity.y = -100;
    integral.bounce++;
    if (integral.bounce == 5) {
        integral.kill();
    }

}

function hammerGrab(player, hammer) {
    hammer.kill();
    keyReset = false;
}

function hammerReturn() {
    console.log("Return");
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~