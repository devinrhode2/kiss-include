<h1>KissMetrics in Chrome Extensions w/kiss-include.js</h1>

<p>To use KissMetrics in Chrome Extensions, we made a script that magically patches the JavaScript api for use everywhere within Chrome Extensions. You simply include it in your background page and content scripts, and call <code>_kmq.push</code> like normal.</p>

Download the patch script right from this repository, or do <code>npm install devinrhode2/kiss-include</code>

<h3>Important points</h3>
<ul>
  <li>
    To use in <strong>content scripts</strong>, you will also 
    need to include it in the background page.
  </li>
</ul>

<h3>Initialize</h3>
<ul>
  <li>
    <h4>Asynchronously (recommended)</h4>
    <p>
      Setup this code, and being 
      <code>push</code>'ing to <code>_kmq:</code>
    </p><pre><code>if (typeof _kmq === 'undefined') {
  window._kmq = [];
}
window._kmk = 'c168ad9f6287ggbcfe92a883fc3c8c0f904e7972';</code></pre>
    <p>
      At some later point, be sure to include kiss-include.js.
      It will detect your _kmk id, and set itself up.
    </p>
  </li>
  <li>
    <h4>Directly</h4>
    <p>Include kiss-include.js before this code in your extension, and then call <code>kissInclude</code> with your <code>_kmk</code> account id:</p>
    <pre><code>kissInclude('ioheiorfhaksjnaoiewhoasdhjf');</code></pre>
  </li>
  <li>
    <h4>Setting a domain</h4>
    <p>
      As an extension, you might want to manually
      specify a domain like so:
    </p>
    <pre><code>window.KM_COOKIE_DOMAIN = 'www.mydomain.com';</code></pre>
    <p>This code needs to be placed before the library is initialized.</p>  
  </li>
</ul>    

<br>
<br>
<strong>Extra details on the script</strong>
<p>Wherever you include the script, it detects it's environment and responds accordingly. This script alleviates the headache associated with chrome's isolated world's - you just use the JS API as defined in the docs.</p>
<strong>Including in content scripts</strong>
<p>To work in content scripts, you need to make sure it's also included in the background page</p>
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


<strong>Including in background page:</strong>
```html
//in your background.html:
<script src="kiss-include.js"></script>
```

<p>If you include kiss-include.js after your code, you need to use asynchronous initialization. If you include it before your code, you'll need to use direct initialization.</p>

<p>This also includes a convenience <code>event</code> method on <code>_kmq.push</code>. Instead of <code>_kmq.push(['record', 'something']);</code> use: <code>event('record', 'something');</code>, but if you want to just record something, one argument defaults to 'record' so you can go: <code>event('something');</code> </p>

### Add as npm dependency

Plain `npm install` and `npm update` won't work with kiss-include unless you add `"kiss-include": "git://github.com/devinrhode2/kiss-include.git" to "dependencies"` in your package.json.
You can always directly do `npm install devinrhode2/kiss-include` and `npm update devinrhode2/kiss-include`

## License

(The MIT License)

Copyright &copy; 2012 [Devin Rhode](http://twitter.com/DevinRhode2) &lt;DevinRhode2@Gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
