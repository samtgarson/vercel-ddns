import { createClient } from '@/lib/util/client'
import axios from 'axios'

jest.mock('axios', () => ({
  create: jest.fn()
}))

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

        expect(axios.create).toHaveBeenCalledWith({
          baseURL: 'https://api.zeit.co',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      })
    })
  })
})
