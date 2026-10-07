#!/usr/bin/env node
/**
 * Local BookChat API used when the companion BookStack server is not running.
 * It speaks the same /bookchat/api/v1 routes the uni-app client already calls.
 */
const http = require('http')
const { URL } = require('url')
const querystring = require('querystring')

const PORT = Number(process.env.BOOKCHAT_API_PORT || 8181)
const HOST = '0.0.0.0'

const categories = [
  { id: 1, pid: 0, title: '编程', cnt: 2, status: 1 },
  { id: 11, pid: 1, title: 'JavaScript', cnt: 1, status: 1 },
  { id: 12, pid: 1, title: 'Python', cnt: 1, status: 1 },
  { id: 2, pid: 0, title: '效率', cnt: 1, status: 1 },
  { id: 21, pid: 2, title: '笔记', cnt: 1, status: 1 }
]

function rich(html) {
  return [{ type: 'richtext', data: html }]
}

const books = [
  {
    book_id: 1,
    slug: 'bookchat',
    cid: 11,
    parent_cid: 1,
    book_name: 'BookChat 开发指南',
    cover: '/static/images/book.png',
    view: 1280,
    vcnt: 1280,
    cnt_doc: 2,
    doc_count: 2,
    cnt_readed: 0,
    created_at: '2026-08-01T08:00:00',
    updated_at: '2026-09-12T08:00:00',
    modify_time: '2026-09-12T08:00:00',
    description: '用 uni-app 把电子书阅读端跑在浏览器里：首页、目录、阅读和登录。',
    score: 46,
    lang: 'zh',
    uid: 1,
    user: 'BookChat',
    star: 12,
    tags: 'uni-app,阅读',
    author: 'BookChat',
    author_url: 'https://www.bookstack.cn',
    is_star: false
  },
  {
    book_id: 2,
    slug: 'python-notes',
    cid: 12,
    parent_cid: 1,
    book_name: 'Python 速记',
    cover: '/static/images/logo.png',
    view: 860,
    vcnt: 860,
    cnt_doc: 2,
    doc_count: 2,
    cnt_readed: 1,
    created_at: '2026-07-18T08:00:00',
    updated_at: '2026-09-02T08:00:00',
    modify_time: '2026-09-02T08:00:00',
    description: '列表、函数和模块的短章节，用来验证分类和搜索。',
    score: 40,
    lang: 'zh',
    uid: 1,
    user: 'BookChat',
    star: 4,
    tags: 'python,入门',
    author: 'BookChat',
    author_url: 'https://www.bookstack.cn',
    is_star: false
  },
  {
    book_id: 3,
    slug: 'help',
    cid: 21,
    parent_cid: 2,
    book_name: '关于 BookChat',
    cover: '/static/images/about-us.png',
    view: 320,
    vcnt: 320,
    cnt_doc: 1,
    doc_count: 1,
    cnt_readed: 0,
    created_at: '2026-06-01T08:00:00',
    updated_at: '2026-06-01T08:00:00',
    modify_time: '2026-06-01T08:00:00',
    description: '本地开发环境说明，以及「我的」页里的关于我们。',
    score: 50,
    lang: 'zh',
    uid: 1,
    user: 'BookChat',
    star: 1,
    tags: '关于',
    author: 'BookChat',
    author_url: 'https://www.bookstack.cn',
    is_star: false
  }
]

const chapters = {
  1: [
    { id: 101, pid: 0, book_id: 1, title: '欢迎', slug: 'welcome' },
    { id: 102, pid: 101, book_id: 1, title: '阅读下一章', slug: 'next' }
  ],
  2: [
    { id: 201, pid: 0, book_id: 2, title: '列表', slug: 'lists' },
    { id: 202, pid: 0, book_id: 2, title: '函数', slug: 'functions' }
  ],
  3: [
    { id: 'about', pid: 0, book_id: 3, title: '关于我们', slug: 'about' }
  ]
}

const articles = {
  '1/101': {
    id: 101,
    title: '欢迎',
    content: rich('<h2>欢迎来到 BookChat</h2><p>这是本地开发接口返回的第一章。首页、目录和本章都来自同一套示例数据。</p><p>点底部「下一章」可以继续阅读。</p>')
  },
  '1/102': {
    id: 102,
    title: '阅读下一章',
    content: rich('<h2>第二章</h2><p>如果你能看到这段文字，说明 H5 阅读页已经从开发接口取到了章节正文。</p>')
  },
  '2/201': {
    id: 201,
    title: '列表',
    content: rich('<p>Python 列表用方括号表示，可以按下标读取元素。</p>')
  },
  '2/202': {
    id: 202,
    title: '函数',
    content: rich('<p>用 def 定义函数，用 return 返回结果。</p>')
  },
  '3/about': {
    id: 'about',
    title: '关于我们',
    content: rich('<p>BookChat 是 BookStack 的 uni-app 阅读端。当前页面由本地开发环境提供，方便在没有正式后端时完成阅读、搜索和登录。</p>')
  }
}

const comments = {
  1: [
    {
      uid: 1,
      avatar: '/static/images/logo.png',
      nickname: '读者',
      score: 50,
      created_at: '2026-09-20T08:00:00',
      content: '首页和阅读页都能打开。'
    }
  ]
}

const users = [
  {
    uid: 1,
    username: 'reader',
    email: 'reader@example.com',
    password: 'reader123',
    nickname: '读者',
    token: 'dev-token-reader',
    avatar: '/static/images/logo.png',
    intro: '本地开发账号',
    created_at: Math.floor(Date.now() / 1000) - 86400 * 12,
    signed_at: 0,
    today_reading: 1800,
    month_reading: 7200,
    total_reading: 36000,
    total_sign: 3,
    total_continuous_sign: 2,
    history_continuous_sign: 2
  }
]

const stars = { 1: new Set() }
let nextUid = 2

function publicUser(user) {
  return {
    uid: user.uid,
    nickname: user.nickname,
    token: user.token,
    avatar: user.avatar,
    intro: user.intro || ''
  }
}

function findUserByToken(token) {
  if (!token) return null
  return users.find((user) => user.token === token) || null
}

function findBook(identify) {
  const key = String(identify || '').split('/')[0]
  return books.find((book) => String(book.book_id) === key || book.slug === key) || null
}

function bookPayload(book, user) {
  const starred = user ? stars[user.uid] && stars[user.uid].has(book.book_id) : false
  return { ...book, is_star: starred }
}

function chapterList(book) {
  return chapters[book.book_id] || []
}

function articleFor(book, identify) {
  const parts = String(identify || '').split('/')
  const docKey = parts.length > 1 ? parts.slice(1).join('/') : ''
  const list = chapterList(book)
  let chapter = list.find((item) => String(item.id) === docKey || item.slug === docKey)
  if (!chapter) chapter = list[0]
  if (!chapter) return null
  const stored = articles[`${book.book_id}/${chapter.id}`] || articles[`${book.book_id}/${chapter.slug}`]
  return stored || { id: chapter.id, title: chapter.title, content: rich('<p>暂无正文</p>') }
}

function paginate(rows, page, size) {
  const p = Math.max(Number(page) || 1, 1)
  const s = Math.max(Number(size) || 10, 1)
  const start = (p - 1) * s
  return rows.slice(start, start + s)
}

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-version',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store'
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      const type = String(req.headers['content-type'] || '')
      if (!raw) return resolve({})
      if (type.includes('application/json')) {
        try {
          resolve(JSON.parse(raw))
        } catch (error) {
          reject(error)
        }
        return
      }
      resolve(querystring.parse(raw))
    })
    req.on('error', reject)
  })
}

function routePath(pathname) {
  const prefix = '/bookchat'
  if (pathname === prefix || pathname.startsWith(prefix + '/')) {
    return pathname.slice(prefix.length) || '/'
  }
  return pathname
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, {})
    return
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  const pathname = routePath(url.pathname)
  const query = Object.fromEntries(url.searchParams.entries())
  const body = req.method === 'POST' ? await readBody(req) : {}
  const params = { ...query, ...body }
  const user = findUserByToken(req.headers.authorization)

  if (pathname === '/health') {
    send(res, 200, { ok: true })
    return
  }

  if (pathname === '/api/v1/banners') {
    send(res, 200, {
      data: {
        size: 2.619,
        banners: [
          { id: 1, image: '/static/images/bg-poster.jpg', link: '/pages/intro/intro?id=1' },
          { id: 2, image: '/static/images/book.png', link: '/pages/intro/intro?id=2' }
        ]
      }
    })
    return
  }

  if (pathname === '/api/v1/book/categories') {
    send(res, 200, { data: { categories } })
    return
  }

  if (pathname === '/api/v1/book/lists') {
    const cid = params.cid
    let rows = books.slice()
    if (cid) {
      rows = rows.filter((book) => String(book.cid) === String(cid) || String(book.parent_cid) === String(cid))
    }
    if (params.sort === 'latest-recommend') {
      rows = books.slice()
    }
    send(res, 200, { data: { books: paginate(rows.map((book) => bookPayload(book, user)), params.page, params.size) } })
    return
  }

  if (pathname === '/api/v1/book/lists-by-cids') {
    const cids = String(params.cids || '').split(',').filter(Boolean)
    const grouped = {}
    for (const cid of cids) {
      grouped[cid] = books
        .filter((book) => String(book.parent_cid) === String(cid) || String(book.cid) === String(cid))
        .slice(0, Number(params.size) || 5)
        .map((book) => bookPayload(book, user))
    }
    send(res, 200, { data: { books: grouped } })
    return
  }

  if (pathname === '/api/v1/book/info' || pathname === '/api/v1/book/related') {
    const book = findBook(params.identify)
    if (!book) {
      send(res, 404, { message: '书籍不存在' })
      return
    }
    if (pathname.endsWith('/related')) {
      const related = books.filter((item) => item.book_id !== book.book_id).map((item) => bookPayload(item, user))
      send(res, 200, { data: { books: related } })
      return
    }
    send(res, 200, { data: { book: bookPayload(book, user) } })
    return
  }

  if (pathname === '/api/v1/book/menu') {
    const book = findBook(params.identify)
    if (!book) {
      send(res, 404, { message: '书籍不存在' })
      return
    }
    send(res, 200, { data: { menu: chapterList(book), latest_read_id: 0 } })
    return
  }

  if (pathname === '/api/v1/book/read') {
    const book = findBook(params.identify)
    if (!book) {
      send(res, 404, { message: '章节不存在' })
      return
    }
    const article = articleFor(book, params.identify)
    send(res, 200, { data: { article } })
    return
  }

  if (pathname === '/api/v1/book/comment') {
    const book = findBook(params.identify)
    const rows = book ? (comments[book.book_id] || []) : []
    send(res, 200, { data: { comments: rows, my_score: 0 } })
    return
  }

  if (pathname === '/api/v1/book/star') {
    if (!user) {
      send(res, 401, { message: '请先登录' })
      return
    }
    const book = findBook(params.identify)
    if (!book) {
      send(res, 404, { message: '书籍不存在' })
      return
    }
    if (!stars[user.uid]) stars[user.uid] = new Set()
    const set = stars[user.uid]
    let isCancel = false
    if (set.has(book.book_id)) {
      set.delete(book.book_id)
      isCancel = true
    } else {
      set.add(book.book_id)
    }
    send(res, 200, { data: { data: { is_cancel: isCancel } } })
    return
  }

  if (pathname === '/api/v1/book/bookmark') {
    send(res, 200, { data: { bookmarks: [] } })
    return
  }

  if (pathname === '/api/v1/book/history') {
    const rows = books.map((book) => bookPayload(book, user))
    send(res, 200, { data: { books: paginate(rows, params.page, params.size) } })
    return
  }

  if (pathname === '/api/v1/search/book' || pathname === '/api/v1/search/doc') {
    const wd = String(params.wd || '').trim().toLowerCase()
    if (pathname.endsWith('/doc')) {
      const docs = []
      for (const book of books) {
        for (const chapter of chapterList(book)) {
          const article = articles[`${book.book_id}/${chapter.id}`] || { title: chapter.title, content: [] }
          const text = `${chapter.title} ${book.book_name}`
          if (!wd || text.toLowerCase().includes(wd)) {
            docs.push({
              book_id: book.book_id,
              identify: chapter.id,
              title: chapter.title,
              vcnt: book.view,
              created_at: book.created_at,
              book_name: book.book_name,
              content: chapter.title
            })
          }
        }
      }
      send(res, 200, { data: { result: paginate(docs, params.page, params.size) } })
      return
    }
    const rows = books.filter((book) => {
      const haystack = `${book.book_name} ${book.description} ${book.tags}`.toLowerCase()
      return !wd || haystack.includes(wd)
    }).map((book) => bookPayload(book, user))
    send(res, 200, { data: { result: paginate(rows, params.page, params.size) } })
    return
  }

  if (pathname === '/api/v1/login') {
    const account = String(params.username || '')
    const found = users.find((item) => (item.username === account || item.email === account) && item.password === params.password)
    if (!found) {
      send(res, 400, { message: '账号或密码不正确' })
      return
    }
    send(res, 200, { data: { user: publicUser(found) } })
    return
  }

  if (pathname === '/api/v1/register') {
    if (users.some((item) => item.username === params.username || item.email === params.email)) {
      send(res, 400, { message: '用户名或邮箱已存在' })
      return
    }
    const created = {
      uid: nextUid++,
      username: params.username,
      email: params.email,
      password: params.password,
      nickname: params.nickname || params.username,
      token: `dev-token-${Date.now()}`,
      avatar: '/static/images/logo.png',
      intro: '新注册的本地用户',
      created_at: Math.floor(Date.now() / 1000),
      signed_at: 0,
      today_reading: 0,
      month_reading: 0,
      total_reading: 0,
      total_sign: 0,
      total_continuous_sign: 0,
      history_continuous_sign: 0
    }
    users.push(created)
    stars[created.uid] = new Set()
    send(res, 200, { data: { user: publicUser(created) } })
    return
  }

  if (pathname === '/api/v1/logout') {
    send(res, 200, { data: { ok: true } })
    return
  }

  if (pathname === '/api/v1/user/info') {
    if (!user) {
      send(res, 401, { message: '请先登录' })
      return
    }
    send(res, 200, { data: { user: publicUser(user) } })
    return
  }

  if (pathname === '/api/v1/user/more-info') {
    const target = users.find((item) => String(item.uid) === String(params.uid)) || user
    if (!target) {
      send(res, 404, { message: '用户不存在' })
      return
    }
    send(res, 200, {
      data: {
        info: {
          uid: target.uid,
          signed_at: target.signed_at,
          created_at: target.created_at,
          total_sign: target.total_sign,
          total_continuous_sign: target.total_continuous_sign,
          history_continuous_sign: target.history_continuous_sign,
          today_reading: target.today_reading,
          month_reading: target.month_reading,
          total_reading: target.total_reading
        }
      }
    })
    return
  }

  if (pathname === '/api/v1/user/sign') {
    if (!user) {
      send(res, 401, { message: '请先登录' })
      return
    }
    user.signed_at = Math.floor(Date.now() / 1000)
    user.total_sign += 1
    send(res, 200, { data: { signed_at: user.signed_at, message: '签到成功' } })
    return
  }

  if (pathname === '/api/v1/user/bookshelf') {
    if (!user) {
      send(res, 401, { message: '请先登录' })
      return
    }
    const set = stars[user.uid] || new Set()
    let rows = books.filter((book) => set.has(book.book_id)).map((book) => bookPayload(book, user))
    if (params.cid && String(params.cid) !== '0') {
      rows = rows.filter((book) => String(book.cid) === String(params.cid))
    }
    send(res, 200, {
      data: {
        books: paginate(rows, params.page, params.size),
        categories: categories.filter((item) => item.pid > 0)
      }
    })
    return
  }

  if (pathname === '/api/v1/user/release' || pathname === '/api/v1/user/follow' || pathname === '/api/v1/user/fans') {
    if (pathname.endsWith('/release')) {
      send(res, 200, { data: { books: [] } })
      return
    }
    send(res, 200, { data: { users: [] } })
    return
  }

  if (pathname === '/api/v1/rank') {
    send(res, 200, {
      data: {
        total_reading: [
          { member_id: 1, nickname: '读者', total_reading_time: 36000, avatar: '/static/images/logo.png' }
        ],
        continuous_sign: [],
        total_sign: [],
        star_books: books.slice(0, 1),
        vcnt_books: books.slice(0, 2),
        comment_books: [],
        all: [],
        today: [],
        week: [],
        last_week: [],
        month: [],
        last_month: [],
        history_continuous_sign: [],
        this_month_sign: [],
        last_month_sign: []
      }
    })
    return
  }

  if (pathname === '/api/v1/version') {
    send(res, 200, { data: { version: 170, url: '' } })
    return
  }

  send(res, 404, { message: `未实现的接口 ${pathname}` })
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    send(res, 500, { message: error.message || '服务器错误' })
  })
})

server.listen(PORT, HOST, () => {
  console.log(`BookChat dev API listening on http://${HOST}:${PORT}/bookchat`)
})
