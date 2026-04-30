export type AuthRole = "student" | "teacher" | "school_admin" | "admin" | "guest"

type TokenPayload = {
  sub: string
  role: AuthRole
  exp: number
}

function getSecret() {
  return process.env.AUTH_SECRET || "smartlab-dev-secret-change-in-production"
}

function bytesToBase64(bytes: Uint8Array) {
  const g = globalThis as any
  if (typeof g.Buffer !== "undefined") {
    return g.Buffer.from(bytes).toString("base64")
  }
  let bin = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function base64ToBytes(base64: string) {
  const g = globalThis as any
  if (typeof g.Buffer !== "undefined") {
    return new Uint8Array(g.Buffer.from(base64, "base64"))
  }
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function base64UrlFromBytes(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function bytesFromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return base64ToBytes(padded)
}

function rotr(x: number, n: number) {
  return (x >>> n) | (x << (32 - n))
}

function sha256Bytes(msg: Uint8Array) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  const l = msg.length
  const bitLenHi = Math.floor((l * 8) / 0x100000000)
  const bitLenLo = (l * 8) >>> 0
  const padLen = ((56 - ((l + 1) % 64)) + 64) % 64
  const padded = new Uint8Array(l + 1 + padLen + 8)
  padded.set(msg, 0)
  padded[l] = 0x80
  const dv = new DataView(padded.buffer)
  dv.setUint32(padded.length - 8, bitLenHi)
  dv.setUint32(padded.length - 4, bitLenLo)

  const w = new Uint32Array(64)
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = dv.getUint32(i + t * 4)
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3)
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10)
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  const out = new Uint8Array(32)
  const odv = new DataView(out.buffer)
  odv.setUint32(0, h0)
  odv.setUint32(4, h1)
  odv.setUint32(8, h2)
  odv.setUint32(12, h3)
  odv.setUint32(16, h4)
  odv.setUint32(20, h5)
  odv.setUint32(24, h6)
  odv.setUint32(28, h7)
  return out
}

function hmacSha256(key: Uint8Array, msg: Uint8Array) {
  const blockSize = 64
  let k = key
  if (k.length > blockSize) k = sha256Bytes(k)
  if (k.length < blockSize) {
    const tmp = new Uint8Array(blockSize)
    tmp.set(k)
    k = tmp
  }

  const oKeyPad = new Uint8Array(blockSize)
  const iKeyPad = new Uint8Array(blockSize)
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = k[i] ^ 0x5c
    iKeyPad[i] = k[i] ^ 0x36
  }

  const inner = new Uint8Array(iKeyPad.length + msg.length)
  inner.set(iKeyPad)
  inner.set(msg, iKeyPad.length)
  const innerHash = sha256Bytes(inner)

  const outer = new Uint8Array(oKeyPad.length + innerHash.length)
  outer.set(oKeyPad)
  outer.set(innerHash, oKeyPad.length)
  return sha256Bytes(outer)
}

function base64UrlEncode(input: string) {
  const enc = new TextEncoder()
  return base64UrlFromBytes(enc.encode(input))
}

function base64UrlDecode(input: string) {
  const dec = new TextDecoder()
  return dec.decode(bytesFromBase64Url(input))
}

function sign(data: string) {
  const enc = new TextEncoder()
  const mac = hmacSha256(enc.encode(getSecret()), enc.encode(data))
  return base64UrlFromBytes(mac)
}

export function issueToken(userId: string, role: AuthRole, expiresInSec = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" }
  const payload: TokenPayload = {
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  }
  const h = base64UrlEncode(JSON.stringify(header))
  const p = base64UrlEncode(JSON.stringify(payload))
  const sig = sign(`${h}.${p}`)
  return `${h}.${p}.${sig}`
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [h, p, s] = token.split(".")
    if (!h || !p || !s) return null
    const expected = sign(`${h}.${p}`)
    if (expected !== s) return null
    const payload = JSON.parse(base64UrlDecode(p)) as TokenPayload
    if (!payload?.sub || !payload?.role || !payload?.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}