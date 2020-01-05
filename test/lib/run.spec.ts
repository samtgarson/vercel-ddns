import { run } from '@/lib/run'
import { check } from '@/lib/check'
import { DDNSOptions } from '@/types/options'
import { mocked } from 'ts-jest/utils'
import { NowClient } from '@/lib/util/now-client'
import { DNSRecord } from '@/types/now'
import {Errors} from '@/lib/util/errors'

jest.mock('@/lib/check')
jest.mock('@/lib/util/now-client')

const currentIP = 'ip'
const remoteIP = 'new ip'
const mockCheck = mocked(check)

const options: DDNSOptions = {
  token: 'token',
  domain: 'domain',
  name: 'name'
}

const mockDNSRecord: DNSRecord = {
  name: 'name',
  value: remoteIP,
  id: 'id',
  slug: 'slug',
  type: 'A',
  created: Date.now().valueOf(),
  creator: 'sam',
  updated: Date.now().valueOf()
}

const MockClient = mocked(NowClient)
const createRecord = jest.fn().mockResolvedValue('uid')
const deleteRecord = jest.fn().mockResolvedValue(undefined)

MockClient.prototype.createRecord = createRecord
MockClient.prototype.deleteRecord = deleteRecord

let result: string | undefined
let error: Error

mockCheck.mockResolvedValue({
  match: true,
  currentIP,
  nowDNS: undefined
})

describe('run', () => {
  beforeEach(async () => {
    try {
      result = await run(options)
    } catch (e) {
      error = e
    }
  })

  it('calls check', () => {
    expect(check).toHaveBeenCalledWith(options, { errorOnMismatch: false })
  })

  describe('when there is a match', () => {
    it('does not create a new DNS record', async () => {
      expect(createRecord).not.toHaveBeenCalled()
    })

    it('does not delete any records', async () => {
      expect(deleteRecord).not.toHaveBeenCalled()
    })

    it('returns nothing', () => {
      expect(result).toBeUndefined()
    })

    it('does not error', () => {
      expect(error).toBeUndefined()
    })
  })

  describe('when there is no match', () => {
    beforeAll(async () => {
      mockCheck.mockResolvedValue({
        match: false,
        currentIP,
        nowDNS: undefined
      })
    })

    it('creates a new record', () => {
      expect(createRecord).toHaveBeenCalledWith(options.name, currentIP)
    })

    it('does not delete any records', () => {
      expect(deleteRecord).not.toHaveBeenCalled()
    })

    it('returns the ID of the new record', () => {
      expect(result).toEqual('uid')
    })

    it('does not error', () => {
      expect(error).toBeUndefined()
    })

    describe('when create goes wrong', () => {
      beforeAll(() => {
        createRecord.mockRejectedValueOnce('oh noes')
      })

      it('throws an error', () => {
        expect(error).toEqual(new Error(Errors.NOW_CREATE_ERROR))
      })
    })

    describe('when there is an existing DNS record', () => {
      beforeAll(async () => {
        mockCheck.mockResolvedValue({
          match: false,
          currentIP,
          nowDNS: mockDNSRecord
        })
      })

      it('deletes the record', () => {
        expect(deleteRecord).toHaveBeenCalledWith(mockDNSRecord.id)
      })

      describe('when delete goes wrong', () => {
        beforeAll(() => {
          deleteRecord.mockRejectedValueOnce('oh noes')
        })

        it('throws an error', () => {
          expect(error).toEqual(new Error(Errors.NOW_DELETE_ERROR))
        })
      })
    })
  })
})
