// Lokaler Full-Stack-Testserver: liefert dist/ + /api/party/* über die
// ECHTE Kernlogik (_core.js) mit In-Memory-Store. Dient dem Zwei-Geräte-
// E2E-Test (kein Upstash nötig). NICHT für Produktion.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMemStore } from './mem-store.mjs'
import {
  createRoom,
  getState,
  addPlayer,
  removePlayer,
  updateSettings,
  spin,
  nextTurn,
} from '../api/party/_core.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const PORT = Number(process.argv[2]) || 4330
const store = createMemStore()

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
}

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(obj))
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
  })
}

async function handleParty(req, res, pathname, query) {
  try {
    if (pathname === '/api/party/health') return json(res, 200, { ok: true, enabled: true })
    if (pathname === '/api/party/state') {
      const state = await getState(store, String(query.get('code') || '').toUpperCase())
      return json(res, 200, { ok: true, state })
    }
    const body = await readJson(req)
    const code = String(body.code || '').toUpperCase()
    if (pathname === '/api/party/create') {
      const result = await createRoom(store, body)
      return json(res, 200, { ok: true, ...result })
    }
    if (pathname === '/api/party/join') {
      return json(res, 200, { ok: true, state: await getState(store, code) })
    }
    if (pathname === '/api/party/players') {
      const state =
        body.action === 'remove'
          ? await removePlayer(store, { ...body, code })
          : await addPlayer(store, { ...body, code })
      return json(res, 200, { ok: true, state })
    }
    if (pathname === '/api/party/settings') {
      return json(res, 200, { ok: true, state: await updateSettings(store, { ...body, code }) })
    }
    if (pathname === '/api/party/spin') {
      return json(res, 200, { ok: true, state: await spin(store, { ...body, code }) })
    }
    if (pathname === '/api/party/next') {
      return json(res, 200, { ok: true, state: await nextTurn(store, { ...body, code }) })
    }
    return json(res, 404, { ok: false, error: 'not_found' })
  } catch (err) {
    json(res, err.status || 500, { ok: false, error: err.code || 'server_error' })
  }
}

async function serveStatic(res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname
  const safe = normalize(rel).replace(/^(\.\.[/\\])+/, '')
  let file = join(DIST, safe)
  try {
    let body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    // SPA-Fallback
    try {
      const html = await readFile(join(DIST, 'index.html'))
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const p = url.pathname
    if (p.startsWith('/api/party/')) return handleParty(req, res, p, url.searchParams)
    if (p === '/api/cover') return json(res, 200, { ok: true, cover: null })
    if (p.startsWith('/api/')) return json(res, 200, { ok: false })
    return serveStatic(res, p)
  })
  .listen(PORT, () => console.log(`party-dev-server on http://localhost:${PORT}`))
