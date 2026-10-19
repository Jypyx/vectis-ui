import { describe, expect, it } from 'vite-plus/test'

import { renderIconsModules } from './icons-module'

const render = (paths: string[]) => renderIconsModules('rev', '0 -960 960 960', [['add', paths]])

describe('renderIconsModules', () => {
  it('writes path data into the module', () => {
    expect(
      render(['M440-440H200v-80h240v-280h80v280h240v80H520v280h-80v-280Z'])['add.ts'],
    ).toContain("'M440-440H200v-80h240v-280h80v280h240v80H520v280h-80v-280Z'")
  })

  it('refuses a path that could close its string and inject code', () => {
    expect(() => render(["M0 0Z'; import('evil'); '"])).toThrow(/path data/)
  })
})
