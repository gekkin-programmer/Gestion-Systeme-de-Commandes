// PM2 cluster config — run with: pm2 start ecosystem.config.js
// This uses all CPU cores. Each instance shares state via Redis.
module.exports = {
  apps: [
    {
      name: 'restaurant-api',
      script: './dist/index.js',
      instances: 'max',          // one worker per CPU core
      exec_mode: 'cluster',      // Node.js cluster mode (shared port)
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // Restart on crash, but not repeatedly in a short window
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      // Zero-downtime reload: pm2 reload restaurant-api
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 30000,       // matches graceful shutdown timeout
      // Log rotation
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
    },
  ],
};
