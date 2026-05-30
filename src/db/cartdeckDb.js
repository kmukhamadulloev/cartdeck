import Dexie from 'dexie'

class CartDeckDatabase extends Dexie {
  constructor() {
    super('cartdeck-db')

    this.version(1).stores({
      roms: '&id, extension, filename, createdAt, updatedAt, lastPlayedAt',
      settings: '&key',
      saves: '&id, romId, createdAt',
    })
  }
}

export const cartdeckDb = new CartDeckDatabase()
