Lightly based on the [Bulma with Webpack tutorial](https://bulma.io/documentation/customize/with-webpack/).

## Create a work directory on the host.

```sh
mkdir live-server-docker && cd $_
```

## Get a container going

Start a container and bind mount the current directory to a work directory called `bulma-live-server-docker` in the container as well as publishing port 1234 to the host.

```sh
docker run -it --rm --init \
           -v "$(pwd)":/bulma-live-server-docker \
           -w /bulma-live-server-docker \
           -p 8080:8080 \
           archlinux:latest /bin/sh
```

Update the packages in the container and install some stuff.

```sh
pacman --noconfirm -Syu npm dart-sass entr tree neovim
```

If you get the following error, delete your archlinux image and pull it down again.

```text
error: libcap: signature from "David Runge <dvzrv@archlinux.org>" is marginal trust
```

## Install Bulma and live-server

__NOTE:__ This will create `package.json` and `package-lock.json`.

```sh
npm install bulma --save-dev
npm install live-server --save-dev
```

See below for a note regarding the deprecated dependencies. I'm not going to worry about them too much since they're all dev dependencies.

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
└── package.json
```

## Test building `mystyles.scss` with Dart Sass

```sh
sass --no-source-map mystyles.scss mystyles.css
```

## Check the build directory

```sh
tree -I node_modules
```

You should see this.

```text
.
├── index.html
├── mystyles.css
├── mystyles.scss
├── package-lock.json
└── package.json
```

## Test using entr

The [`entr` github page](https://github.com/eradman/entr#docker-and-wsl) states:
> Incomplete inotify support on Windows Subsystem for Linux and Docker for Mac can cause entr to respond inconsistently. Setting the environment variable ENTR_INOTIFY_WORKAROUND will enable entr to operate in these environments.

I'm on Docker Desktop on a Mac. It's not Docker for Mac, but we'll incorporate that environment var into our command anyway. Now when we edit `mystyles.scss` a new `mystyles.css` file will be written.

The `-p` switch for `entr` prevents it from running the `sass` command as soon as it's started. instead it `-p`ostpones running it until the file is touched.
```sh
ENTR_INOTIFY_WORKAROUND=1 echo mystyles.scss | entr -p sass --no-source-map mystyles.scss mystyles.css
```

I edited `mystyles.scss` after running the above. Here are the timestamps from the CSS file before and after my edits.

before:

```text
$ ls -l mystyles.css
-rw-r--r--  1 peteyoung  staff  252443 Aug 21 21:04 mystyles.css
```

after:

```text
$ ls -l mystyles.css
-rw-r--r--  1 peteyoung  staff  252443 Aug 21 21:17 mystyles.css
```

Yes, 13 minutes passed. It was a very slow edit.

## Serve the site and live reload style changes

This command runs `entr` in the background, and then starts up `live-server` in the foreground.

Since we're running `entr` in the background, we want to specify the `-n` flag to disable TTY usage. This prevents `entr` from stopping in the background. You'll get `Stopped(SIGTTOU)` on file changes if you don't use `-n`.

```sh
ENTR_INOTIFY_WORKAROUND=1 echo mystyles.scss | entr -pn sass --no-source-map mystyles.scss mystyles.css & npx live-server --watch=mystyles.css
```

You should be able to browse the site on the host from this link based on how we started Docker.

[http://localhost:8080/](http://localhost:8080/)

## Try changing the `$primary` color in Bulma from turquoise to orange.

Edit the `mystyles.scss` file and add the line changing colors between the existing two. It should look like this:

```sass
@charset "utf-8";
$primary: #f90;
@import "node_modules/bulma/bulma";
```

In about 1-2 seconds, the browser should update automatically, and the "Primary" button color should change to orange.

## Manual shutdown

To shut everything down:
1. `ctrl-c` to stop `live-server`
2. `fg` to bring `entr` into the foreground
3. `ctrl-c` to stop `entr`

## Add scripts in `package.json` to start everything with `npm run`.

Create a shell script to run `enter` and `live-server`. Make sure `entr` is killed when `live-server` exits.

```sh
cat << 'EOF' > serve.sh
#!/bin/bash
export ENTR_INOTIFY_WORKAROUND=1
echo mystyles.scss | entr -pn sass --no-source-map mystyles.scss mystyles.css &
ENTR_PID=$!
npx live-server --watch=mystyles.css
kill $ENTR_PID
EOF
```

Make it runnable.

```sh
chmod +x server.sh
```

Run the server.

```sh
./serve.sh
```

To stop everything, just use `ctrl-c`, and both processes will shut down.

## Finé

It takes 1 second to compile Bulma using live-server with dart sass cli. THESE are the best times yet.

# Regarding live-server's deprecated dependencies

I found an interesting comment on [a post complaining about deprecation warnings when installing `vue-cli`](https://lightrun.com/answers/vuejs-vue-cli-mutliple-warnings-and-deprecated-dependencies-on-npm-install-vuecli).

> I’d like to clarify that we cannot upgrade transitive dependencies of packages that we are using. Even if we update our direct dependencies, we cannot ensure that these dependencies won’t themselves still depend on deprecated packages.
> 
> I’d also like to clarify that, while annoying, these warnings don’t necessarily mean that these transitive dependencies will have any effect on your app. They could, i.e., be `devDependencies` of a package used by a package use by a package used by vue-cli, and yet, that nested, deprecated dependency will never be required at any step of using vue-cli.
> 
> Similarly, peer Dependency warnings are also often a side effect of the install process itself or transitive dependencies, but usually not something we can resolve or something affecting your code.
> 
> In other words: While we can improve the situation for our direct dependencies in many situations, and usually do, we can’t resolve warnings like these for transitive dependencies, so you will have to live with them in some scenarios.
> 
> That’s part of the JS package ecosystem.

Lame.

# Resources

* [Use Bulma with webpack](https://bulma.io/documentation/customize/with-webpack/)
* [npm-pkg](https://docs.npmjs.com/cli/v7/commands/npm-pkg)
* live-server
  * [npm: live-server](https://www.npmjs.com/package/live-server)
* entr
  * [GitHub](https://github.com/eradman/entr)
  * [Website](http://eradman.com/entrproject/)
  * [Man Page](http://eradman.com/entrproject/entr.1.html)
  * [entr answer to inotifywait question on Super User](https://superuser.com/a/665208)
  * [Make entr run in background](https://www.reddit.com/r/linuxquestions/comments/f2alni/make_entr_run_in_background/)
* [Comparing the New Generation of Build Tools](https://css-tricks.com/comparing-the-new-generation-of-build-tools/#aa-live-server)
* [A Deep Dive into the SIGTTIN / SIGTTOU Terminal Access Control Mechanism in Linux](http://curiousthing.org/sigttin-sigttou-deep-dive-linux)
* [How to run a program in background and also using && to execute another command](https://unix.stackexchange.com/questions/288437/how-to-run-a-program-in-background-and-also-using-to-execute-another-command)
