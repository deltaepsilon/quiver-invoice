quiver-invoice
==============

## Installation
- You'd best go get [Node/NPM](https://github.com/joyent/node) and (Bower)[http://bower.io/] if you haven't already.
- Run ```npm install``` and ```bower install``` to download all dependencies.
- Create a [firebase](http://www.firebase.com).
- Log into your firebase and enable Simple Login with Email & Password.
- Save new security rules like so.

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

- Copy /app/env.js.dist to /app/env.js and modify values appropriately.
- If you're going to deploy to Amazon, get an S3 account and add something like the following to your environment, usually by appending to ~/.bash_profile

```
export AMAZON_ACCESS_KEY_ID="YOURAMAZONACCESSKEYID"
export AMAZON_SECRET_ACCESS_KEY="YOURAMAZONSECRETACCESSKEY"
```

- Express needs a few more environment variables to be happy, so fill in the following. In my case, I have an SSH config file at ~/.ssh/config with the a specification for ```quiver```. See [this tutorial](http://nerderati.com/2011/03/simplify-your-life-with-an-ssh-config-file/) to set one up.

```
# QUIVER_INVOICE_TARGET is an scp target for all uploads.
export QUIVER_INVOICE_TARGET="quiver:/var/www/invoice.quiver.is/distributions/new"
export QUIVER_INVOICE_FIREBASE="https://dev-quiver.firebaseIO.com"
export QUIVER_INVOICE_FIREBASE_SECRET="xkFhM4yhArtba31g5P74BxybeDQOn2BS9GgG34Zm"
export QUIVER_INVOICE_APP="http://127.0.0.1:9000"
export QUIVER_INVOICE_STRIPE_PK="pk_test_yKJ7iI8CjZqH0I7HzkiEPpET"
export QUIVER_INVOICE_STRIPE_SK="sk_test_yg4S10KOQz4fTs3wenXKrxuD"
export MANDRILL_API_KEY="R0MU6eaPxOdobC1W_kFNhw"
```


- Run ```grunt server``` to launch a development instance of the application. Otherwise, run ```grunt build``` to build, ```grunt s3deploy``` to build and deploy to Amazon S3, or ```grunt deploy``` to run tar the necessary files and scp them up via your scp target.
- ```grunt deploy``` runs a hand-rolled bash deploy script. It relies on a server directory structure similar to the following:

```
# /var/www/invoice.quiver.is
distributions/
distributions/old
distributions/new
```

- Once ```grunt deploy``` is finished loading the files to the server, I run the following bash script from my server's root directory to load the files and start the server.

```
#!/bin/sh

# /var/www/invoice.quiver.is/deploy.sh
tar -zxvf distributions/new/new.dist.tar.gz
tar -zcvf distributions/old/old.dist.tar.gz dist
cp distributions/new/new.dist dist

tar -zxvf distributions/new/new.middleware.tar.gz
tar -zcvf distributions/old/old.middleware.tar.gz middleware
cp distributions/new/new.middleware middleware

tar -zxvf distributions/new/new.views.tar.gz
tar -zcvf distributions/old/old.views.tar.gz views
cp distributions/new/new.views views

mv package.json distributions/old/old.package.json
cp distributions/new/new.package.json package.json

mv invoice-server.js distributions/old/old.invoice-server.js
cp distributions/new/new.invoice-server.js invoice-server.js

npm install

sudo -E forever stop invoice-server.js
sudo -E forever start invoice-server.js

```

- I also have a copy of env.js in my application's root on the server. I re-route all requests for ```/scripts/env.js``` to ```/var/www/invoice.quiver.is/env.js``` with an nginx directive. Here's my entire nginx server file.

```
server {
	listen 	80;
	server_name  invoice.quiver.is *.invoice.quiver.is;
	return 301   https://invoice.quiver.is$request_uri;
}

server {
  listen       443 ssl;
  server_name  invoice.quiver.is;

  keepalive_timeout   70;

  ssl_certificate      /etc/ssl/certs/quiver_is.crt;
  ssl_certificate_key  /etc/ssl/quiver_is.key;
  ssl_protocols  SSLv2 SSLv3 TLSv1;
  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers   on;
  ssl_session_cache   shared:SSL:10m;
  ssl_session_timeout 10m;

  location /env.js {
    alias /var/www/invoice.quiver.is/env.js;
  }

  location / {
    root /var/www/invoice.quiver.is/dist;
  }
}

server {
	listen	443 ssl;
	server_name api-invoice.quiver.is;

	keepalive_timeout   70;

  ssl_certificate      /etc/ssl/certs/quiver_is.crt;
  ssl_certificate_key  /etc/ssl/quiver_is.key;
  ssl_protocols  SSLv2 SSLv3 TLSv1;
  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers   on;
  ssl_session_cache   shared:SSL:10m;
  ssl_session_timeout 10m;

  location ~ {
          proxy_set_header X-Real-IP  $remote_addr;
          proxy_set_header X-Forwarded-For $remote_addr;
          proxy_set_header Host $host;
          proxy_pass http://127.0.0.1:9600;
  }

}

```