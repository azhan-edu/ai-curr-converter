/** @jest-environment node */

const listConversionHistoryMock = jest.fn()
const createConversionHistoryMock = jest.fn()
const clearConversionHistoryMock = jest.fn()

jest.mock('@/lib/conversionHistoryRepository', () => ({
  listConversionHistory: (...args: unknown[]) => listConversionHistoryMock(...args),
  createConversionHistory: (...args: unknown[]) => createConversionHistoryMock(...args),
  clearConversionHistory: (...args: unknown[]) => clearConversionHistoryMock(...args),
}))

describe('Conversion history collection route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists conversion history with optional limit', async () => {
    listConversionHistoryMock.mockResolvedValue([
      {
        id: 'entry-1',
        from: 'USD',
        to: 'EUR',
        amount: 10,
        result: 9,
        rate: 0.9,
        timestamp: new Date('2026-03-08T12:00:00.000Z'),
      },
    ])

    const { GET } = await import('./route')
    const response = await GET({ nextUrl: new URL('http://localhost/api/conversions?limit=5') } as never)
    const body = await response.json()

    expect(listConversionHistoryMock).toHaveBeenCalledWith(5)
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
  })

  it('creates a conversion history entry', async () => {
    createConversionHistoryMock.mockResolvedValue({
      id: 'entry-2',
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
      timestamp: new Date('2026-03-08T12:30:00.000Z'),
    })

    const { POST } = await import('./route')
    const response = await POST({
      json: async () => ({
        from: 'USD',
        to: 'EUR',
        amount: 10,
        result: 9,
        rate: 0.9,
      }),
    } as never)
    const body = await response.json()

    expect(createConversionHistoryMock).toHaveBeenCalledWith({
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
    })
    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
  })

  it('rejects invalid create payloads', async () => {
    const { POST } = await import('./route')
    const response = await POST({
      json: async () => ({
        from: 'usd',
        to: 'EUR',
        amount: 10,
        result: 9,
        rate: 0.9,
      }),
    } as never)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(createConversionHistoryMock).not.toHaveBeenCalled()
  })

  it('clears conversion history', async () => {
    clearConversionHistoryMock.mockResolvedValue(undefined)

    const { DELETE } = await import('./route')
    const response = await DELETE()
    const body = await response.json()

    expect(clearConversionHistoryMock).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })
})