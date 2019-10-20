import Phaser from 'phaser';

import backgroundSrc from './assets/images/background.png';
import spikeSrc from './assets/images/spike.png';
import playerSrc from './assets/images/kenney_player.png';
import tilesSrc from './assets/tilesets/platformPack_tilesheet.png';

import playerAtlasJson from './assets/images/kenney_player_atlas.json';
import levelOneJson from './assets/tilemaps/level1.json';

import { createPlayerStateMachine, createPlayerService } from './state';

let playerMachine;
let playerService;

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

  // init state machines
  playerMachine = createPlayerStateMachine('sovko');
  playerService = createPlayerService(playerMachine);

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
  const events = [];

  // check if landed
  const landedFromAJump = this.player.body.deltaY() > 0 && this.player.body.onFloor();
  if (landedFromAJump && playerService.state().value.JUMPING) {
    events.push({ type: 'land', player: this.player });
  }

  // TODO resume moving after landing - IDLE makes you stop even if you hold the control

  // walking state machine
  if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
    const runEvent = { type: 'walk', player: this.player, direction: 'left' };
    events.push(runEvent);
  } else if (Phaser.Input.Keyboard.JustUp(this.cursors.left)) {
    const stopWalkingEvent = { type: 'stopWalking', player: this.player, direction: 'left' };
    events.push(stopWalkingEvent);
  } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
    const runEvent = { type: 'walk', player: this.player, direction: 'right' };
    events.push(runEvent);
  } else if (Phaser.Input.Keyboard.JustUp(this.cursors.right)) {
    const stopWalkingEvent = { type: 'stopWalking', player: this.player, direction: 'right' };
    events.push(stopWalkingEvent);
  } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
    events.push({ type: 'jump', player: this.player });
  }

  // batch state update
  if (events.length) {
    playerService.send(events);
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
