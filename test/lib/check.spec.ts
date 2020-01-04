import mockAxios from 'jest-mock-axios'
import { check } from '@/lib/check'
import { Errors } from '@/lib/util/errors'
import { NowClient } from '@/lib/util/now-client'
import { DDNSOptions } from '@/types/options'
import {DNSRecord} from '@/types/now'
import { mocked } from 'ts-jest/utils'

jest.mock('@/lib/util/now-client')

const currentIP = '1.2.3.4'
const remoteIP = '5.6.7.8'

const mockDNSRecord: DNSRecord = {
  name: 'name',
  value: currentIP,
  id: 'id',
  slug: 'slug',
  type: 'A',
  created: Date.now().valueOf(),
  creator: 'sam',
  updated: Date.now().valueOf()
}

const options: DDNSOptions = {
  token: 'token',
  domainName: 'domain',
  name: 'name'
}

const MockClient = mocked(NowClient)
const fetchRecord = jest.fn().mockResolvedValue(mockDNSRecord)
MockClient.prototype.fetchRecord = fetchRecord

const errorOnMismatch = false

it('exports a function', () => {
  expect(check).toBeInstanceOf(Function)
})

describe('check', () => {
  let result: ReturnType<typeof check>

  it('calls wtfismyip', () => {
    check(options)
    expect(mockAxios.get).toHaveBeenCalledWith('https://wtfismyip.com/text')
  })

  describe('when there is a match', () => {
    beforeEach(() => {
      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('does not error', async () => {
      return expect(result).resolves.toMatchObject({
        match: true,
        currentIP,
        nowDNS: { value: currentIP, id: mockDNSRecord.id }
      })
    })
  })

  describe('when there is no match', () => {
    beforeEach(() => {
      fetchRecord.mockResolvedValueOnce({ ...mockDNSRecord, value: remoteIP })

      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('does not error', () => {
      return expect(result).resolves.toMatchObject({
        match: false,
        currentIP,
        nowDNS: { value: remoteIP, id: 'id' }
      })
    })

    describe('when errorOnMismatch is true', () => {
    beforeEach(() => {
      fetchRecord.mockResolvedValueOnce({ ...mockDNSRecord, value: remoteIP })

      result = check(options, { errorOnMismatch: true })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

      it('errors', () => {
        return expect(result).rejects.toEqual(new Error(Errors.MISMATCH_ERROR))
      })
    })
  })

  describe('when wtfismyip fails', () => {
    beforeEach(() => {
      result = check(options, { errorOnMismatch })

      mockAxios.mockError({}, mockAxios.getReqByUrl('https://wtfismyip.com/text'))
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(Errors.FETCH_CURRENT_IP_ERROR))
    })
  })

  describe('when now throws 401', () => {
    beforeEach(() => {
      fetchRecord.mockRejectedValue({ isAxiosError: true, response: { status: 401 } })

      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(Errors.NOW_ACCESS_DENIED_ERROR))
    })
  })

  describe('when now throws 404', () => {
    beforeEach(() => {
      fetchRecord.mockRejectedValue({ isAxiosError: true, response: { status: 404 } })

      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(Errors.DOMAIN_NOT_FOUND_ERROR))
    })
  })

  describe('when now throws 500', () => {
    beforeEach(() => {
      fetchRecord.mockRejectedValue({ isAxiosError: true, response: { status: 500 } })

      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(Errors.NOW_UNKNOWN_ERROR))
    })
  })

  describe('when now throws unknown error', () => {
    beforeEach(() => {
      fetchRecord.mockRejectedValue({})

      result = check(options, { errorOnMismatch })

      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(Errors.NOW_UNKNOWN_ERROR))
    })
  })
})
