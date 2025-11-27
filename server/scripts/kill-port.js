const { exec } = require('child_process');
const os = require('os');

const PORT = process.argv[2] || 5000;

function killPort(port) {
  const platform = os.platform();

  if (platform === 'win32') {
    // Windows
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        console.log(`No process found on port ${port}`);
        return;
      }

      const lines = stdout.split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      });

      if (pids.size === 0) {
        console.log(`No process found on port ${port}`);
        return;
      }

      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (killError, killStdout) => {
          if (killError) {
            console.error(`Failed to kill process ${pid}:`, killError.message);
          } else {
            console.log(`✓ Killed process ${pid} on port ${port}`);
          }
        });
      });
    });
  } else {
    // Unix-like (Mac, Linux)
    exec(`lsof -ti:${port}`, (error, stdout) => {
      if (error) {
        console.log(`No process found on port ${port}`);
        return;
      }

      const pids = stdout.trim().split('\n').filter(pid => pid);

      if (pids.length === 0) {
        console.log(`No process found on port ${port}`);
        return;
      }

      pids.forEach(pid => {
        exec(`kill -9 ${pid}`, (killError) => {
          if (killError) {
            console.error(`Failed to kill process ${pid}:`, killError.message);
          } else {
            console.log(`✓ Killed process ${pid} on port ${port}`);
          }
        });
      });
    });
  }
}

console.log(`Checking for processes on port ${PORT}...`);
killPort(PORT);
