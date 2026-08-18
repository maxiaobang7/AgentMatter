const projectDirectory = process.env.AGENTMATTER_PROJECT_DIR || "/www/wwwroot/agentmatter";

module.exports = {
  apps: [
    {
      name: "agentmatter",
      cwd: projectDirectory,
      script: "./node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: "768M",
      kill_timeout: 30000,
      time: true,
      merge_logs: true,
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
