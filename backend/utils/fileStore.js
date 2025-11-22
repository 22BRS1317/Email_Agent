const fs = require('fs').promises;
async function readJSON(path) {
  try {
    const raw = await fs.readFile(path, 'utf8');
    if (!raw || raw.trim() === '') return [];
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw err;
  }
}
async function writeJSON(path, obj) {
  // Ensure directory exists
  const dir = require('path').dirname(path);
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
  await fs.writeFile(path, JSON.stringify(obj, null, 2), 'utf8');
}
module.exports = { readJSON, writeJSON };
