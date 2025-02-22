const express = require('express');
const { Client } = require('ssh2');
const router = express.Router();

const MIKROTIK_DEVICES = [
  {
    ip: '190.122.88.126',
    username: 'zalems',
    password: 'flaco1983A',
    port: 8722,
  },
  {
    ip: '190.122.88.114',
    username: 'zalems',
    password: 'flaco1983A',
    port: 8722,
  },
];

const fetchMikroTikInfo = (device) =>
  new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on('ready', () => {
        conn.exec('/system resource print', (err, stream) => {
          if (err) {
            reject(`Error executing command on ${device.ip}: ${err}`);
            return conn.end();
          }
          let data = '';
          stream
            .on('close', () => {
              const info = data
                .trim()
                .split('\n')
                .reduce((acc, line) => {
                  const [key, value] = line.split(':').map((str) => str.trim());
                  acc[key] = value;
                  return acc;
                }, {});
              resolve({
                ip: device.ip,
                name: info['board-name'] || 'Unknown',
                cpuLoad: info['cpu-load'],
                uptime: info['uptime'],
              });
              conn.end();
            })
            .on('data', (chunk) => {
              data += chunk.toString();
            })
            .stderr.on('data', (chunk) => {
              console.error(`STDERR from ${device.ip}:`, chunk.toString());
            });
        });
      })
      .on('error', (err) => {
        reject(`Connection error to ${device.ip}: ${err}`);
      })
      .connect({
        host: device.ip,
        port: device.port,
        username: device.username,
        password: device.password,
      });
  });

router.get('/info', async (req, res) => {
  try {
    const results = await Promise.all(MIKROTIK_DEVICES.map(fetchMikroTikInfo));
    res.json(results);
  } catch (err) {
    console.error('Error fetching MikroTik info:', err);
    res.status(500).send('Error fetching MikroTik info');
  }
});

module.exports = router;
