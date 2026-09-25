import { describe, expect, it } from 'vitest'

import { windowOf } from './layout'
import { drawnSlot, moveEvent, moveTimedEvent, resizeEvent, resizeTimedEvent } from './timeGrid'

/*
 * The reference week `layout.test.ts` reads against: June 2026, whose 10th is a Wednesday.
 */
const WEDNESDAY = '2026-06-10'
const FRIDAY = '2026-06-12'

/** A whole day, which is what every case below is read against unless it says otherwise. */
const DAY = windowOf(0, 24)

/** Minutes since midnight, so a case can be written in the hours it means. */
const at = (hour: number, minute = 0) => hour * 60 + minute

describe('moveEvent', () => {
  const origin = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:30' }

  it('carries the event whole along its day, keeping how long it lasts', () => {
    expect(moveEvent(origin, 30, DAY)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '09:30',
      endTime: '11:00',
    })
  })

  /*
   * Moving something must never change how long it is — that is the other gesture's job.
   * So an event pushed past the end of the window is held against it instead of being cut.
   */
  it('holds an event at the edge rather than shortening it', () => {
    const late = moveEvent(origin, 10_000, DAY)
    expect(late.startTime).toBe('22:30')
    expect(late.endTime).toBe('23:59')
  })

  it('holds it at the top edge the same way', () => {
    expect(moveEvent(origin, -10_000, DAY)).toMatchObject({
      startTime: '00:00',
      endTime: '01:30',
    })
  })
})

describe('resizeEvent', () => {
  const origin = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }

  it('moves the end and leaves the start where it is', () => {
    expect(resizeEvent(origin, at(11, 30), 15, DAY)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '09:00',
      endTime: '11:30',
    })
  })

  it('never lets the end cross the start', () => {
    expect(resizeEvent(origin, at(6), 15, DAY).endTime).toBe('09:15')
  })

  it('keeps the end inside the window', () => {
    expect(resizeEvent(origin, 5000, 15, DAY).endTime).toBe('23:59')
  })
})

describe('moveTimedEvent', () => {
  const ordinary = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }
  const overnight = { start: WEDNESDAY, end: '2026-06-11', startTime: '22:00', endTime: '02:00' }

  it('holds an ordinary event inside the day it is moved to', () => {
    expect(moveTimedEvent(ordinary, FRIDAY, at(23, 30), DAY, false)).toEqual({
      start: FRIDAY,
      end: FRIDAY,
      startTime: '23:00',
      endTime: '23:59',
    })
  })

  it('lets an overnight event keep crossing midnight, with its length', () => {
    expect(moveTimedEvent(overnight, WEDNESDAY, at(23), DAY, true)).toEqual({
      start: WEDNESDAY,
      end: '2026-06-11',
      startTime: '23:00',
      endTime: '03:00',
    })
  })

  it('brings it back inside one day when it fits there', () => {
    expect(moveTimedEvent(overnight, WEDNESDAY, at(18), DAY, true)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '18:00',
      endTime: '22:00',
    })
  })

  // Taken by its morning card, the start is counted back from the pointer's own day.
  it('carries a start pushed before midnight onto the day before', () => {
    expect(moveTimedEvent(overnight, '2026-06-11', -at(1), DAY, true)).toMatchObject({
      start: WEDNESDAY,
      startTime: '23:00',
      end: '2026-06-11',
      endTime: '03:00',
    })
  })
})

describe('resizeTimedEvent', () => {
  const overnight = { start: WEDNESDAY, end: '2026-06-11', startTime: '22:00', endTime: '02:00' }

  it('is resizeEvent for an ordinary event, whatever day is named', () => {
    const ordinary = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }
    expect(resizeTimedEvent(ordinary, FRIDAY, at(11), 15, DAY, false)).toEqual(
      resizeEvent(ordinary, at(11), 15, DAY),
    )
  })

  it('sets the end on the morning after when the pointer is there', () => {
    expect(resizeTimedEvent(overnight, '2026-06-11', at(4), 15, DAY, true)).toMatchObject({
      end: '2026-06-11',
      endTime: '04:00',
    })
  })

  it('brings the end back to the first evening when the pointer is there', () => {
    expect(resizeTimedEvent(overnight, WEDNESDAY, at(23), 15, DAY, true)).toMatchObject({
      end: WEDNESDAY,
      endTime: '23:00',
    })
  })

  // Past a whole day the event would turn into a bar under the pointer.
  it('stops short of a whole day after the start', () => {
    expect(resizeTimedEvent(overnight, '2026-06-11', at(23), 15, DAY, true)).toMatchObject({
      end: '2026-06-11',
      endTime: '21:59',
    })
  })

  it('never lets the end cross the start', () => {
    expect(resizeTimedEvent(overnight, WEDNESDAY, at(8), 15, DAY, true)).toMatchObject({
      end: WEDNESDAY,
      endTime: '22:15',
    })
  })
})

describe('drawnSlot', () => {
  it('covers the pressed slot to the one under the pointer, going down', () => {
    expect(drawnSlot(WEDNESDAY, at(10), at(11, 10), 15, DAY)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '10:00',
      endTime: '11:15',
    })
  })

  it('keeps the pressed slot when the pointer goes up', () => {
    expect(drawnSlot(WEDNESDAY, at(10, 5), at(9, 10), 15, DAY)).toMatchObject({
      startTime: '09:00',
      endTime: '10:15',
    })
  })

  it('stays inside the window', () => {
    expect(drawnSlot(WEDNESDAY, at(10), at(20), 15, windowOf(9, 17))).toMatchObject({
      startTime: '10:00',
      endTime: '17:00',
    })
  })
})

/*
 * An overnight event may START after the window's end: a calendar showing 08:00 to 20:00 still
 * draws the morning card of a 22:00 to 10:00 shift. Neither gesture may then pull its start
 * into the window, or write an end before its start.
 */
describe('an overnight event starting after the window', () => {
  const EVENING = windowOf(8, 20)

  it('moves by what it was asked to, the start staying outside the window', () => {
    const shift = { start: WEDNESDAY, end: '2026-06-11', startTime: '22:00', endTime: '10:00' }
    expect(moveTimedEvent(shift, WEDNESDAY, at(22, 15), EVENING, true)).toEqual({
      start: WEDNESDAY,
      end: '2026-06-11',
      startTime: '22:15',
      endTime: '10:15',
    })
  })

  it('never writes an end before the start when stretched back into the first day', () => {
    const late = { start: WEDNESDAY, end: '2026-06-11', startTime: '22:30', endTime: '01:00' }
    expect(resizeTimedEvent(late, WEDNESDAY, at(21), 15, windowOf(0, 22), true)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '22:30',
      endTime: '22:45',
    })
  })

  it('keeps the shortest length when the window ends just after the start', () => {
    const tight = { start: WEDNESDAY, end: '2026-06-11', startTime: '21:50', endTime: '01:00' }
    expect(resizeTimedEvent(tight, WEDNESDAY, at(21, 55), 15, windowOf(0, 22), true)).toMatchObject(
      { endTime: '22:05' },
    )
  })
})
