import {http, HttpResponse} from 'msw'

const storageKey = 'shopro-admin-demo'

const now = () => new Date().toLocaleString('zh-CN')

const createSeed = () => ({
    users: Array.from({length: 120}, (_, index) => ({
        id: `u${index + 1}`,
        name: `${['陈', '林', '王', '李'][index % 4]}${['晨', '若', '明', '悦'][index % 4]}${index + 1}`,
        email: `user${index + 1}@shopro.ai`,
        type: index % 5 ? '普通用户' : '企业用户',
        credits: 300 + index * 17,
        status: index % 11 ? 'active' : 'disabled',
        createdAt: '2026-08-18',
    })),
    jobs: Array.from({length: 90}, (_, index) => ({
        id: `j${index + 1}`,
        name: `${['夏日护肤', '智能咖啡机', '运动耳机'][index % 3]} AI ${['视频', '脚本', '配音'][index % 3]}生成`,
        type: ['视频', '脚本', '配音'][index % 3],
        status: index === 0 ? 'failed' : ['success', 'running', 'pending', 'cancelled'][index % 4],
        progress: index === 0 ? 62 : index % 4 === 1 ? 100 : 45,
        createdAt: '2026-08-20',
        error: index === 0 ? '模型服务响应超时，请检查输入素材后重试。' : undefined,
    })),
    contents: Array.from({length: 50}, (_, index) => ({
        id: `c${index + 1}`,
        title: `${['便携榨汁杯', '氨基酸洁面', '露营灯'][index % 3]}推广作品 ${index + 1}`,
        type: ['商品', '脚本', '作品'][index % 3],
        status: ['pending', 'approved', 'rejected', 'offline'][index % 4],
        author: `创作者 ${index + 1}`,
        updatedAt: '2026-08-20',
    })),
    orders: Array.from({length: 80}, (_, index) => ({
        id: `O202608${String(index + 1).padStart(4, '0')}`,
        user: `用户 ${index + 1}`,
        plan: ['体验套餐', '专业套餐', '企业套餐'][index % 3],
        amount: [99, 299, 999][index % 3],
        status: ['paid', 'unpaid', 'refunding', 'refunded'][index % 4],
        createdAt: '2026-08-20',
    })),
    logs: Array.from({length: 100}, (_, index) => ({
        id: `l${index}`,
        action: '演示数据初始化',
        operator: '系统管理员',
        createdAt: now(),
    })),
})

type DemoData = ReturnType<typeof createSeed>

const db = (): DemoData => JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(createSeed()))
const save = (data: DemoData) => localStorage.setItem(storageKey, JSON.stringify(data))
const ok = <T>(data: T) => HttpResponse.json({code: 0, message: 'success', data})

const page = (items: any[], url: URL) => {
    const keyword = url.searchParams.get('keyword') || ''
    const status = url.searchParams.get('status') || ''
    const filtered = items.filter((item) =>
        (!keyword || JSON.stringify(item).includes(keyword)) && (!status || item.status === status),
    )
    const currentPage = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    return {
        items: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        total: filtered.length,
        page: currentPage,
        pageSize,
    }
}

const audit = (data: DemoData, action: string) => {
    data.logs.unshift({
        id: crypto.randomUUID(),
        action,
        operator: 'admin@shopro.ai',
        createdAt: now(),
    })
}

export const handlers = [
    http.post('/api/admin/auth/login', () => ok({
        name: 'Shopro 管理员',
        email: 'admin@shopro.ai',
        role: 'SUPER_ADMIN',
    })),

    http.get('/api/admin/dashboard', () => {
        const data = db()
        return ok({
            kpis: [
                {label: '注册用户', value: data.users.length, trend: '+12.6%'},
                {label: '今日营收', value: '¥18,920', trend: '+8.2%'},
                {label: '生成任务', value: data.jobs.length, trend: '+16.4%'},
                {
                    label: '待审核内容',
                    value: data.contents.filter((item) => item.status === 'pending').length,
                    trend: '需及时处理'
                },
            ],
            trend: [112, 145, 131, 178, 202, 187, 236],
            distribution: [
                {name: '成功', value: data.jobs.filter((item) => item.status === 'success').length},
                {name: '进行中', value: data.jobs.filter((item) => item.status === 'running').length},
                {name: '失败', value: data.jobs.filter((item) => item.status === 'failed').length},
            ],
            pending: data.contents.filter((item) => item.status === 'pending').slice(0, 5),
        })
    }),

    http.get('/api/admin/users', ({request}) => ok(page(db().users, new URL(request.url)))),
    http.patch('/api/admin/users/:id/status', async ({params, request}) => {
        const data = db()
        const user = data.users.find((item) => item.id === params.id)!
        user.status = (await request.json() as { status: string }).status
        audit(data, `调整用户 ${user.name} 账号状态`)
        save(data)
        return ok(user)
    }),
    http.post('/api/admin/users/:id/credits', async ({params, request}) => {
        const data = db()
        const user = data.users.find((item) => item.id === params.id)!
        user.credits += (await request.json() as { amount: number }).amount
        audit(data, `调整用户 ${user.name} 积分`)
        save(data)
        return ok(user)
    }),

    http.get('/api/admin/jobs', ({request}) => ok(page(db().jobs, new URL(request.url)))),
    http.post('/api/admin/jobs/:id/retry', ({params}) => {
        const data = db()
        const job = data.jobs.find((item) => item.id === params.id)!
        job.status = 'running'
        job.progress = 15
        audit(data, `重试任务 ${job.name}`)
        save(data)

        window.setTimeout(() => {
            const nextData = db()
            const retryJob = nextData.jobs.find((item) => item.id === params.id)!
            retryJob.status = 'success'
            retryJob.progress = 100
            audit(nextData, `任务 ${retryJob.name} 重试成功`)
            save(nextData)
        }, 3000)

        return ok(job)
    }),
    http.post('/api/admin/jobs/:id/cancel', ({params}) => {
        const data = db()
        const job = data.jobs.find((item) => item.id === params.id)!
        job.status = 'cancelled'
        audit(data, `取消任务 ${job.name}`)
        save(data)
        return ok(job)
    }),

    http.get('/api/admin/contents', ({request}) => ok(page(db().contents, new URL(request.url)))),
    http.patch('/api/admin/contents/:id/review', async ({params, request}) => {
        const data = db()
        const content = data.contents.find((item) => item.id === params.id)!
        content.status = (await request.json() as { status: string }).status
        audit(data, `审核内容 ${content.title}`)
        save(data)
        return ok(content)
    }),

    http.get('/api/admin/orders', ({request}) => ok(page(db().orders, new URL(request.url)))),
    http.get('/api/admin/system/health', () => ok([
        {name: 'API 网关', status: 'healthy', latency: '18ms'},
        {name: '视频生成服务', status: 'healthy', latency: '142ms'},
        {name: '模型队列', status: 'warning', latency: '286ms'},
    ])),
    http.get('/api/admin/audit-logs', () => ok(db().logs)),
    http.post('/api/admin/demo/reset', () => {
        localStorage.removeItem(storageKey)
        return ok(true)
    }),
]
