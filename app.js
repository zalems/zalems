const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const equiposRouter = require('./routes/equipos');
const pingRouter = require('./routes/ping');
const mikrotikRouter = require('./routes/mikrotik');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/equipos', equiposRouter);
app.use('/api/ping', pingRouter);
app.use('/api/mikrotik', mikrotikRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
