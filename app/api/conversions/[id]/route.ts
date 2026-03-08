import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  deleteConversionHistoryById,
  getConversionHistoryById,
  updateConversionHistory,
} from '@/lib/conversionHistoryRepository'

const updateConversionSchema = z.object({
  from: z.string().regex(/^[A-Z]{3}$/),
  to: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().finite().gt(0),
  result: z.number().finite().gt(0),
  rate: z.number().finite().gt(0),
})

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const history = await getConversionHistoryById(id)

    if (!history) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversion history entry not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid conversion history id') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load conversion history entry',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const parsedBody = updateConversionSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid conversion payload',
        },
        { status: 400 }
      )
    }

    const updated = await updateConversionHistory(id, parsedBody.data)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid conversion history id') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Conversion history not found') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update conversion history entry',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteConversionHistoryById(id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid conversion history id') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Conversion history not found') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete conversion history entry',
      },
      { status: 500 }
    )
  }
}