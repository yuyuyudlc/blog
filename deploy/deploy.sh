#!/usr/bin/env bash
set -Eeuo pipefail

# Run as ubuntu. Source code is fetched from origin; never copy a local worktree.
root=/opt/tatami-blog
repository=https://github.com/yuyuyudlc/blog
revision=${1:?Usage: bash deploy/deploy.sh FULL_COMMIT_SHA}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'A full commit SHA is required.' >&2; exit 1; }
[[ $(id -un) == ubuntu ]] || { echo 'Run as ubuntu.' >&2; exit 1; }
mkdir -p "$root/runtime" "$root/releases"
exec 9>"$root/runtime/deploy.lock"
flock -n 9 || { echo 'Another deployment is running.' >&2; exit 1; }
export GIT_TERMINAL_PROMPT=0
mirror="$root/repository.git"
if [[ ! -d "$mirror" ]]; then
  git clone --bare "$repository" "$mirror"
fi
[[ $(git --git-dir="$mirror" remote get-url origin) == "$repository" ]] || { echo 'Unexpected origin.' >&2; exit 1; }
git --git-dir="$mirror" fetch --prune origin '+refs/heads/main:refs/remotes/origin/main'
git --git-dir="$mirror" cat-file -e "$revision^{commit}"
git --git-dir="$mirror" merge-base --is-ancestor "$revision" refs/remotes/origin/main

release="$(date -u +%Y%m%dT%H%M%SZ)-${revision:0:12}"
directory="$root/releases/$release"
previous=$(readlink -f "$root/current")
original_pid=$(systemctl show totoro --property=MainPID --value)
original_nginx=$(sha256sum /etc/nginx/sites-available/totoro)
git --git-dir="$mirror" worktree add --detach "$directory" "$revision"

# The old release keeps serving while this isolated worktree builds.
sudo systemd-run --quiet --wait --pipe --collect \
  --unit="tatami-build-$release" --uid=ubuntu \
  --working-directory="$directory" \
  --property=MemoryMax=1400M --property=CPUQuota=100% --property=Nice=10 \
  --setenv=NODE_OPTIONS=--max-old-space-size=896 --setenv=NEXT_TELEMETRY_DISABLED=1 \
  /bin/bash -euc 'npm ci --no-audit --no-fund; npm run test:photos; npm run lint; npm run build' \
  2>&1 | tee "$root/runtime/$release-build.log"
git -C "$directory" diff --exit-code HEAD

ready() {
  for attempt in {1..30}; do
    if curl --silent --fail --max-time 3 http://127.0.0.1:3100/ >/dev/null; then return 0; fi
    sleep 1
  done
  return 1
}
switched=0
rollback() {
  result=$?
  trap - EXIT
  if (( switched )); then
    ln -s "$previous" "$root/current.rollback.$$"
    mv -Tf "$root/current.rollback.$$" "$root/current"
    sudo systemctl restart tatami-blog
    ready || true
    echo "Deployment failed; restored $previous" >&2
  fi
  exit "$result"
}
trap rollback EXIT
ln -s "$directory" "$root/current.next.$$"
mv -Tf "$root/current.next.$$" "$root/current"
switched=1
sudo systemctl restart tatami-blog
ready
curl --silent --fail --max-time 15 http://127.0.0.1:8081/category/photos >/dev/null
while IFS= read -r -d '' post; do
  slug=${post##*/}
  curl --silent --fail --max-time 15 "http://127.0.0.1:8081/posts/${slug%.md}" >/dev/null
done < <(find "$directory/posts" -maxdepth 1 -name '*.md' -print0)
curl --silent --fail --max-time 20 https://nuaatotoro.xyz/ >/dev/null
[[ $(systemctl show totoro --property=MainPID --value) == "$original_pid" ]]
[[ $(sha256sum /etc/nginx/sites-available/totoro) == "$original_nginx" ]]
REVISION="$revision" RELEASE="$release" PREVIOUS="$previous" python3 - <<'PY'
import datetime, json, os, pathlib
runtime = pathlib.Path('/opt/tatami-blog/runtime')
record = {'source': 'git', 'repository': 'https://github.com/yuyuyudlc/blog',
          'commit': os.environ['REVISION'], 'release': os.environ['RELEASE'],
          'previous_release': os.environ['PREVIOUS'],
          'verified_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'verification': 'photo tests, lint, build, homepage, photos, all posts, original site'}
temporary = runtime / 'deployment.json.tmp'
temporary.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
temporary.replace(runtime / 'deployment.json')
PY
switched=0
trap - EXIT
echo "Published Git commit $revision in $directory"
