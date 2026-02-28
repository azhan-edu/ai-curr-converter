/** @jest-environment node */

describe('GET /api/rates cache and refresh behavior', () => {
  const originalEnv = process.env
  const createSuccessResponse = () => ({
    ok: true,
    status: 200,
    json: async () => ({
      base: 'USD',
      date: '2026-02-28',
      rates: {
        EUR: 0.92,
        GBP: 0.8,
      },
    }),
  }) as Response

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    global.fetch = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('uses cache when TTL is greater than zero', async () => {
    process.env.RATES_CACHE_TTL_SECONDS = '3600'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(createSuccessResponse())

    const { GET } = await import('./route')

    await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)
    await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('bypasses cache when TTL is zero', async () => {
    process.env.RATES_CACHE_TTL_SECONDS = '0'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(createSuccessResponse())

    const { GET } = await import('./route')

    await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)
    await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('forces refresh when refresh=1 is passed', async () => {
    process.env.RATES_CACHE_TTL_SECONDS = '3600'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(createSuccessResponse())

    const { GET } = await import('./route')

    await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)
    await GET({ nextUrl: new URL('http://localhost/api/rates?refresh=1') } as never)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns fallback rates when external source fails', async () => {
    process.env.RATES_CACHE_TTL_SECONDS = '0'

    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockRejectedValue(new Error('network down'))

    const { GET } = await import('./route')
    const response = await GET({ nextUrl: new URL('http://localhost/api/rates') } as never)
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.isFallback).toBe(true)
    expect(body.rates).toBeDefined()
    expect(body.warning).toBe('Using cached fallback rates. Live rates are unavailable.')
  })
})
