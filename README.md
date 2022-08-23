I was researching and playing around with different bundlers in Docker trying to find a quick way to test Bulma customizations. Most of the bundlers (except Vite) are way too slow. A few are on their way out, and one is simply abandoned (snowpack). Eventually I became curious about how live/hot reloading works, and I wanted to try rolling my own. Turns out it's pretty easy with just a little javascript for glue.

## Usage

### Build the Docker image

```sh
./bs build
```

### Run a container

This will do two things:
1. Serve a basic `index.html` with bulma examples at [http://localhost:8080](http://localhost:8080).
2. Map a bind mount to the `/src` directory on the host.

```sh
./bs run
```
### Edit the Sass file

Open `src/sass/mystyles.scss` in an editor and make some edits. Changes in the browser should appear nearly immediately.

## Implementation Details

It uses the following packages:

* [`sass-embedded`](https://github.com/sass/embedded-host-node): Instead of the slow javascript implementation, this wraps the fast Dart implementation.
* [`chokidar`](https://www.npmjs.com/package/chokidar): Used to watch for changes to the Sass file and trigger compilation to CSS.
* [`alive-server`](https://www.npmjs.com/package/alive-server): A fork of [`live-server`](https://github.com/tapio/live-server) that has been updated along with its dependencies. Both [`live-server`](https://github.com/tapio/live-server) and [`browser-sync`](https://github.com/BrowserSync/browser-sync) are pretty stale, as are their dependencies.

Look in [sassinate.js](sassinate.js) if you want to sniff the glue.

I opted to only use syncronous methods for the sake of speed. It's [`recommended by sass-embedded`](https://sass-lang.com/documentation/js-api/modules#compileAsync).

> ⚠️ Heads up!
> When using Dart Sass, __compile is almost twice as fast as compileAsync__, due to the overhead of making the entire evaluation process asynchronous.

## References

* live-server
  * [npm](https://www.npmjs.com/package/live-server)
  * [github](https://github.com/tapio/live-server)
  * [home](http://tapiov.net/live-server/()
* alive-server
  * [npm](https://www.npmjs.com/package/alive-server)
  * [github](https://github.com/ljcp/alive-server)
  * [announce on live-server github](https://github.com/tapio/live-server/issues/398)
  * poorly documented `root` option for changing root folder being served.
    * [Option doc string in API](https://github.com/ljcp/alive-server/blob/master/index.js#L120)
    * [Option assignment in `start()` method](https://github.com/ljcp/alive-server/blob/master/index.js#L139)
    * [Setting of option in CLI executable](https://github.com/ljcp/alive-server/blob/master/live-server.js#L173)
* chokidar
  * [npm](https://www.npmjs.com/package/chokidar)
  * [github](https://github.com/paulmillr/chokidar)
* sass-embedded
  * [npm](https://www.npmjs.com/package/concurrently)
  * [docs: compile](https://sass-lang.com/documentation/js-api/modules#compile)
  * [docs: compile options](https://sass-lang.com/documentation/js-api/interfaces/Options)
* [Use the Dart Sass JavaScript Implementation to Compile SASS with Node.js](https://www.devextent.com/dart-sass-javascript-implementation-npm-compile-sass/)
* [CommonJS vs. ES modules in Node.js](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)
* [npm: don't commit package-lock.json](https://github.com/npm/npm/issues/20603)
