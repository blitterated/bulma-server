I was researching and playing around with different bundlers in Docker trying to find a quick way to test Bulma customizations. Most of the bundlers (except Vite) are way to slow. A few are on their way out, and one is simply abandoned (snowpack). Eventually I became curious about how live/hot reloading works, and I wanted to try rolling my own. Turns out it's pretty easy with just a little javascript for glue.

## Usage

### Build the Docker image

```sh
./bs build
```

### Run a container

This will do two things:
1. Serve a basic index.html with bulma examples on it at [http://localhost:8080](http://localhost:8080).
2. Map a bind mount to the `/src` directory on the host.

```sh
./bs run
```
### Edit the Sass file

Open `src/sass/mystyles.scss` in an editor and make some edits. Changes in the browser should appear nearly immediately.
