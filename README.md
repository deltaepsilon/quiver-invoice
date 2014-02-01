quiver-invoice
==============

## Installation
1. You'd best go get [Node/NPM](https://github.com/joyent/node) and (Bower)[http://bower.io/] if you haven't already.
2. Run ```npm install``` and ```bower install``` to download all dependencies.
3. Create a [firebase](http://www.firebase.com).
4. Log into your firebase and enable Simple Login with Email & Password.
5. Save new security rules like so.

```
{
    "rules": {
        "users": {
          "$user": {
            ".read": "$user == auth.id",
            ".write": "$user == auth.id"
          }
        }
    }
}
```

6. Copy /app/env.js.dist to /app/env.js and modify values appropriately.
7. If you're going to deploy to Amazon, get an S3 account and add something like the following to your environment, usually by appending to ~/.bash_profile

```
export AMAZON_ACCESS_KEY_ID="YOURAMAZONACCESSKEYID"
export AMAZON_SECRET_ACCESS_KEY="YOURAMAZONSECRETACCESSKEY"

export QUIVER_INVOICE_FIREBASE="https://yourfirebase.firebaseIO.com"

```

8. Run ```grunt server``` to launch a development instance of the application. Otherwise, run ```grunt build``` to build or ```grunt deploy``` to build and deploy to Amazon S3.

