Lightly based on the [Bulma with Webpack tutorial](https://bulma.io/documentation/customize/with-webpack/).

## Create a work directory on the host.

```sh
mkdir bulma-parcel-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-parcel-docker` in the container as well as publishing port 1234 to the host.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-parcel-docker \
           -w /bulma-parcel-docker \
           -p 1234:1234 \
           alpine /bin/sh
```

Update the packages in the container and install some stuff.

```sh
apk update
apk add npm tree
```

## Get a new project going

Initialize a new `package.json`. Instead of answering questions, let's try using the `npm pkg` command instead, just for fun. The license value needs to be set to a valid [SPDX License Identifier](https://spdx.org/licenses/). See the [docs for `npm pkg`](https://docs.npmjs.com/cli/v7/commands/npm-pkg).

```sh
npm init -y
npm pkg set name=bulma-parcel-docker
npm pkg set version=0.0.1
npm pkg set main=src/index.html
npm pkg set description="bulma parcel live reload in docker"
npm pkg set author=blitterated
npm pkg set license=0BSD
cat package.json
```

## Install project dependencies

```sh
npm install bulma --save-dev
npm install parcel --save-dev
```

## Add project files

Create a `src` directory tree for the source files.

```sh
mkdir -p src/scss
```

Create the Sass file that imports Bulma.

```sh
cat <<EOF > src/scss/mystyles.scss
@charset "utf-8";
@import "node_modules/bulma/bulma";
EOF
```

Create an HTML page that is styled with Bulma.

```sh
cat <<EOF > src/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My custom Bulma website</title>
    <link rel="stylesheet" href="scss/mystyles.scss">
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

Create the build directory.

```sh
mkdir dist
```

## Take a look at the current `src` directory and files.

```sh
tree src
```

It should look like this.

```text
src
├── index.html
└── scss
    └── mystyles.scss
```

## Add script to `package.json` to build with parcel.

```sh
npm pkg set scripts.build="parcel build"
```

## Run a build.

```sh
npm run build
```

## Check the build directory

```sh
tree dist
```

You should see this.

```text
dist
├── css
│   └── mystyles.css
├── js
│   └── bundle.js
└── mypage.html
```

## Try running the parcel live reload server

```sh
npx parcel src/index.html
```

You should be able to browse the site on the host from this link based on how we started Docker.

[http://localhost:1234/](http://localhost:1234/)

__NOTE:__ Make sure you refer to `index.html` in the `src` directory, and not in the `dist` directory, or else you'll get an error like below.

```text
/bulma-parcel-docker # npx parcel dist/index.html
Server running at http://localhost:1234
🚨 Build failed.

@parcel/core: Failed to resolve '/index.b432644c.css' from './dist/index.html'
@parcel/resolver-default: Cannot load file '../index.b432644c.css' in './dist'.
```

## Try changing the `$primary` color in Bulma from turquoise to orange.

Edit the `src/mystyles.scss` file and add the line changing colors between the existing two. It should look like this:

```sass
@charset "utf-8";
$primary: #f90;
@import "node_modules/bulma/bulma";
```

In about 5 seconds, the browser should update automatically, and the "Primary" button color should change to orange.

## Add script to `package.json` to run the parcel server with `npm` instead of `npx`.

```sh
npm pkg set scripts.server="parcel src/index.html"
```

Run the server.

```sh
npm run server
```

## Finé

It still takes about 5-6 seconds to compile Bulma using parcel, not really any better than webpack. C'est la vie.

# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
* [Live reload in the frontend with Parcel](https://blog.logrocket.com/complete-guide-full-stack-live-reload/#live-reload-frontend-parcel)
* [ashleydavis/live-reload-examples/6-frontend-with-parcel](https://github.com/ashleydavis/live-reload-examples/tree/main/6-frontend-with-parcel)
* parcel docs
  * [Building a web app with Parcel](https://parceljs.org/getting-started/webapp/)
  * [Development](https://parceljs.org/features/development/)
* [How setup BulmaCSS with Parcel](https://dev.to/danywalls/setup-bulmacss-with-parcel-35ml)
* [CodeSandbox: parcel bulma](https://codesandbox.io/s/ktgfx?file=/package.json)
* [npm: Live Server](https://www.npmjs.com/package/live-server)
* [docker: Container networking](https://docs.docker.com/config/containers/container-networking/)
* [Bulma Variables](https://bulma.io/documentation/customize/variables/)















