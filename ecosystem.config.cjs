module.exports = {
  apps: [
    {
      name: 'premium-web',
      script: '.next/standalone/server.js',
      cwd: '/var/www/premium-web',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/premium-web-error.log',
      out_file: '/var/log/pm2/premium-web-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
