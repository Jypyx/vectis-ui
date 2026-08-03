import { beforeEach, describe, expect, it } from 'vitest'

import { dismissToast, toast, toasts } from './state'

describe('toast (état module)', () => {
  // l'état est global au module : isolation explicite entre les tests
  beforeEach(() => dismissToast())

  it('retourne des ids croissants et empile dans la file', () => {
    const first = toast({ message: 'Un' })
    const second = toast({ message: 'Deux' })
    expect(second).toBe(first + 1)
    expect(toasts.map((item) => item.message)).toEqual(['Un', 'Deux'])
  })

  it('normalise les défauts indépendants du Toaster', () => {
    toast({ message: 'Défauts' })
    expect(toasts[0]).toMatchObject({
      tone: 'neutral',
      variant: 'tonal',
      closable: true,
    })
    // placement et duration restent indéfinis : résolus par le Toaster
    expect(toasts[0]?.placement).toBeUndefined()
    expect(toasts[0]?.duration).toBeUndefined()
  })

  it('conserve les options explicites', () => {
    toast({
      message: 'Options',
      title: 'Titre',
      tone: 'danger',
      variant: 'solid',
      icon: false,
      duration: 0,
      placement: 'top-center',
      closable: false,
      width: '30rem',
    })
    expect(toasts[0]).toMatchObject({
      title: 'Titre',
      tone: 'danger',
      variant: 'solid',
      icon: false,
      duration: 0,
      placement: 'top-center',
      closable: false,
      width: '30rem',
    })
  })

  it('dismissToast(id) retire le bon toast', () => {
    const first = toast({ message: 'Un' })
    toast({ message: 'Deux' })
    dismissToast(first)
    expect(toasts.map((item) => item.message)).toEqual(['Deux'])
    dismissToast(first)
    expect(toasts).toHaveLength(1)
  })

  it('dismissToast() sans argument vide toute la file', () => {
    toast({ message: 'Un' })
    toast({ message: 'Deux' })
    dismissToast()
    expect(toasts).toHaveLength(0)
  })
})
