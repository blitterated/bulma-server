Lightly based on the [Bulma with Webpack tutorial](https://bulma.io/documentation/customize/with-webpack/).

## Create a work directory on the host.

```sh
mkdir vite-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-vite-docker` in the container as well as publishing port 1234 to the host.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-vite-docker \
           -w /bulma-vite-docker \
           -p 5173:5173 \
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

Initialize a new project including `package.json`.

```sh
npm create --yes vite@latest vite-bulma -- --template vanilla
cat vite-bulma/package.json
```

## Jump into the project directory and install dependencies

```sh
cd vite-bulma
npm install
```

## Setup Sass compilation

Vite handles Sass without needing to configure a plugin, but we do need to install the Sass pre-processor. Instead of slowing things down with the nodejs based `sass` package, we're going to try to use an `npm` alias to use `sass-embedded` instead. That way we get the speed up of Dart Sass using the Dart VM.

```sh
npm install --save-dev sass@npm:sass-embedded
```

## Install Bulma

```sh
npm install bulma --save-dev
```

## Remove unneeded demonstration files

```sh
rm counter.js index.html javascript.svg main.js public/vite.svg style.css
```

## Add project files

Create the Sass file that imports Bulma.

```sh
cat <<EOF > mystyles.scss
@charset "utf-8";
@import "node_modules/bulma/bulma.sass";
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
├── index.html
├── mystyles.scss
├── package-lock.json
├── package.json
└── public
```

## Run a build

`build` is already configured in `package.json`'s `scripts` section.

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
├── assets
│   └── index.e4617a29.css
└── index.html
```

Also, take a look at the stylesheet link in the built index.html. You'll see that now reflects the path to the built CSS file.

```sh
grep "stylesheet" dist/index.html
```
```html
    <link rel="stylesheet" href="/assets/index.e4617a29.css">
```

## Try running the vite dev server

```sh
npx vite --host
```

You should be able to browse the site on the host from this link based on how we started Docker.

[http://localhost:5173/](http://localhost:5173/)

## Try changing the `$primary` color in Bulma from turquoise to orange.

Edit the `mystyles.scss` file and add the line changing colors between the existing two. It should look like this:

```sass
@charset "utf-8";
$primary: #f90;
@import "node_modules/bulma/bulma";
```

In about 1-3 seconds, the browser should update automatically, and the "Primary" button color should change to orange.

## Update scripts in `package.json` to run the vite server with `npm run` instead of `npx`.

The generated `package.json` comes with scripts to run vite already. 

```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"```
```

Edit them so they play nicer with running inside the Docker container.

```json
   "scripts": {
     "dev": "vite --host",
     "build": "vite build",
     "preview": "vite preview --host --port 5173"```
```

Run the server.

```sh
npm run dev
```

or

```sh
npm run preview
```

## Finé

It takes around 1 to 3 seconds to compile Bulma using vite with embedded sass (Dart VM). These are the best times yet.

# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
* Vite
  * [Getting Started: Scaffolding Your First Vite Project](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)
  * Sass
    * [Features: CSS Preprocessors](https://vitejs.dev/guide/features.html#css)
    * [Trick Vite into using Embedded Sass](https://github.com/vitejs/vite/discussions/6817#discussioncomment-3333742)
* [Comparing the New Generation of Build Tools](https://css-tricks.com/comparing-the-new-generation-of-build-tools/#aa-vite)
* [Embedded Sass is Live](https://sass-lang.com/blog/embedded-sass-is-live)
* [Creating Aliases with npm](https://rhythmandbinary.com/post/2021-12-06-creating-aliases-with-npm)
* [tree: ignore directories with patterns](https://zaiste.net/posts/tree-ignore-directories-patterns/)
