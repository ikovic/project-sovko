import { Machine, interpret } from 'xstate';

const actions = {
  setIdleAnimation: (context, { player, type }) => {
    if (player) {
      player.setVelocityX(0);
      player.setVelocityY(0);
      player.play('idle', true);
    }
  },
  moveHorizontally: (context, event) => {
    const { player, direction } = event;
    if (direction === 'left') {
      player.setVelocityX(-200);
    } else {
      player.setVelocityX(200);
    }
  },
  setWalkingAnimation: (context, { player }) => {
    player.play('walk', true);
  },
  setJumpingAnimation: (context, { player, type }) => {
    player.setVelocityY(-350);
    player.play('jump', true);
  },
};

const jumpingStates = {
  initial: 'AIRBORNE',
  states: {
    AIRBORNE: {
      on: {
        startWalking: {
          target: 'AIRBORNE_WALKING',
          actions: ['moveHorizontally'],
        },
        jump: 'DOUBLE_JUMPING',
      },
    },
    AIRBORNE_WALKING: {
      on: {
        stopWalking: 'AIRBORNE',
      },
    },
    DOUBLE_JUMPING: {},
  },
};

export const createPlayerStateMachine = playerName => {
  const playerMachine = Machine(
    {
      id: playerName,
      context: {
        playerName,
      },
      strict: true,
      initial: 'IDLE',
      states: {
        IDLE: {
          entry: ['setIdleAnimation'],
          on: {
            walk: {
              target: 'WALKING',
              actions: ['moveHorizontally', 'setWalkingAnimation'],
            },
            jump: 'JUMPING',
          },
        },
        WALKING: {
          on: {
            stopWalking: 'IDLE',
          },
        },
        JUMPING: {
          entry: ['setJumpingAnimation'],
          on: {
            land: 'IDLE',
          },
          /* ...jumpingStates, */
        },
      },
    },
    { actions }
  );

  return playerMachine;
};

export const createPlayerService = playerMachine => interpret(playerMachine);
