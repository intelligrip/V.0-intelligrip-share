
const fs = require('fs');
const path = require('path');

const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const scriptToRun = fs.existsSync(buildIdPath) ? 'start' : 'dev';

module.exports = {
  apps: [{
    name: 'nextjs',
    script: 'npm',
    args: `run ${scriptToRun}`,
    autorestart: true,
  }]
};
