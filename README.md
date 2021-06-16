# IRON Finance compounder

A iron finance vault compounder which implemented on NodeJs.

## Installation

```bash
npm install
```

#### Usage

First, You need to create `.env` file that contains your private key.

Example of .env

```bash
MOMOPARADISE={privatekey}
```

Second, fill the `myVaultContract` with your vault contract address on server.js#7

```bash
var myVaultContract = "";
```

Finally, run the compounder

```bash
node server.js
```
