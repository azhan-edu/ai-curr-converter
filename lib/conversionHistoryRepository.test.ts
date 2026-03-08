import {
  createConversionHistory,
  listConversionHistory,
  mapDbRecordToConversionHistory,
} from './conversionHistoryRepository'

const findManyMock = jest.fn()
const createMock = jest.fn()
const deleteManyMock = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversionHistory: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      create: (...args: unknown[]) => createMock(...args),
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
    },
  },
}))

describe('conversionHistoryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps prisma record fields to app conversion history shape', () => {
    const dbRecord = {
      id: 'abc123',
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 10,
      result: 9.2,
      rate: 0.92,
      timestamp: new Date('2026-03-08T12:00:00.000Z'),
    }

    const mapped = mapDbRecordToConversionHistory(dbRecord)

    expect(mapped).toEqual({
      id: 'abc123',
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9.2,
      rate: 0.92,
      timestamp: new Date('2026-03-08T12:00:00.000Z'),
    })
  })

  it('caps list limit to 100', async () => {
    findManyMock.mockResolvedValue([])

    await listConversionHistory(1000)

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { timestamp: 'desc' },
      take: 100,
    })
  })

  it('uses default list limit when given invalid values', async () => {
    findManyMock.mockResolvedValue([])

    await listConversionHistory(-5)

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { timestamp: 'desc' },
      take: 10,
    })
  })

  it('rejects invalid conversion input before writing to database', async () => {
    await expect(createConversionHistory({
      from: 'usd',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
    })).rejects.toThrow('Invalid conversion history input')

    expect(createMock).not.toHaveBeenCalled()
  })

  it('creates and maps valid conversion input', async () => {
    const row = {
      id: 'created-id',
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
      timestamp: new Date('2026-03-08T13:00:00.000Z'),
    }

    createMock.mockResolvedValue(row)

    const created = await createConversionHistory({
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
    })

    expect(createMock).toHaveBeenCalledWith({
      data: {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 10,
        result: 9,
        rate: 0.9,
      },
    })

    expect(created).toEqual({
      id: 'created-id',
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
      timestamp: new Date('2026-03-08T13:00:00.000Z'),
    })
  })
})