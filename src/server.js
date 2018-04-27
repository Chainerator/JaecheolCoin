const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Blockchain = require('./blockchain');
const P2P = require('./p2p');
const Wallet = require('./wallet');

const {
  getBlockchain,
  createNewBlock,
  getAccountBalance,
  sendTx,
} = Blockchain;
const {
  startP2PServer,
  connectToPeers,
} = P2P;
const {
  initWallet,
} = Wallet;

// Psssst. Don't forget about typing 'export HTTP_PORT=4000' in your console
const PORT = process.env.HTTP_PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));

app
  .route('/blocks')
  .get((req, res) => {
    res.send(getBlockchain());
  })
  .post((req, res) => {
    const newBlock = createNewBlock();
    res.send(newBlock);
  });

app.post('/peers', (req, res) => {
  const {
    body: {
      peer,
    },
  } = req;
  connectToPeers(peer);
  res.send();
});

app.get('/me/balance', (req, res) => {
  const balance = getAccountBalance();
  res.send({
    balance,
  });
});

app
  .route('/transactions')
  .get((req, res) => {})
  .post((req, res) => {
    try {
      const {
        body: {
          address,
          amount,
        },
      } = req;
      if (address === undefined || amount === undefined) {
        throw Error('Please specify and address and an amount');
      } else {
        const result = sendTx(address, amount);
        res.send(result);
      }
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

const server = app.listen(PORT, () =>
  console.log(`Jaecheol HTTP Server running on port ${PORT} ✅`),
);

initWallet();
startP2PServer(server);
