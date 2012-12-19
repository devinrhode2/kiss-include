/* kiss-include.js - this transparently patchs the KissMetrics javascript api to work perfectly everywhere in chrome extensions. 
 * YOU NEED TO INCLUDE IT EVERYWHERE*
 * 
 * See the docs online or in the repo for extra details on usage.
 * 
 * It detects and acts accordingly when it's included in a background page, with content scripts, or even with executeScript.
 * 
 * Send questions/problems/critiques on code to: DevinRhode2@gmail.com (put "kiss-include.js" in the title)
 *
 *
 * (The MIT License)
 *
 * Copyright © 2012 Devin Rhode <DevinRhode2@Gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {
  'use strict';

  /* Global Configuration: */

  var KissIncludePortName = 'kissInclude'; // presumably you aren't using this port name. You can just change this if you are though, things won't break.
  var KissIncludeEventHelper = 'event'; // if your app already has a window.event method, feel free to change this.

  /* Dynamically Publicized API */

  // kissInclude is public API only from background.js
  var kissInclude = function kissInclude(_kmk, opts) {

    opts = opts || {};

    if (window.KM_SKIP_VISITED_SITE === undefined) {
      if (opts.skip_visited_site !== false) {
        window.KM_SKIP_VISITED_SITE = true;
      }
    }

    if (typeof _kmk === 'undefined') {
      fail('Please pass in a kiss metrics _kmk id.'+
           'You can find this at http://kissmetrics.com/settings just below the fold! \n\n'+
           'Do this like: kissInclude(\'asdeiorfhaksjnaoiewhoasdhjf\');');
    } else {
      window._kmk = _kmk;//make sure it's global.
    }
    if (typeof KM_COOKIE_DOMAIN === 'undefined') {
      console.warn('KM_COOKIE_DOMAIN is not defined. You probably want to define this'+
                   ' like so: window.KM_COOKIE_DOMAIN = \'extension.domain.com\';');
    }


    window._kms = function _kms(u, onload) {
      setTimeout(function slightTimout() {
        var d = document, f = d.head,
        s = d.createElement('script');
        s.type = 'text/javascript'; s.async = true; s.src = u;
        if (typeof onload == 'function') {
          s.onload = onload;
        }
        f.parentNode.insertBefore(s, f);
      }, 1);
    };
    _kms('https://i.kissmetrics.com/i.js');
    _kms('https://doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js', (opts.ssl === false) ? null : forceSsl);

    chrome.extension.onConnect.addListener(function KissIncludeOnConnect(port) {
      if (port.name === KissIncludePortName) {
        port.onMessage.addListener(function portOnmessage(msg) {
          if (msg.bufferedPush) {
            _kmq.push(msg.bufferedPush);
          } else {
            fail('unhandled message to kiss-include.js background receiver: ', msg);
          }
        });
      }
    });
  };

  // A nicer wrapper, instead of _kmq.push(['asdf', 'adf']) it's just event('asdf', 'adf')
  var event = function event() {
    if (typeof _kmq === 'undefined') {
      window._kmq = [];
    }
    var argsArray = [].slice.call(arguments);
    if (argsArray.length === 1) {
      _kmq.push(['record', argsArray[0]]);
    } else {
      _kmq.push(argsArray);
    }
  };

  /* Private API */

  /**
   * fail
   * alerts and throws message, may also output additonal parameters, like objects.
   */
  var fail = function fail(message, optionalObjects) {

    optionalObjects = [].slice.call(arguments);

    // First arg should be a string, which shouldn't belong in optionalObjects
    if (typeof message === 'string') {

      optionalObjects.shift();

    } else {
      message = 'First arg to fail should be a string message, even if its an empty string';
    }

    if (optionalObjects && optionalObjects.length > 0) {

      // For alert
      (function newScope(){ //So I can re-use the message variable non-destructively
        var message = message + '\n';
        optionalObjects.forEach(function forEachObject(item){
          message += '\n' + typeof item + ': ' + JSON.stringify(item);
        });
        alert(message);
      }());

      // prefix objects with message
      optionalObjects.unshift(message);

      // Do apply instead of optionalObjects so we get a clean message prefix output
      console.error.apply(console, optionalObjects);
    } else {
      alert(message);
    }
    throw new Error(message);
  };

  // Because background's location.protocol is 'chrome-extension:', masquerade as an https URL to force KM to send events via SSL
  var forceSsl = function forceSsl() {
    KM.u = function() {
      return 'https://' + location.host + location.pathname + location.search + location.hash;
    };
  };


  /* Library Initialization */

  var initKissInclude = function initKissInclude() {
    if (!chrome.extension) {
      fail("kissInclude only works inside chrome extensions!");
    }

    if (typeof _kmq === 'undefined') {
      window._kmq = []; //Note on global declarations: shit hit the fan without _km<vars> being global.
    }

    // Publicize `event` helper method
    // silently skip overwriting an existing method of the same name to avoid conflicts.
    if (!window[KissIncludeEventHelper]) {
      window[KissIncludeEventHelper] = event;
    }

    if (chrome.browserAction && window === chrome.extension.getBackgroundPage()) {
      // background page acts as a server
      initServer();
    } else {
      // content scripts and popups act as clients
      initClient();
    }
  };

  var initServer = function initServer() {
    // export kissInclude to public API
    window.kissInclude = kissInclude;

    // support async style initialization
    if (typeof _kmk !== 'undefined') {
      kissInclude(_kmk, window._kmOpts);
    }
  };

  var initClient = function initClient() {

    //content script or popup, setup api buffer
    var KissIncludePort = chrome.extension.connect({name: KissIncludePortName});
    window._kmq.push = function _kmqPush(pushedArray) {
      if (arguments.length !== 1) {
        fail('too many arguments, only one is expected. arguments:' + JSON.stringify(arguments));
      }
      if (typeof pushedArray === 'function') {
        fail(
          '_kmq.push doesnt accept a function in content scripts. This eliminates unnecessary complexity.'
          , pushedArray
        );
      } else if (typeof pushedArray !== 'object') {
        fail('_kmq.push only accepts an object/array argument');
      }
      KissIncludePort.postMessage({bufferedPush: pushedArray});
    };

    //re-push events
    _kmq.forEach(function kmqForEach(event) {
      _kmq.push(event);
    });
  };

  initKissInclude();
})();
