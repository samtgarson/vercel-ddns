import { createClient } from '../../lib/client'

describe('createClient', () => {
  it('is a function', () => {
    expect(createClient).toBeInstanceOf(Function)
  })

  describe('creating a client', () => {
    it('fails without a token', () => {
      expect(() => createClient('')).toThrow('API Token required.')
    })

    describe('with a token', () => {
      const token = 'token'

      it('succeeds', () => {
        let client = createClient(token)

        expect(client.defaults).toMatchObject({
          baseURL: 'https://api.zeit.co',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      })
    })
  })
})
