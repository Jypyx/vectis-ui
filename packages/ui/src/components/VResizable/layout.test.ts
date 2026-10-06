import { describe, expect, it } from 'vitest'

import { defaultSizes, resizeAt, type PanelLimits } from './layout'

const free: PanelLimits = { min: 0, max: 100, collapsible: false, collapsedSize: 0 }
const limit = (overrides: Partial<PanelLimits>): PanelLimits => ({ ...free, ...overrides })

describe('defaultSizes', () => {
  it('shares the space equally between panels without a size', () => {
    expect(defaultSizes([undefined, undefined])).toEqual([50, 50])
    expect(defaultSizes([30, undefined, undefined])).toEqual([30, 35, 35])
  })

  it('scales sizes that do not add up to 100', () => {
    expect(defaultSizes([60, 60])).toEqual([50, 50])
    expect(defaultSizes([20, 30])).toEqual([40, 60])
  })
})

describe('resizeAt', () => {
  it('moves space from one side of the handle to the other', () => {
    expect(resizeAt([50, 50], 0, 10, [free, free])).toEqual([60, 40])
    expect(resizeAt([50, 50], 0, -10, [free, free])).toEqual([40, 60])
  })

  it('stops a panel at its minimum and another at its maximum', () => {
    expect(resizeAt([50, 50], 0, 30, [free, limit({ min: 30 })])).toEqual([70, 30])
    expect(resizeAt([50, 50], 0, 20, [limit({ max: 55 }), free])).toEqual([55, 45])
  })

  it('takes the rest from the next panels once a neighbour reaches its minimum', () => {
    const limits = [free, limit({ min: 20 }), limit({ min: 20 })]
    expect(resizeAt([40, 30, 30], 0, 15, limits)).toEqual([55, 20, 25])
    expect(resizeAt([40, 30, 30], 0, 40, limits)).toEqual([60, 20, 20])
    // Towards the start, from the second handle.
    expect(resizeAt([30, 30, 40], 1, -25, [limit({ min: 20 }), limit({ min: 20 }), free])).toEqual([
      20, 20, 60,
    ])
  })

  it('gives the space to the next panels once a neighbour reaches its maximum', () => {
    const limits = [free, limit({ max: 40 }), free]
    expect(resizeAt([30, 30, 40], 1, 20, limits)).toEqual([40, 40, 20])
  })

  it('collapses a pointer-dragged neighbour past the middle of its minimum', () => {
    const limits = [free, limit({ min: 30, collapsible: true })]
    expect(resizeAt([50, 50], 0, 30, limits)).toEqual([70, 30])
    expect(resizeAt([50, 50], 0, 40, limits)).toEqual([100, 0])
  })

  it('collapses to the collapsed size', () => {
    const limits = [free, limit({ min: 30, collapsible: true, collapsedSize: 5 })]
    expect(resizeAt([50, 50], 0, 45, limits)).toEqual([95, 5])
  })

  it('collapses on the first key below the minimum', () => {
    const limits = [free, limit({ min: 30, collapsible: true })]
    expect(resizeAt([65, 35], 0, 10, limits, 1)).toEqual([100, 0])
  })

  it('reopens a collapsed neighbour at its minimum once pulled far enough', () => {
    const limits = [free, limit({ min: 30, collapsible: true })]
    expect(resizeAt([100, 0], 0, -10, limits)).toEqual([100, 0])
    expect(resizeAt([100, 0], 0, -20, limits)).toEqual([70, 30])
    expect(resizeAt([100, 0], 0, -40, limits)).toEqual([60, 40])
    expect(resizeAt([100, 0], 0, -5, limits, 1)).toEqual([70, 30])
  })

  it('does not collapse a panel when nothing can take its space', () => {
    // Collapsing would free 40 where the first panel can take 30.
    const limits = [limit({ max: 90 }), limit({ min: 30, collapsible: true })]
    expect(resizeAt([60, 40], 0, 30, limits)).toEqual([70, 30])
  })

  it('leaves a collapsed panel that the drag only passes by', () => {
    const limits = [limit({ min: 20, collapsible: true }), free, free]
    expect(resizeAt([0, 50, 50], 1, 20, limits)).toEqual([0, 70, 30])
  })
})
