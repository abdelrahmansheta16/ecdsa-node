const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "acdf916870e339d5b897": 100, //private key: a91529e46756bb5b97d1d72458d5a0229f01d320fab369280329892b4c3d7543
  "5dbbcbcb1a7e6c774fef": 50, //private key: 8513dd23a523ca3029710143e8ef1ab76ceb850658d3d6dbe2c34149d7990c29
  "88426238d92374d4d665": 75, //private key: 59b5068b5fa4b53c783e7d9592b8017b63334fc7940adaffe376ecc90fe370c1
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recipient, amount, recoveryBit } = req.body;
  console.log("sign: ", signature)
  const signatureBuffer = Buffer.from(Object.values(signature));
  const publicKey = secp.recoverPublicKey(amount.toString(), signatureBuffer, recoveryBit)
  console.log(toHex(publicKey))
  const senderHex = toHex(publicKey);
  const sender = senderHex.substring(senderHex.length - 20);
  console.log(sender)
  console.log(recipient)
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
