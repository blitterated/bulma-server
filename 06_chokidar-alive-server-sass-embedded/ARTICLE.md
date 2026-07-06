Lightly based on the [Bulma with Webpack tutorial](https://bulma.io/documentation/customize/with-webpack/).

## Create a work directory on the host.

```sh
mkdir live-server-npm-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-live-server-npm-docker` in the container as well as publishing port 1234 to the host.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-live-server-npm-docker \
           -w /bulma-live-server-npm-docker \
           -p 8080:8080 \
           archlinux:latest /bin/sh
```

Update the packages in the container and install some stuff.

```sh
pacman --noconfirm -Syu npm tree neovim
```

If you get the following error, delete your archlinux image and pull it down again.

```text
error: libcap: signature from "David Runge <dvzrv@archlinux.org>" is marginal trust
```

Initialize a new `package.json`.

```sh
npm init -y
npm pkg set name=bulma-live-server-js
npm pkg set type=module
npm pkg set version=0.0.1
npm pkg set main=index.html
npm pkg set description="bulma live reload playground in docker with live-server, chokidar, and sass-embedded"
npm pkg set author=blitterated
npm pkg set license=0BSD
cat package.json
```

## Install project dependencies

`live-server` looks like it's been dead for years, and dependencies are mostly deprecated. `alive-server` is a currently maintained fork.
We use `chokidar` explicitly, so it's specified below.

```sh
npm install --save-dev bulma chokidar alive-server sass-embedded
```

## Add a javascript script to compile, watch, and live reload css (`sassinate.js`)

```sh
cat << 'EOF' > sassinate.js
import { promisify } from "util";
import { writeFile } from "fs";

import sass from "sass-embedded";
import chokidar from "chokidar";
import aliveServer from "alive-server";

const sassRenderPromise = promisify(sass.render);
const writeFilePromise = promisify(writeFile);

const sassFile = `${process.cwd()}/${process.argv[2]}`;
const cssFile  = `${process.cwd()}/${process.argv[3]}`;

async function buildSass() {
  const styleResult = await sassRenderPromise({
    file: sassFile,
    outFile: cssFile,
    sourceMap: false,
    sourceMapContents: false,
  });

  await writeFilePromise(cssFile, styleResult.css, "utf8");
}

const watcher = chokidar.watch(sassFile, { persistent: true });
watcher
  .on('add', () => buildSass())
  .on('change', () => buildSass());

aliveServer.start({ watch: cssFile });
EOF
```

## Add npm script to run `sassinate.js` in `package.json`

Update the `"scripts"` section in `package.json` to the following:

```javascript
  "scripts": {
    "dev": "node sassinate.js sass/mystyles.scss css/mystyles.css",
  },
```

## Create directories

```sh
mkdir sass
mkdir css
```

## Add project files

Create the Sass file that imports Bulma.

```sh
cat <<EOF > sass/mystyles.scss
@charset "utf-8";
@import "../node_modules/bulma/bulma.sass";
EOF
```

Create an HTML page that is styled with Bulma.

```sh
cat <<EOF > index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My custom Bulma website</title>
    <link rel="stylesheet" href="mystyles.css">
  </head>
  <body>
     <h1 class="title">
        Bulma
      </h1>

      <p class="subtitle">
        Modern CSS framework based on <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox">Flexbox</a>
      </p>

      <div class="field">
        <div class="control">
          <input class="input" type="text" placeholder="Input">
        </div>
      </div>

      <div class="field">
        <p class="control">
          <span class="select">
            <select>
              <option>Select dropdown</option>
            </select>
          </span>
        </p>
      </div>

      <div class="buttons">
        <a class="button is-primary">Primary</a>
        <a class="button is-link">Link</a>
      </div>
  </body>
</html>
EOF
```

## Take a look at the current directory and files, but ignore `node_modules`.

```sh
tree -I node_modules
```

It should look like this.

```text
.
├── css
├── index.html
├── package-lock.json
├── package.json
├── sass
│   └── mystyles.scss
└── sassinate.js
```

## Serve the site and live reload style changes

```sh
npm run dev
```

## Try changing the `$primary` color in Bulma from turquoise to orange.

Edit the `mystyles.scss` file and add the line changing colors between the existing two. It should look like this:

```sass
@charset "utf-8";
$primary: #f90;
@import "node_modules/bulma/bulma";
```

In about 1-2 seconds, the browser should update automatically, and the "Primary" button color should change to orange.

## Finé

It takes 1-2 seconds to compile and serve Bulma changes using sass-embedded, chokidar, and alive-server.

# Old Poop Text 

## Test building `mystyles.scss` with embedded_sass

```sh
npm run build
```

## Check the build directory

```sh
tree -I node_modules
```

You should see this.

```text
.
├── css
│   └── mystyles.css
├── index.html
├── package-lock.json
├── package.json
├── sass
│   └── mystyles.scss
└── sassinate.js
```

## Test using watch

First, delete the css file.

```sh
rm css/mystyles.css
```

Now run watch.

```sh
npm run watch
```


# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
* live-server
  * [npm: live-server](https://www.npmjs.com/package/live-server)
* alive-server
  * [npm: alive-server](https://www.npmjs.com/package/alive-server)
  * [announce on live-server github](https://github.com/tapio/live-server/issues/398)
* watch
  * [npm: watch](https://www.npmjs.com/package/watch)
  * [Run package.json scripts upon any file changes in a folder](https://flaviocopes.com/package-json-watch/)
* concurrently
  * [npm: concurrently](https://www.npmjs.com/package/concurrently)
* [Comparing the New Generation of Build Tools](https://css-tricks.com/comparing-the-new-generation-of-build-tools/#aa-live-server)
* [Use the Dart Sass JavaScript Implementation to Compile SASS with Node.js](https://www.devextent.com/dart-sass-javascript-implementation-npm-compile-sass/)
* [CommonJS vs. ES modules in Node.js](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)
* [Async/await](https://javascript.info/async-await)
