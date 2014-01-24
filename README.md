quiver-invoice
==============

## Installation
1. You'd best go get [Node/NPM](https://github.com/joyent/node) and (Bower)[http://bower.io/] if you haven't already.
2. Run ```npm install``` and ```bower install``` to download all dependencies.
3. Copy /app/env.json.dist to /app/env.json and modify values appropriately.
4. If you're going to deploy to Amazon, get an S3 account and add something like the following to your environment, usually be appending to ~/.bash_profile

```
export AMAZON_ACCESS_KEY_ID="YOURAMAZONACCESSKEYID"
export AMAZON_SECRET_ACCESS_KEY="YOURAMAZONSECRETACCESSKEY"

export QUIVER_INVOICE_FIREBASE="https://quiver.firebaseIO.com"

```

5. Run ```grunt server``` to launch a development instance of the application, otherwise, run ```grunt build``` to build or ```grunt deploy``` to build and deploy to Amazon S3.

