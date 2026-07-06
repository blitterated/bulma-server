## Clean up bulma-docker experiments

* __DONE__ Number and rename directories according to numbered markdown files
* __DONE__ Move numbered markdown files into numbered dirs as `README.md`
* Add everything into a git repo
  * Whoops, 06 is already a git repo
    * Commit and push current changes: README.md and ARTICLE.md
    * `git mv` everything into a subfolder
      * [Move all of git repo root into a subfolder](https://stackoverflow.com/a/67225847)

        ```
        newdir="06_chokidar-alive-server-sass-embedded"
        git ls-files | \
        for f in $(cat -); do
          mkdir -p $(dirname "$newdir/$f")
          git mv "$f" "$newdir/$f"
        done
        ```

* Edit `ARTICLE.md` files.
  * Move "Lightly based on the Bulma with Webpack tutorial." to top level `README.md`
  * Rename directories in "Create a work directory on the host" section to the new numbered directories
* Add a `Dockerfile` to each sub dir
  * See in `06_chokidar-alive-server-sass-embedded/Dockerfile` directory
* Add READMEs for each sub dir
  * Add section at top to allow building and running container after pulling down repo
  * See in `06_chokidar-alive-server-sass-embedded/README.md` directory
* Edit `Articles/blitterated articles.txt` on Dropbox
  * Change original number markdown filepaths to the new `ARTICLE.md` filepaths
