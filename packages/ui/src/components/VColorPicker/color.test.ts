import { describe, expect, it } from 'vitest'

import { formatColor, hsvToRgb, parseColor, rgbToHsv, sameColor } from './color'

const hex = (input: string, alpha = true) => {
  const parsed = parseColor(input)
  return parsed && formatColor(parsed, 'hex', alpha)
}

describe('parseColor', () => {
  it('reads hex in its four lengths, with or without the hash', () => {
    expect(hex('#3b82f6')).toBe('#3b82f6')
    expect(hex('3B82F6')).toBe('#3b82f6')
    expect(hex('#fff')).toBe('#ffffff')
    expect(hex('#f008')).toBe('#ff000088')
    expect(hex('#3b82f680')).toBe('#3b82f680')
  })

  it('reads rgb() in the comma and the space syntax, with an alpha', () => {
    expect(hex('rgb(59, 130, 246)')).toBe('#3b82f6')
    expect(hex('rgb(59 130 246)')).toBe('#3b82f6')
    expect(hex('rgba(255, 0, 0, 0.5)')).toBe('#ff000080')
    expect(hex('rgb(100% 0% 0% / 50%)')).toBe('#ff000080')
  })

  it('reads hsl(), percentages optional, hue in any angle unit', () => {
    expect(hex('hsl(217 91% 60%)')).toBe('#3c83f6')
    expect(hex('hsl(0.5turn, 100%, 50%)')).toBe('#00ffff')
    expect(hex('hsla(120 100 25 / 0.5)')).toBe('#00800080')
  })

  it('reads oklch(), lightness as a number or a percentage', () => {
    expect(hex('oklch(62.8% 0.2577 29.23)')).toBe('#ff0000')
    expect(hex('oklch(0.628 0.2577 29.23)')).toBe('#ff0000')
    expect(hex('oklch(100% 0 0)')).toBe('#ffffff')
  })

  it('clips an oklch() colour outside sRGB', () => {
    expect(hex('oklch(70% 0.4 145)')).toBe('#00d200')
  })

  it('refuses anything else', () => {
    for (const input of ['', 'red', '#12345', 'rgb(1 2)', 'rgb(1 2 3 / 4 / 5)', 'lab(50% 0 0)'])
      expect(parseColor(input)).toBeNull()
    expect(parseColor(null)).toBeNull()
  })
})

describe('formatColor', () => {
  const blue = parseColor('#3b82f6')!
  const translucent = parseColor('#3b82f680')!

  it('writes each format', () => {
    expect(formatColor(blue, 'hex')).toBe('#3b82f6')
    expect(formatColor(blue, 'rgb')).toBe('rgb(59 130 246)')
    expect(formatColor(blue, 'hsl')).toBe('hsl(217 91% 60%)')
    expect(formatColor(blue, 'oklch')).toBe('oklch(62.3% 0.188 259.8)')
  })

  it('writes the alpha only when asked and below 1', () => {
    expect(formatColor(translucent, 'hex')).toBe('#3b82f6')
    expect(formatColor(translucent, 'hex', true)).toBe('#3b82f680')
    expect(formatColor(translucent, 'rgb', true)).toBe('rgb(59 130 246 / 0.5)')
    expect(formatColor(blue, 'rgb', true)).toBe('rgb(59 130 246)')
  })

  it('writes a grey with no oklch hue', () => {
    expect(formatColor(parseColor('#808080')!, 'oklch')).toBe('oklch(60% 0 0)')
  })
})

describe('HSV', () => {
  it('goes there and back', () => {
    const rgba = parseColor('#3b82f6')!
    expect(formatColor(hsvToRgb(rgbToHsv(rgba)), 'hex')).toBe('#3b82f6')
  })

  it('keeps the hue it is given on a colour that has none', () => {
    expect(rgbToHsv(parseColor('#000')!, 200).h).toBe(200)
    expect(rgbToHsv(parseColor('#808080')!, 200).h).toBe(200)
  })
})

it('sameColor compares through hex', () => {
  expect(sameColor(parseColor('#ff0000'), parseColor('rgb(255 0 0)'), false)).toBe(true)
  expect(sameColor(parseColor('#ff000080'), parseColor('#ff0000'), true)).toBe(false)
  expect(sameColor(parseColor('#ff000080'), parseColor('#ff0000'), false)).toBe(true)
  expect(sameColor(null, parseColor('#ff0000'), false)).toBe(false)
})
