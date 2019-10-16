import Phaser from 'phaser';

import backgroundSrc from './assets/images/background.png';
import spikeSrc from './assets/images/spike.png';
import playerSrc from './assets/images/kenney_player.png';
import tilesSrc from './assets/tilesets/platformPack_tilesheet.png';

import playerAtlasJson from './assets/images/kenney_player_atlas.json';
import levelOneJson from './assets/tilemaps/level1.json';

const createPlayerStateMachine = () => {
  let state = 'INITIAL';

  const transition = newState => {
    switch (state) {
      case 'INITIAL':
        switch (newState) {
          case 'JUMPING':
            state = 'JUMPING';
            break;
          default:
            break;
        }
        break;
      case 'JUMPING':
        switch (newState) {
          case 'JUMPING':
            state = 'DOUBLE_JUMPING';
            break;
          case 'INITIAL':
            state = 'INITIAL';
            break;
          default:
            break;
        }
        break;

      case 'DOUBLE_JUMPING':
        switch (newState) {
          case 'INITIAL':
            state = 'INITIAL';
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  return {
    getState: () => state,
    transition,
  };
};

const playerMachine = createPlayerStateMachine();

function preload() {
  this.load.image('background', backgroundSrc);
  this.load.image('spike', spikeSrc);
  // At last image must be loaded with its JSON
  this.load.atlas('player', playerSrc, playerAtlasJson);
  this.load.image('tiles', tilesSrc);
  // Load the export Tiled JSON
  this.load.tilemapTiledJSON('map', levelOneJson);
}

function create() {
  // background
  const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
  backgroundImage.setScale(2, 0.8);

  const map = this.make.tilemap({ key: 'map' });

  const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');

  const platforms = map.createStaticLayer('Platforms', tileset, 0, 200);
  platforms.setCollisionByExclusion(-1, true);

  // player
  this.player = this.physics.add.sprite(50, 300, 'player');
  this.player.setBounce(0.1);
  this.player.setCollideWorldBounds(true);
  this.physics.add.collider(this.player, platforms);

  // walking animations
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'robo_player_',
      start: 2,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'robo_player_0' }],
    frameRate: 10,
  });

  this.anims.create({
    key: 'jump',
    frames: [{ key: 'player', frame: 'robo_player_1' }],
    frameRate: 10,
  });

  // enable cursors for control
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const onTheFloor = this.player.body.onFloor();

  // Control the player with left or right keys
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-200);
    if (onTheFloor) {
      this.player.play('walk', true);
    }
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(200);
    if (onTheFloor) {
      this.player.play('walk', true);
    }
  } else {
    // If no keys are pressed, the player keeps still
    this.player.setVelocityX(0);
    // Only show the idle animation if the player is footed
    // If this is not included, the player would look idle while jumping
    if (onTheFloor) {
      this.player.play('idle', true);
    }
  }

  if (onTheFloor && playerMachine.getState() !== 'INITIAL') {
    playerMachine.transition('INITIAL');
  }

  // Player can jump while walking any direction by pressing the space bar
  // or the 'UP' arrow
  if (
    Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
    (playerMachine.getState() === 'INITIAL' || playerMachine.getState() === 'JUMPING')
  ) {
    playerMachine.transition('JUMPING');
    this.player.setVelocityY(-350);
    this.player.play('jump', true);
  }

  // If the player is moving to the right, keep them facing forward
  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    // otherwise, make them face the other side
    this.player.setFlipX(true);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  heigth: 640,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
