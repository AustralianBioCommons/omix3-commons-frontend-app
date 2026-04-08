import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const BASE_DIR = '/gen3/debug-artifacts/jupyterlite'

function getContentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (filePath.endsWith('.wasm')) return 'application/wasm'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8'
  if (filePath.endsWith('.map')) return 'application/json; charset=utf-8'
  return 'application/octet-stream'
}

function resolveRequestedPath(parts: string[] | undefined): string {
  if (!parts || parts.length === 0) {
    return 'index.html'
  }
  return parts.join('/')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rawPath = resolveRequestedPath(req.query.path as string[] | undefined)
    const normalizedPath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = path.join(BASE_DIR, normalizedPath)

    if (!filePath.startsWith(BASE_DIR)) {
      res.status(403).send('Forbidden')
      return
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).send('Not found')
      return
    }

    const stat = fs.statSync(filePath)
    const contentType = getContentType(filePath)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stat.size)
    res.setHeader('Cache-Control', 'no-store')

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (error) {
    console.error('Error serving JupyterLite file:', error)
    res.status(500).send('Internal server error')
  }
}
