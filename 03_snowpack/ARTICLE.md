Lightly based on the [Bulma with Webpack tutorial](https://bulma.io/documentation/customize/with-webpack/).

## Create a work directory on the host.

```sh
mkdir snowpack-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-snowpack-docker` in the container as well as publishing port 1234 to the host.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-snowpack-docker \
           -w /bulma-snowpack-docker \
           -p 8080:8080 \
           archlinux:latest /bin/sh
```

Update the packages in the container and install some stuff.

```sh
pacman --noconfirm -Syu npm dart-sass tree neovim
```

If you get the following error, delete your archlinux image and pull it down again.

```text
error: libcap: signature from "David Runge <dvzrv@archlinux.org>" is marginal trust
```

## Get a new project going

Initialize a new `package.json`. Instead of answering questions, let's try using the `npm pkg` command instead, just for fun. The license value needs to be set to a valid [SPDX License Identifier](https://spdx.org/licenses/). See the [docs for `npm pkg`](https://docs.npmjs.com/cli/v7/commands/npm-pkg).

```sh
npm init -y
npm pkg set name=bulma-snowpack-docker
npm pkg set version=0.0.1
npm pkg set main=src/index.html
npm pkg set description="bulma snowpack live reload in docker"
npm pkg set author=blitterated
npm pkg set license=0BSD
cat package.json
```

## Install project dependencies

```sh
npm install snowpack --save-dev
npm install bulma --save-dev
npm install @snowpack/plugin-sass --save-dev
```

## Create a Snowpack config

```sh
cat <<EOF > snowpack.config.mjs
export default {
  plugins: [
    [
      '@snowpack/plugin-sass',
      {
        native: false,
      },
    ],
  ],
  compilerOptions: {
    loadPath: './node_modules',
  },
};
EOF
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
@import "bulma/bulma.sass";
EOF
```

Create an HTML page that is styled with Bulma. FIXME: path to css

```sh
cat <<EOF > src/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My custom Bulma website</title>
    <link rel="stylesheet" href="scss/mystyles.css">
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

## Add script to `package.json` to build with snowpack.

```sh
npm pkg set scripts.build="snowpack build"
```

## Run a build.

```sh
npm run build
```

## Check the build directory

```sh
tree build
```

You should see this.   FIXME: ALL of the files in root wind up in build

```text
build
├── css
│   └── mystyles.css
├── js
│   └── bundle.js
└── mypage.html
```

## Try running the snowpack live reload server

```sh
npx snowpack dev
```

You should be able to browse the site on the host from this link based on how we started Docker.

[http://localhost:8080/](http://localhost:8080/)

## Try changing the `$primary` color in Bulma from turquoise to orange.

Edit the `src/mystyles.scss` file and add the line changing colors between the existing two. It should look like this:

```sass
@charset "utf-8";
$primary: #f90;
@import "node_modules/bulma/bulma";
```

In about 5 seconds, the browser should update automatically, and the "Primary" button color should change to orange.

## Add script to `package.json` to run the snowpack server with `npm` instead of `npx`.

```sh
npm pkg set scripts.server="snowpack dev"
```

Run the server.

```sh
npm run server
```

## Finé

It takes about 3 seconds to compile Bulma using snowpack with the built in sass (javascript).
It's also 3 seconds for dart-sass on the command line called from snowpack.

From Snowpack's homepage:
Update (April 20, 2022): Snowpack is no longer actively maintained and is not recommended for new projects.

Great.

The next step would have been to test out `plugin-sass` with `native: true`. This would force the usage of the Dart Sass command, thus using the Dart VM.

# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
* Snowpack
  * [Quick Start](https://www.snowpack.dev/tutorials/quick-start)
  * [Sass](https://www.snowpack.dev/guides/sass/)
  * [The Snowpack Guide to connecting your favorite tools](https://www.snowpack.dev/guides/connecting-tools)
  * [Streaming Imports](https://www.snowpack.dev/guides/streaming-imports)
* [Correct way to install bulma sass](https://github.com/FredKSchott/snowpack/discussions/1622)
* [Comparing the New Generation of Build Tools: Snowpack](https://css-tricks.com/comparing-the-new-generation-of-build-tools/#aa-snowpack)
* [GH: @snowpack/plugin-sass](https://github.com/FredKSchott/snowpack/tree/main/plugins/plugin-sass)
* [Sass building for prod in container](https://elixirforum.com/t/sass-building-for-prod-in-container/42969)
* [Package signature error when running pacstrap](https://bbs.archlinux.org/viewtopic.php?id=278518)



# TODO

* Enable source=remote

  ```js
  export default {
    packageOptions: {
      source: 'remote',
    },
    ...
  ```










