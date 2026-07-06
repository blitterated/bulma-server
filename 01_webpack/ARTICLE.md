## Create a work directory on the host.

```sh
mkdir bulma-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-docker` in the container.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-docker \
           -w /bulma-docker \
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
npm pkg set name=bulmadocker
npm pkg set version=0.0.1
npm pkg set description="bulma webpack live reload in docker"
npm pkg set main=webpack.config.js
npm pkg set author=blitterated
npm pkg set license=0BSD
```

## Install project dependencies

### A couple of changes to the npm installs:

The Bulma doc linked at the top is a little dated. Some plugins need to be changed.

Remove `extract-text-webpack-plugin` due to being [deprecated](https://github.com/webpack-contrib/extract-text-webpack-plugin#readme).
We'll use `mini-css-extract-plugin` instead.

Swap out  the [also deprecated](https://www.npmjs.com/package/node-sass) `node-sass` for (dart) `sass`.

```sh
npm install node-sass --save-dev
```

becomes

```sh
npm install sass --save-dev
```

### Install the necessary dev packages

```sh
npm install bulma --save-dev
npm install css-loader --save-dev
npm install mini-css-extract-plugin --save-dev
npm install sass --save-dev
npm install sass-loader --save-dev
npm install style-loader --save-dev
npm install webpack --save-dev
npm install webpack-cli --save-dev
```

## Add project files

Create a `webpack.config.js` tuned to building Sass.

```sh
cat <<EOF > webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: "none",
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
  },
  module: {
    rules: [{
      test: /\.s[ac]ss$/,
      use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false, // not needed for just Sass. Disabling speeds builds.
            }
          }
        ]
    }]
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/mystyles.css'
    }),
  ],
  experiments: {
    backCompat: true,
  }
};
EOF
```

Create a `src` directory for the source files.

```sh
mkdir src
```

Create `index.js` so webpack can find the Sass code.

```sh
cat <<EOF > src/index.js
require('./mystyles.scss');
EOF
```

Create the Sass file that imports Bulma.

```sh
cat <<EOF > src/mystyles.scss
@charset "utf-8";
@import "~bulma/bulma";
EOF
```

Create the build directories.

```sh
mkdir -p dist/css
mkdir dist/js
```

Create an HTML page that is styled with Bulma.

```sh
cat <<EOF > dist/mypage.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My custom Bulma website</title>
    <link rel="stylesheet" href="css/mystyles.css">
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

## Take a look at the current directories and files.

`dist`

```sh
tree dist
```

should look like this. 

```text
dist
├── css
├── js
└── mypage.html
```

and `src`

```sh
tree src
```

should look like this.

```text
src
├── index.js
└── mystyles.scss
```

## Add script to `package.json` to build with webpack.

```sh
npm pkg set scripts.build="webpack --bail"
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

Ugh, build time of Bulma with no customizations is 6 - 8 seconds.
`experiments: { backCompat: true }` did nothing.
`sourceMap: false` got it down to 6 from 8 seconds.

## Finé

The idea was to continue with webpack as a live reload solution while customizing Bulma. But with 6 - 8 second reloads, the gains of a tight feedback loop are defeated. C'est la vie.

# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [Automate `npm init`](https://www.codegrepper.com/code-examples/shell/automate+npm+init)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
