// Run against a fresh `npm run build`; no backend or model is started.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const http = require('node:http')
const os = require('node:os')
const path = require('node:path')
const { chromium } = require('playwright')

async function main() {
  const root = path.resolve(__dirname, '../out')
  const prefix = (process.env.TEST_BASE_PATH || '').replace(/\/$/, '')
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8', '.json': 'application/json' }
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      if (prefix && pathname !== prefix && !pathname.startsWith(`${prefix}/`)) { response.writeHead(404).end(); return }
      const relative = pathname.slice(prefix.length) || '/'
      const file = path.resolve(root, `.${relative.endsWith('/') ? `${relative}index.html` : relative}`)
      if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return }
      const data = await fs.readFile(file)
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(data)
    } catch { response.writeHead(404).end() }
  })
  let browser
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    try { browser = await chromium.launch({ headless: true }) }
    catch { browser = await chromium.launch({ headless: true, channel: 'msedge' }) }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const url = `http://127.0.0.1:${server.address().port}${prefix}/`
    const apiRequests = [], externalRequests = [], failedResponses = [], errors = []
    page.on('request', request => {
      if (request.url().includes('/api/')) apiRequests.push(request.url())
      if (!request.url().startsWith(new URL(url).origin)) externalRequests.push(request.url())
    })
    page.on('response', response => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`) })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: '从一个工程问题开始。' }).waitFor()
    assert.equal(await page.locator('.question-list button').count(), 10)
    assert.equal(await page.locator('.architecture img').evaluate(image => image.complete && image.naturalWidth > 0), true)
    for (let index = 0; index < 10; index++) {
      await page.locator('.question-list button').nth(index).click()
      assert.equal(await page.locator('.bubble.assistant').count(), index + 1)
      assert.ok(await page.locator('.bubble.assistant').last().locator('.citation-link').count())
    }
    await page.locator('.bubble.assistant').last().locator('.citation-link').first().click()
    await page.locator('dialog[open]').waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('dialog[open]').count(), 0)
    assert.equal(await page.locator('.bubble.assistant').last().locator('.citation-link').first().evaluate(element => element === document.activeElement), true)
    // Reopen and use the explicit close button to catch stale dialog state.
    await page.locator('.bubble.assistant').last().locator('.citation-link').first().click()
    await page.getByRole('button', { name: '关闭证据详情' }).click()
    await page.getByLabel('输入项目问题').fill('今天天气怎么样？')
    await page.getByRole('button', { name: '发送问题', exact: true }).click()
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /超出了当前预置演示/)
    assert.equal(await page.locator('.bubble.assistant').last().locator('.citation-link').count(), 0)
    await page.getByLabel('输入项目问题').fill('为什么使用混合检索')
    await page.getByRole('button', { name: '发送问题', exact: true }).click()
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /RRF/)
    await page.getByLabel('输入项目问题').fill('Qdrant 宕机了怎么办')
    await page.getByRole('button', { name: '发送问题', exact: true }).click()
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /返回关键词结果/)
    await page.getByRole('button', { name: '清空对话' }).click()
    assert.equal(await page.locator('.bubble').count(), 0)
    await page.locator('.question-list button').nth(5).click()
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /24 字符/)
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('.bubble').count(), 0)
    const shots = []
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}px`)
      const screenshot = path.join(os.tmpdir(), `interview-copilot-${prefix ? 'subpath' : 'root'}-${width}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
      shots.push(screenshot)
    }
    for (const file of ['evidence/architecture.svg', 'evidence/project-notes.md']) {
      const response = await page.request.get(`${url}${file}`)
      assert.equal(response.status(), 200)
    }
    // Every script/stylesheet must carry the configured project-site prefix.
    if (prefix) assert.equal(await page.locator('script[src],link[rel="stylesheet"]').evaluateAll((elements, value) => elements.every(element => new URL(element.src || element.href).pathname.startsWith(`${value}/`)), prefix), true)
    assert.deepEqual(apiRequests, [])
    assert.deepEqual(externalRequests, [])
    assert.deepEqual(failedResponses, [])
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ result: 'PASS', basePath: prefix || '/', presetQuestions: 10, checks: ['citations', 'dialog close and Escape', 'focus restoration', 'unknown question', 'keyword input', 'clear', 'reload', 'architecture', 'public notes', 'responsive 1440/390/320', 'no API or external requests', 'no resource or JavaScript errors'], screenshots: shots }, null, 2))
  } finally {
    if (browser) await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
