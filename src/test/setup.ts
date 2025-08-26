import { vi } from 'vitest'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3000',
  },
}))

// Mock window.fetch for tests that might use it
global.fetch = vi.fn()

// Mock FormData for file upload tests
global.FormData = class FormData {
  private data: Map<string, any> = new Map()

  append(key: string, value: any) {
    this.data.set(key, value)
  }

  get(key: string) {
    return this.data.get(key)
  }

  has(key: string) {
    return this.data.has(key)
  }

  delete(key: string) {
    this.data.delete(key)
  }

  getAll(key: string) {
    return this.data.has(key) ? [this.data.get(key)] : []
  }

  set(key: string, value: any) {
    this.data.set(key, value)
  }

  forEach(callback: (value: any, key: string, parent: FormData) => void) {
    this.data.forEach((value, key) => callback(value, key, this))
  }

  keys() {
    return this.data.keys()
  }

  values() {
    return this.data.values()
  }

  entries() {
    return this.data.entries()
  }

  [Symbol.iterator]() {
    return this.data.entries()
  }
} as any

// Mock File for file upload tests
global.File = class File {
  name: string
  type: string
  size: number
  lastModified: number
  webkitRelativePath: string

  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename
    this.type = options.type || ''
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    this.lastModified = options.lastModified || Date.now()
    this.webkitRelativePath = ''
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.size))
  }

  bytes(): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(this.size))
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob([], { type: contentType })
  }

  stream(): ReadableStream {
    return new ReadableStream()
  }

  text(): Promise<string> {
    return Promise.resolve('')
  }
} as any
