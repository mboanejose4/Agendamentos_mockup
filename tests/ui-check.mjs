import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'pt-PT' })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const report = { pages: [], errors, images: [] }
await mkdir('previews/qa', { recursive: true })
try {
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('heading', { name: 'O que vamos marcar hoje?' }).waitFor({ timeout: 60000 })
  await page.waitForFunction(() => [...document.querySelectorAll('.business-photo img')].every(img => img.complete), { timeout: 15000 }).catch(() => {})
  const foundation = await page.evaluate(() => ({
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    margin: getComputedStyle(document.body).margin,
    sheets: document.styleSheets.length,
  }))
  assert.equal(foundation.primary, '#376f57')
  assert.equal(foundation.margin, '0px')
  assert(foundation.sheets > 0)
  report.foundation = foundation
  report.images = await page.locator('.business-photo img').evaluateAll(images => images.map(image => ({src:image.src,loaded:image.complete&&image.naturalWidth>0})))
  await page.screenshot({ path: 'previews/qa/explore-desktop.png', fullPage: true })
  const roles = {
    guest: ['explore', 'business', 'favorites', 'auth'],
    client: ['appointments', 'notifications', 'profile'],
    professional: ['professional-agenda', 'professional-services', 'professional-schedule', 'professional-history'],
    manager: ['overview', 'agenda', 'services', 'team', 'resources', 'schedule', 'clients', 'payments', 'reports', 'promotions', 'settings', 'support'],
    platform: ['platform-overview', 'companies', 'users', 'monitoring', 'support', 'platform-settings'],
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width===1440 ? 1000 : 844 })
    for (const [role, views] of Object.entries(roles)) {
      for (const view of views) {
        await page.evaluate(async ({role,view}) => {
          const { state, switchRole, go } = await import('/src/core/state.js')
          switchRole(role)
          state.selectedBusinessId='b1'
          go(view)
        }, { role, view })
        await page.waitForTimeout(80)
        const result = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          heading: document.querySelector('main h1')?.textContent,
          width: document.documentElement.scrollWidth,
          buttons: [...document.querySelectorAll('main .btn')].filter(el=>getComputedStyle(el).display!=='inline-flex').length,
        }))
        report.pages.push({role,view,viewport:width,...result})
        if (width !== 320 && ['overview','professional-agenda','platform-overview','appointments','explore'].includes(view)) {
          await page.screenshot({path:`previews/qa/${role}-${width}.png`,fullPage:true})
        }
      }
    }
  }
  assert.equal(errors.length, 0, errors.join('\n'))
  const overflow=report.pages.filter(p=>p.overflow)
  report.overflow=overflow
  await writeFile('previews/qa/report.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify({checked:report.pages.length,foundation,images:report.images,overflow,err