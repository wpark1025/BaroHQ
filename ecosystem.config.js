module.exports = {
  apps: [
    {
      name: 'barohq-dashboard',
      cwd: './dashboard',
      script: 'npm',
      args: 'run start',
      env: { PORT: 3000 },
    },
    {
      name: 'barohq-bridge',
      cwd: './bridge',
      script: 'npm',
      args: 'run start',
      env: { PORT: 3001 },
    },
  ],
};
