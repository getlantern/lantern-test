# lantern-test

## Quick Start

lantern-test works on OS X and Windows. 

Requires [nodejs](http://nodejs.org/)

```
git clone https://github.com/getlantern/lantern-test.git
cd lantern-test
npm install
./lantern-test.js <username> <password>
```

## Usage

```
This program tests a freshly installed Lantern to make sure that it can be set
up and proxy traffic to blocked websites.

Usage: node ./lantern-test.js username password

Options:
  --username  The Lantern username                                    [required]
  --password  The Lantern password                                    [required]

Missing required arguments: username, password
```