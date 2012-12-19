# KISSmetrics in Chrome Extensions w/kiss-include.js

To use KissMetrics in Chrome Extensions, we made a script that magically patches the JavaScript api for use everywhere within Chrome Extensions. You simply include it in your background page and content scripts, and call `_kmq.push` like normal.

Download the patch script right from this repository, or do `npm install devinrhode2/kiss-include`

### Setting up kiss-include

For `kiss-include` to function, you must at least configure it in your background page.

#### In your background page:

Include `kiss-include.js` before your app initialization code, and then call `kissInclude` with your `_kmk` account id before you start pushing events to `_kmq`:

```javascript
kissInclude('ioheiorfhaksjnaoiewhoasdhjf');
```

#### In your content scripts and popups

Simply include `kiss-include.js` in your manifest.json

```javascript
//in you manifest.json:
"content_scripts": [
   {
      "js": [ "YourScripts.js", "kiss-include.js" ],
      "matches": [ "&lt;all_urls&gt;" ],
      "run_at": "document_start"
   },
],
```

#### Optional: Setting a cookie domain

As an extension, you might want to manually
specify a domain like so:

```javascript
window.KM_COOKIE_DOMAIN = 'www.mydomain.com';
```

This code needs to be placed before the library is initialized.


### Additional features

This also includes a convenience `event` method. Instead of `_kmq.push(['record', 'something']);`, you can use: `event('record', 'something');`, but if you want to just record something, one argument defaults to 'record' so you can go: `event('something');`

### Add as npm dependency

Plain `npm install` and `npm update` won't work with kiss-include unless you add `"kiss-include": "git://github.com/devinrhode2/kiss-include.git" to "dependencies"` in your package.json.
You can always directly do `npm install devinrhode2/kiss-include` and `npm update devinrhode2/kiss-include`

## License

(The MIT License)

Copyright &copy; 2012 [Devin Rhode](http://twitter.com/DevinRhode2) &lt;DevinRhode2@Gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
