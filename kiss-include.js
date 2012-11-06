/* kiss-include.js - this transparently patchs the KissMetrics javascript api to work perfectly everywhere in chrome extensions. 
 * YOU NEED TO INCLUDE IT EVERYWHERE*
 * 
 * See the docs online or in the repo for extra details on usage.
 * 
 * It detects and acts accordingly when it's included in a background page, with content scripts, or even with executeScript.
 * 
 * Send questions/problems/critiques on code to: DevinRhode2@gmail.com (put "kiss-include.js" in the title)
 */

window.kissInclude = function kissInclude(_kmk) {
  'use strict';//steppin it up!
  //a nicer wrapper, instead of _kmq.push(['asdf', 'adf']) it's just kiss('asdf', 'adf')
  window.event = function event() {
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
  
  var message = '';
  
  if (typeof _kmq === 'undefined') {
    window._kmq = []; //Note on global declarations: shit hit the fan without _km<vars> being global.
  }
  
  var KissIncludePortName = 'kissInclude';//presumably you aren't using this port name. You can just change this if you are though, things won't break.
  if (chrome.browserAction) {
    
    //background page or popup, inject the scripts normally!
    window._kms = function _kms(u) {
      setTimeout(function() {
        var d = document, f = d.head,
        s = d.createElement('script');
        s.type = 'text/javascript'; s.async = true; s.src = u;
        f.parentNode.insertBefore(s, f);
      }, 1);
    };
    _kms('https://i.kissmetrics.com/i.js');
    _kms('https://doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');
    
    chrome.extension.onConnect.addListener(function KissIncludeOnConnect(port) {
      if (port.name === KissIncludePortName) {
        port.onMessage.addListener(function(msg) {
          if (msg.bufferedPush) {
            _kmq.push(msg.bufferedPush);
          } else {
            message = 'unhandled message to kiss-include.js background receiver: ';
            alert(message + JSON.stringify(msg));
            console.error(message, msg);
          }
        });
      }
    });
  } else {
    
    //content script, setup api buffer
    var KissIncludePort = chrome.extension.connect({name: KissIncludePortName});
    window._kmq.push = function _kmqPush(pushedArray) {
      if (arguments.length !== 1) {
        var message = 'too many arguments, only one is expected.';
        console.error(message + 'arguments:\n', arguments);
        alert(message);
        throw 'exited on: ' + message;
      }			
      if (typeof pushedArray === 'function') {
        message = '_kmq.push doesnt accept a function in content scripts. This eliminates unnecessary complexity.';
        console.error(message, pushedArray);
        return message;
      } else if (typeof pushedArray !== 'object') {
        fail('_kmq.push only accepts an object/array argument');
      }
      KissIncludePort.postMessage({bufferedPush: pushedArray});
    };
    					
    //re-push events
    _kmq.forEach(function kmqForEach(event) {
      _kmq.push(event);
    });
  }
  					
}; // End window.kissInclude

if (typeof _kmk !== 'undefined') {
  kissInclude(_kmk);
} else {
  console.log('Please define _kmk in the scope of kiss-include.js');
}