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
    const url = process.env.TEST_SITE_URL || `http://127.0.0.1:${server.address().port}${prefix}/`
    const apiRequests = [], externalRequests = [], failedResponses = [], errors = []
    page.on('request', request => {
      if (request.url().includes('/api/')) apiRequests.push(request.url())
      if (!request.url().startsWith(new URL(url).origin)) externalRequests.push(request.url())
    })
    page.on('response', response => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`) })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: '从一个工程问题开始。' }).waitFor()
    assert.equal(await page.getByLabel('输入项目问题').isDisabled(), true)
    assert.equal(await page.locator('.question-list button').count(), 0)
    for (const source of [
      { name: 'Query Pilot', count: 6, content: /SQL|Schema|DataTask/, citation: /Query Pilot/ },
      { name: '售后工单 Copilot', count: 6, content: /售后|审批|政策|订单/, citation: /电商售后工单智能处理系统/ },
    ]) {
      await page.getByRole('radio', { name: source.name }).check()
      assert.equal(await page.locator('.bubble').count(), 0)
      assert.equal(await page.locator('.question-list button').count(), source.count)
      for (let index = 0; index < source.count; index++) {
        await page.locator('.question-list button').nth(index).click()
        assert.match(await page.locator('.bubble.assistant').last().innerText(), source.content)
        assert.match(await page.locator('.bubble.assistant').last().locator('.citation-link').first().innerText(), source.citation)
      }
      await page.locator('.bubble.assistant').last().locator('.citation-link').first().click()
      await page.locator('dialog[open]').waitFor()
      assert.match(await page.locator('#evidence-title').innerText(), source.citation)
      assert.match(await page.locator('dialog a').getAttribute('href'), /github.com\/Amsit-rick\//)
      await page.keyboard.press('Escape')
      await page.getByLabel('输入项目问题').fill('SSE')
      await page.getByRole('button', { name: '发送问题', exact: true }).click()
      assert.match(await page.locator('.bubble.assistant').last().innerText(), /超出了/)
      assert.equal(await page.locator('.bubble.assistant').last().locator('.citation-link').count(), 0)
    }
    await page.getByRole('radio', { name: '作品集助手（本站）' }).check()
    assert.equal(await page.locator('.bubble').count(), 0)
    const projects = page.locator('#projects article')
    assert.equal(await projects.count(), 2)
    assert.match(await projects.nth(0).innerText(), /Query Pilot/)
    assert.match(await projects.nth(1).innerText(), /电商售后工单智能处理系统/)
    assert.equal(await projects.nth(0).locator('a').getAttribute('href'), 'https://github.com/Amsit-rick/QueryPilot')
    assert.equal(await projects.nth(1).locator('a').getAttribute('href'), 'https://github.com/Amsit-rick/product-insight-copilot')
    for (let index = 0; index < 2; index++) {
      await projects.nth(index).locator('summary').click()
      assert.equal(await projects.nth(index).locator('.project-flow').isVisible(), true)
    }
    assert.equal(await page.locator('.question-list button').count(), 10)
    assert.equal(await page.locator('#architecture, a[href="#architecture"]').count(), 0)
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
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /超出了.*当前预置演示/)
    assert.equal(await page.locator('.bubble.assistant').last().locator('.citation-link').count(), 0)
    await page.getByLabel('输入项目问题').fill('为什么使用混合检索')
    await page.getByRole('button', { name: '发送问题', exact: true }).click()
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /RRF/)
    await page.getByLabel('输入项目问题').fill('SSE')
    await page.getByLabel('输入项目问题').press('Shift+Enter')
    assert.equal(await page.getByLabel('输入项目问题').inputValue(), 'SSE\n')
    const beforeKeyboardSend = await page.locator('.bubble.assistant').count()
    await page.getByLabel('输入项目问题').press('Enter')
    assert.equal(await page.locator('.bubble.assistant').count(), beforeKeyboardSend + 1)
    assert.match(await page.locator('.bubble.assistant').last().innerText(), /24 字符/)
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
    assert.equal(await page.getByLabel('输入项目问题').isDisabled(), true)
    await page.getByRole('radio', { name: '作品集助手（本站）' }).check()
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      if (width < 761) {
        const menu = page.getByRole('button', { name: '展开导航', exact: true })
        await menu.click()
        await page.keyboard.press('Escape')
        assert.equal(await menu.getAttribute('aria-expanded'), 'false')
        assert.equal(await menu.evaluate(element => element === document.activeElement), true)
        await menu.click()
        await page.locator('#site-navigation').getByRole('link', { name: '交互演示' }).click()
        assert.equal(await menu.getAttribute('aria-expanded'), 'false')
        await page.locator('.question-list button').nth(2).click()
        assert.match(await page.locator('.bubble.assistant').last().innerText(), /RRF/)
        await page.getByRole('button', { name: '清空对话' }).click()
      }
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
    console.log(JSON.stringify({ result: 'PASS', basePath: prefix || '/', presetQuestions: 22, checks: ['explicit project selection', 'all 22 scoped questions', 'project-specific citations and source links', 'source switching clears conversation', 'no cross-project fallback', 'two featured projects and source links', 'expand project details', 'citations', 'dialog close and Escape', 'focus restoration', 'unknown question', 'keyword input', 'Enter send and Shift+Enter newline', 'clear', 'reload', 'homepage architecture removed', 'public notes', 'responsive 1440/390/320', 'mobile navigation selection, Escape and focus', 'mobile preset questions', 'no API or external requests', 'no resource or JavaScript errors'], screenshots: shots }, null, 2))
  } finally {
    if (browser) await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
