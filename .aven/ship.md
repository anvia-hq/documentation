Ship this thread's work.

Pull requests go to `main` in `anvia-hq/documentation`, merged with merge commits. I review and merge: you never merge, enable auto-merge, or deploy.

1. Commit what belongs to the work. Use Conventional Commits with a scope where it helps, like `docs(memory-prisma): record the 1.3.0 release` or `fix(client): align generic stream example`. Never commit `.vitepress/dist`, `.vitepress/cache`, `.wrangler`, `node_modules`, `.env` files, keys, customer data, or production traces. Change `pnpm-lock.yaml` only when a dependency change needs it.

2. Rebase onto the default branch: `git fetch origin main && git rebase origin/main`. If a conflict is not yours to decide, stop and tell me.

3. Rename the branch to this repository's pattern, matching the kind of change: `git branch -m docs/<short-topic>`, or `fix/`, `ci/`, `chore/`. Take the new name from `git branch --show-current` in the steps below.

4. Use Node 24 from `.nvmrc` and pnpm 11.22.0, the versions CI uses: `eval "$(fnm env)" && fnm use 24`. Install only when `node_modules` is missing: `pnpm install --frozen-lockfile`.

5. Run the checks CI runs, in this order. Fix what this change broke. If a check fails for an unrelated reason, stop and tell me with the failing output instead of working around it.
   - Always: `pnpm docs:build`
   - Always: `pnpm example:golden-path:check`
   - When the diff touches `sdk/`, `packages/`, `index.md`, `public/llms*.txt`, or `scripts/sdk-coverage.json`: `pnpm sdk:check`
   - When it touches `packages/cli.md` or `packages/cli/`: `pnpm cli:check`
   - When it touches `scripts/sdk-coverage.json` or `sdk-coverage.md`: `node scripts/check-sdk-coverage.mjs && node --test scripts/test-sdk-coverage.mjs`
   - When it touches Markdown examples under `sdk/` or `packages/`: `node scripts/typecheck-rc-snippets.mjs --source`

   The SDK checks read an Anvia source checkout at the commit in `scripts/sdk-coverage.json`. Do not move my checkout; use a throwaway worktree:
   ```sh
   REV=$(node -p "require('./scripts/sdk-coverage.json').reviewedSdkRevision")
   git -C /Volumes/indrazm-ext/anvia-hq/anvia worktree add --detach /tmp/anvia-reviewed "$REV"
   (cd /tmp/anvia-reviewed && pnpm install --frozen-lockfile && pnpm --filter @anvia/core build)
   ANVIA_REPO=/tmp/anvia-reviewed pnpm sdk:check
   git -C /Volumes/indrazm-ext/anvia-hq/anvia worktree remove --force /tmp/anvia-reviewed
   ```
   If that install or build fails, stop and tell me. Never change `reviewedSdkRevision` or run `node scripts/check-sdk-coverage.mjs --refresh` to make a check pass.

6. Record proof when a page, layout, or navigation looks different. For a change with nothing to see, skip this step and say so under Notes.
   ```sh
   pnpm docs:preview --port 4173            # in the background
   mkdir -p .aven/proof
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars \
     --window-size=1280,1600 --screenshot=.aven/proof/<page>.png "http://localhost:4173/<route>"
   ```
   Capture each changed page at 1280 wide, then stop the preview server. Commit the images: `git add .aven/proof && git commit -m "docs: add proof screenshots"`. Keep `.aven/proof/` on the branch, and link the files by full URL in the description.

7. Push the branch to the folder and to GitHub, so the pull request has something to compare:
   ```sh
   git push -u origin HEAD
   git push git@github.com:anvia-hq/documentation.git HEAD
   ```
   Never force-push `main` or a shared branch.

8. Open the pull request. This clone's `origin` is a local folder, so name the repository explicitly. Write the description to `/tmp/pr-body.md` first:
   ```sh
   gh pr create --repo anvia-hq/documentation --base main \
     --head "$(git branch --show-current)" \
     --title "docs(scope): short summary" --body-file /tmp/pr-body.md
   ```
   The description follows this repository's pattern; drop any heading you have nothing for:
   ```markdown
   ## What changed
   <what changed, and which pages or navigation it affects>
   ## What and why
   <the reason, the Anvia revision and source links you verified claims against>
   ## Validation
   <each command you ran and its result line>
   ## Proof
   <screenshots as https://github.com/anvia-hq/documentation/blob/<branch>/.aven/proof/<page>.png>
   ## Notes
   <limitations, checks skipped and why, follow-up work>
   ```
   Ready for review, not a draft. No labels, no reviewer assignment. Link an issue or Cockpit item only when this thread names one. If a pull request is already open for this branch, the push updates it: edit that description instead of opening a second one.

9. Tell me the pull request URL, which checks passed, and anything you could not verify.

Never run `pnpm docs:deploy` or `wrangler deploy`: deployment happens from CI on `main`. Never push to `main`, commit build output, or change files outside this repository, including my Anvia checkout.
