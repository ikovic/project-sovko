import { Machine, interpret } from 'xstate';

const actions = {
  setIdleAnimation: (context, { player }) => {
    if (player) {
      player.setVelocityX(0);
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
  setJumpingAnimation: (context, { player }) => {
    player.setVelocityY(-350);
    player.play('jump', true);
  },
};

const jumpingStates = {
  initial: 'AIRBORNE',
  states: {
    AIRBORNE: {
      on: {
        walk: 'AIRBORNE_WALKING',
        jump: 'DOUBLE_JUMPING',
      },
    },
    AIRBORNE_WALKING: {
      entry: ['moveHorizontally'],
      on: {
        stopWalking: 'AIRBORNE',
      },
    },
    DOUBLE_JUMPING: {
      entry: ['setJumpingAnimation'],
      on: {
        walk: 'AIRBORNE_WALKING',
      },
    },
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
            jump: 'JUMPING',
          },
        },
        JUMPING: {
          entry: ['setJumpingAnimation'],
          on: {
            land: 'IDLE',
          },
          ...jumpingStates,
        },
      },
    },
    { actions }
  );

  return playerMachine;
};

// TODO open an issue on github, original interpreter executes every action every time
// Might have something to do with batching
// export const createPlayerService = playerMachine => interpret(playerMachine);

export const createPlayerService = playerMachine => {
  let currentState = playerMachine.initialState;

  return {
    send: events => {
      events.forEach(event => {
        currentState = playerMachine.transition(currentState, event);
        currentState.actions.forEach(action => action.exec(currentState.context, currentState.event));
      });
      console.log(currentState.value);
    },
    state: () => currentState,
  };
};
