# Auto-Ship Rule

After you finish ANY code change:
1. Run `npm run build` and fix every error until it passes.
2. Run `git add -A`.
3. Commit with a short message that describes the change (conventional style, e.g. 'feat: add credit text').
4. Run `git push origin main`.

Never leave finished changes uncommitted. Never force-push. Never commit .env files or secrets. If the build fails, do not push; fix it first. If the push is rejected, run `git pull --rebase origin main`, then push again.
