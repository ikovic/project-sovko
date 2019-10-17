export const createPlayerStateMachine = () => {
  let state = 'INITIAL';

  const transition = command => {
    const _state = state;

    switch (state) {
      case 'INITIAL':
        switch (command.name) {
          case 'JUMP':
            state = 'JUMPING';
            break;
          case 'RUN':
            state = 'RUNNING';
            break;

          default:
            break;
        }
        break;

      case 'RUNNING':
        switch (command.name) {
          case 'JUMP':
            state = 'JUMPING';
            break;
          case 'GO_IDLE':
            state = 'INITIAL';
            break;
          default:
            break;
        }
        break;

      case 'JUMPING':
        switch (command.name) {
          case 'JUMP':
            state = 'DOUBLE_JUMPING';
            break;
          case 'GO_IDLE':
            state = 'INITIAL';
            break;
          default:
            break;
        }
        break;

      case 'DOUBLE_JUMPING':
        switch (command.name) {
          case 'GO_IDLE':
            state = 'INITIAL';
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }

    console.log(state);

    // execute only if state changed
    if (state !== _state && typeof command.execute === 'function') {
      command.execute();
    }
  };

  return {
    getState: () => state,
    transition,
  };
};
