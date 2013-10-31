#!/usr/bin/env node 

var usage = hereDoc(function() {/*!
This program tests a freshly installed Lantern to make sure that it can be set
up and proxy traffic to blocked websites.

Usage: $0 username password*/});

var _ = require('lodash')
  , fs = require('fs')
  , optimist = require('optimist')
                .usage(usage)
                .options({
                  'username': {
                    demand: true,
                    describe: 'The Lantern username'
                  },
                  'password': {
                    demand: true,
                    describe: 'The Lantern password'
                  }
                })
                .wrap(80)
  , argv = optimist.argv                
  , webdriver = require('selenium-webdriver')
  , promise = webdriver.promise;

var apiLocationFile = getUserHome() + '/.lantern/api_location.txt';
var apiLocation = fs.readFileSync(apiLocationFile).toString();

console.log("Testing against", apiLocation, apiLocationFile);

var driver = buildDriver();

driver.get(apiLocation);

enterGetMode();
googleSignIn();
continueFromFriends();
continueFromProxiedSites();
finishSetup();

function enterGetMode() {
  screenshot('enterGetMode.0');
  click('.enter-get-mode');
}

function googleSignIn() {
  screenshot('googleSignIn.0');
  click('.sign-in');
  screenshot('googleSignIn.1');
  type('#Email', argv.username);
  type('#Passwd', argv.password);
  click('#signIn');
  screenshot('googleSignIn.2');
  click('#submit_approve_access:enabled');
}

function continueFromFriends() {
  screenshot('continueFromFriends.0');
  waitFor('#lanternFriends');
  screenshot('continueFromFriends.1');
  click('#continueFromFriends');
}

function continueFromProxiedSites() {
  screenshot('continueFromProxiedSites.0');
  waitFor('#proxiedSites');
  screenshot('continueFromProxiedSites.1');
  click('#continueFromProxiedSites');
}

function finishSetup() {
  screenshot('finishSetup.0');
  waitFor('#finished');
  screenshot('finishSetup.1');
  click('#finishSetup');
}

//exit(0);

/**
 * Returns a promise for the first visible element (once it's present).
 * 
 * @param selector
 */
function find(selector) {
  if (typeof(selector) === 'string') {
    selector = webdriver.By.css(selector);
  }
  
  var flow = webdriver.promise.controlFlow()
    , result = new promise.defer();
  
  waitFor(selector);
  
  driver.findElements(selector).then(function(elements) {
    elements.forEach(function(element) {
      flow.execute(function() {
        element.isDisplayed().then(function(isDisplayed) {
          if (result.isPending() && isDisplayed) {
            result.fulfill(element);
          }
        });
      });
    });
    flow.execute(function() {
      if (result.isPending()) {
        result.reject("Element not found");
      }
    });
  });
  return result.promise;
}

function click(selector) {
  find(selector).then(function(element) { element.click(); });
}

function type(selector, keys) {
  find(selector).then(function(element) { element.sendKeys(keys); });
}

function exit(status) {
  webdriver.promise.controlFlow().execute(function() {
    driver.quit();
    process.exit(status);
  });
}

function waitFor(selector, time) {
  if (typeof(selector) === 'string') {
    selector = webdriver.By.css(selector);
  }
  
  if (!time) {
    time = 30000;
  }
  
  driver.wait(function() {
    return driver.isElementPresent(selector);
  }, time);
}

function screenshot(name) {
  try {
    fs.mkdirSync('screenshots');
  } catch (err) {
    // ignore
  }
  
  driver.takeScreenshot().then(function(imageAsBase64String) {
    fs.writeFileSync('screenshots/' + name + '.png', new Buffer(imageAsBase64String, 'base64'));
  });
}

function buildDriver() {
  var driver = new webdriver.Builder().withCapabilities(
      webdriver.Capabilities.chrome()).build();

  process.on('uncaughtException', function(err) {
    console.error(err);
    screenshot('error');
    try {
      driver.quit();
    } catch (error) {
      // ignore
    }
  });

  process.on('exit', function() {
    try {
      driver.quit();
    } catch (error) {
      // ignore
    }
  });
  
  return driver;
}

/**
 * Get the home directory of the user
 * 
 * @returns
 */
function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

/**
 * Courtesy of http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript/6072388#6072388.
 * 
 * @param f
 * @returns
 */
function hereDoc(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}