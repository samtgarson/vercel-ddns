import mockAxios from 'jest-mock-axios'
import { NowClient } from '@/lib/util/now-client'
import { DNSRecord, DNSCreateResponse } from '@/types/now'

const name = 'name'
const ip = 'ip'

describe('createClient', () => {
  describe('creating a client', () => {
    it('fails without a token', () => {
      const createClient = () => new NowClient({ token: '', domain: 'samgarson.com' })
      expect(createClient).toThrow('API Token required.')
    })

    it('fails without a domain', () => {
      const createClient = () => new NowClient({ token: '123', domain: '' })
      expect(createClient).toThrow('Domain name required.')
    })

    describe('with a token and domain', () => {
      const token = 'token'
      const domain = 'domain'
      let client: NowClient

      beforeEach(() => {
        client = new NowClient({ token, domain })
      })

      describe('fetchRecord', () => {
        it('calls now api', () => {
          client.fetchRecord('name')

          expect(mockAxios.get).toHaveBeenCalledWith(`/v2/domains/${domain}/records`)
        })

        it('returns the correct record', () => {
          const response = client.fetchRecord(name)
          const records: Partial<DNSRecord>[] = [
            { name }, { name: 'other name' }
          ]
          mockAxios.mockResponse({ data: { records } })

          return expect(response).resolves.toEqual({ name })
        })

        it('returns an empty object with no match', () => {
          const response = client.fetchRecord(name)
          const records: Partial<DNSRecord>[] = [
            { name: 'other name' }
          ]
          mockAxios.mockResponse({ data: { records } })

          return expect(response).resolves.toEqual(undefined)
        })
      })

      describe('createRecord', () => {
        const uid = 'uid'

        it('calls the Now API', () => {
          client.createRecord(name, ip)

          expect(mockAxios.post).toHaveBeenCalledWith(
            `/v2/domains/${domain}/records`,
            { name, value: ip, type: 'A' }
          )
        })

        it('returns the uid of the new record', () => {
          const response = client.createRecord(name, ip)
          const data: DNSCreateResponse = { uid }
          mockAxios.mockResponse({ data })

          return expect(response).resolves.toEqual(uid)
        })
      })

      describe('deleteRecord', () => {
        const uid = 'uid'

        it('calls the Now API', () => {
          client.deleteRecord(uid)

          expect(mockAxios.delete).toHaveBeenCalledWith(
            `/v2/domains/${domain}/records/${uid}`
          )
        })
      })
    })
  })
})
