import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const run = (args) => spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
if (run(['rev-parse', '--git-dir']).status === 0) {
  const current = run(['config', '--get', 'core.hooksPath']).stdout.trim();
  if (current && current !== '.githooks') {
    console.log('保留现有 Git hooks；提交前可手动运行 npm run photos:check。');
  } else {
    const result = run(['config', '--local', 'core.hooksPath', '.githooks']);
    if (result.status !== 0) throw new Error('无法安装照片提交检查。');
    await fs.chmod(new URL('../.githooks/pre-commit', import.meta.url), 0o755);
    console.log('已启用照片提交检查。');
  }
}
