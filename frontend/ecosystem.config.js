module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/smart-asset/frontend',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      kill_timeout: 8000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
