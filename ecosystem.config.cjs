module.exports = {
  apps: [{
    name: 'astro-profuso',
    script: './dist/server/entry.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 4321,
    },
    env_file: '.env',
    error_file: '/root/.pm2/logs/astro-profuso-error.log',
    out_file: '/root/.pm2/logs/astro-profuso-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
