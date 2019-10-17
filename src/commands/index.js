export const createRunCommand = (player, direction) => {
  const execute = () => {
    if (direction === 'left') {
      player.setVelocityX(-200);
    } else {
      player.setVelocityX(200);
    }
    player.play('walk', true);
  };

  return {
    name: 'RUN',
    execute,
  };
};

export const createGoIdleCommand = player => {
  const execute = () => {
    player.setVelocityX(0);
    player.play('idle', true);
  };

  return {
    name: 'GO_IDLE',
    execute,
  };
};

export const createJumpCommand = player => {
  const execute = () => {
    player.setVelocityY(-350);
    player.play('jump', true);
  };

  return {
    name: 'JUMP',
    execute,
  };
};
