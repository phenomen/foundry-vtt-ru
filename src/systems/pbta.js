import { setupBabele } from '../shared.js'

export function init() {
  if (game.modules.get('masks-newgeneration-unofficial')?.active) {
    setupBabele('pbta/masks')
  }
}
