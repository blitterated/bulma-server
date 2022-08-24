I was playing around with different bundlers in Docker trying to find a quick way to test Bulma customizations. Most bundlers (except Vite) are too slow. A few are on their way out, and one is simply abandoned (snowpack). Eventually, I became curious about how live/hot reloading works, and I wanted to try rolling my own. Turns out it's pretty easy with a little javascript glue.

## Usage

### Build the Docker image

```sh
./bs build
```

### Run a container

```sh
./bs run
```

This will do two things:
1. Serve a basic `index.html` with bulma examples at [http://localhost:8080](http://localhost:8080).
2. Map a bind mount to the `/src` directory on the host.

### Edit the Sass file

Open `src/sass/mystyles.scss` in an editor on the host, make some edits, and save. Changes in the browser should appear almost immediately.

## Implementation Details

Look in [sassinate.js](sassinate.js) if you want to sniff the glue.

It uses the following packages:

* [`sass-embedded`](https://github.com/sass/embedded-host-node): Instead of the slow javascript implementation, this wraps the fast Dart implementation.
* [`chokidar`](https://www.npmjs.com/package/chokidar): Used to watch for changes to the Sass file, and trigger compilation to CSS.
* [`alive-server`](https://www.npmjs.com/package/alive-server): A fork of [`live-server`](https://github.com/tapio/live-server) that has been updated, along with its dependencies. Both [`live-server`](https://github.com/tapio/live-server) and [`browser-sync`](https://github.com/BrowserSync/browser-sync) are pretty stale, as are their dependencies.

I opted to only use syncronous methods for the sake of speed. It's [`recommended by sass-embedded`](https://sass-lang.com/documentation/js-api/modules#compileAsync).

> ⚠️ Heads up!
> When using Dart Sass, __compile is almost twice as fast as compileAsync__, due to the overhead of making the entire evaluation process asynchronous.

The `index.html` source code comes from the[Bulma CSS Framework Crash Course](https://www.youtube.com/watch?v=IiPQYQT2-wg) on YouTube.

## References

* live-server
  * [npm: live-server](https://www.npmjs.com/package/live-server)
* alive-server
  * [npm: alive-server](https://www.npmjs.com/package/alive-server)
  * [announce on live-server github](https://github.com/tapio/live-server/issues/398)
* chokidar
  * [npm: chokidar](https://www.npmjs.com/package/chokidar)
  * [Run package.json scripts upon any file changes in a folder](https://flaviocopes.com/package-json-watch/)
* sass-embedded
  * [npm: concurrently](https://www.npmjs.com/package/concurrently)
* [Use the Dart Sass JavaScript Implementation to Compile SASS with Node.js](https://www.devextent.com/dart-sass-javascript-implementation-npm-compile-sass/)
* [CommonJS vs. ES modules in Node.js](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)
* [Bulma CSS Framework Crash Course](https://www.youtube.com/watch?v=IiPQYQT2-wg)
