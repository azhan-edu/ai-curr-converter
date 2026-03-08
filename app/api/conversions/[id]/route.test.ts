/** @jest-environment node */

const getConversionHistoryByIdMock = jest.fn()
const updateConversionHistoryMock = jest.fn()
const deleteConversionHistoryByIdMock = jest.fn()

jest.mock('@/lib/conversionHistoryRepository', () => ({
  getConversionHistoryById: (...args: unknown[]) => getConversionHistoryByIdMock(...args),
  updateConversionHistory: (...args: unknown[]) => updateConversionHistoryMock(...args),
  deleteConversionHistoryById: (...args: unknown[]) => deleteConversionHistoryByIdMock(...args),
}))

describe('Conversion history item route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  })

  it('returns a conversion history entry by id', async () => {
    getConversionHistoryByIdMock.mockResolvedValue({
      id: 'entry-1',
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
      timestamp: new Date('2026-03-08T12:00:00.000Z'),
    })

    const { GET } = await import('./route')
    const response = await GET({} as never, createContext('entry-1'))
    const body = await response.json()

    expect(getConversionHistoryByIdMock).toHaveBeenCalledWith('entry-1')
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 404 when conversion history entry does not exist', async () => {
    getConversionHistoryByIdMock.mockResolvedValue(null)

    const { GET } = await import('./route')
    const response = await GET({} as never, createContext('missing-id'))
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('updates an entry by id', async () => {
    updateConversionHistoryMock.mockResolvedValue({
      id: 'entry-1',
      from: 'USD',
      to: 'GBP',
      amount: 10,
      result: 8,
      rate: 0.8,
      timestamp: new Date('2026-03-08T12:00:00.000Z'),
    })

    const { PUT } = await import('./route')
    const response = await PUT(
      {
        json: async () => ({
          from: 'USD',
          to: 'GBP',
          amount: 10,
          result: 8,
          rate: 0.8,
        }),
      } as never,
      createContext('entry-1')
    )
    const body = await response.json()

    expect(updateConversionHistoryMock).toHaveBeenCalledWith('entry-1', {
      from: 'USD',
      to: 'GBP',
      amount: 10,
      result: 8,
      rate: 0.8,
    })
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 400 for invalid update payload', async () => {
    const { PUT } = await import('./route')
    const response = await PUT(
      {
        json: async () => ({
          from: 'usd',
          to: 'GBP',
          amount: 10,
          result: 8,
          rate: 0.8,
        }),
      } as never,
      createContext('entry-1')
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(updateConversionHistoryMock).not.toHaveBeenCalled()
  })

  it('deletes an entry by id', async () => {
    deleteConversionHistoryByIdMock.mockResolvedValue(undefined)

    const { DELETE } = await import('./route')
    const response = await DELETE({} as never, createContext('entry-1'))
    const body = await response.json()

    expect(deleteConversionHistoryByIdMock).toHaveBeenCalledWith('entry-1')
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 404 when deleting missing entry', async () => {
    deleteConversionHistoryByIdMock.mockRejectedValue(new Error('Conversion history not found'))

    const { DELETE } = await import('./route')
    const response = await DELETE({} as never, createContext('missing-id'))
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })
})