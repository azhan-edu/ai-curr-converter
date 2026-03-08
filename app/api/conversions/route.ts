import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  clearConversionHistory,
  createConversionHistory,
  listConversionHistory,
} from '@/lib/conversionHistoryRepository'

const createConversionSchema = z.object({
  from: z.string().regex(/^[A-Z]{3}$/),
  to: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().finite().gt(0),
  result: z.number().finite().gt(0),
  rate: z.number().finite().gt(0),
})

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit')
    const parsedLimit = limitParam ? Number(limitParam) : undefined

    const history = await listConversionHistory(parsedLimit)

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load conversion history',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedBody = createConversionSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid conversion payload',
        },
        { status: 400 }
      )
    }

    const created = await createConversionHistory(parsedBody.data)

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversion history entry',
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await clearConversionHistory()

    return NextResponse.json({
      success: true,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear conversion history',
      },
      { status: 500 }
    )
  }
}