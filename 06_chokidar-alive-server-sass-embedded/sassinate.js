import { writeFileSync } from "fs";

import sass from "sass-embedded";
import chokidar from "chokidar";
import aliveServer from "alive-server";

const siteRoot = `${process.cwd()}/src/`;
const sassFile = `${siteRoot}${process.argv[2]}`;
const cssFile  = `${siteRoot}${process.argv[3]}`;
const nodeModulesPath  = `${process.cwd()}/node_modules/`;

function buildSass() {
  const compileResult = sass.compile(
    sassFile,
    {
      loadPaths: [nodeModulesPath],
      sourceMap: false,
    });

  writeFileSync(cssFile, compileResult.css, "utf8");
}

const watcher = chokidar.watch(sassFile, { persistent: true });
watcher
  .on('add', () => buildSass())
  .on('change', () => buildSass());

aliveServer.start({
  watch: cssFile,
  root: siteRoot
});
