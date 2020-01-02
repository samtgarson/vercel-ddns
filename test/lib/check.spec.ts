import mockAxios from 'jest-mock-axios'
import { check } from '@/lib/check'
import { CheckErrors } from '@/lib/util/errors'
import { DDNSOptions } from '@/types/options'
import {DNSResponse, DNSRecord} from '@/types/now'

const options: DDNSOptions = {
  token: 'token',
  domainName: 'domain',
  name: 'name'
}

let errorOnMismatch: boolean

const currentIP = '1.2.3.4'
const remoteIP = '5.6.7.8'

const zeitResponse = (value: string = currentIP, name: string = options.name): DNSResponse<Partial<DNSRecord>> => ({
  records: [
    { name, value, id: 'id' }
  ]
})

it('exports a function', () => {
  expect(check).toBeInstanceOf(Function)
})

describe('check', () => {
  let result: ReturnType<typeof check>

  beforeAll(() => {
    errorOnMismatch = false
  })

  beforeEach(async () => {
    result = check(options, { errorOnMismatch })
  })

  it('calls wtfismyip', () => {
    expect(mockAxios.get).toHaveBeenCalledWith('https://wtfismyip.com/text')
  })

  it('calls zeit api', () => {
    expect(mockAxios.get).toHaveBeenCalledWith(`/v2/domains/${options.domainName}/records`)
  })

  describe('when there is a match', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      mockAxios.mockResponseFor(
        { url: `/v2/domains/${options.domainName}/records` },
        { status: 200, data: zeitResponse(currentIP) }
      )
    })

    it('does not error', () => {
      return expect(result).resolves.toMatchObject({
        currentIP,
        nowDNS: { value: currentIP, id: 'id' }
      })
    })
  })

  describe('when there is no match', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      mockAxios.mockResponseFor(
        { url: `/v2/domains/${options.domainName}/records` },
        { status: 200, data: zeitResponse(remoteIP) }
      )
    })

    it('does not error', () => {
      return expect(result).resolves.toMatchObject({
        currentIP,
        nowDNS: { value: remoteIP, id: 'id' }
      })
    })

    describe('when errorOnMismatch is true', () => {
      beforeAll(() => {
        errorOnMismatch = true
      })

      it('errors', () => {
        return expect(result).rejects.toEqual(new Error(CheckErrors.MISMATCH_ERROR))
      })
    })
  })

  describe('when wtfismyip fails', () => {
    beforeEach(() => {
      const ipPromise = mockAxios
        .getReqByUrl('https://wtfismyip.com/text')
        .promise

      mockAxios.mockError({}, ipPromise)

      mockAxios.mockResponseFor(
        { url: `/v2/domains/${options.domainName}/records` },
        { status: 200, data: zeitResponse(currentIP) }
      )
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(CheckErrors.FETCH_CURRENT_IP_ERROR))
    })
  })

  describe('when zeit throws 401', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      const zeitPromise = mockAxios
        .getReqByUrl(`/v2/domains/${options.domainName}/records`)
        .promise

      mockAxios.mockError({ isAxiosError: true, response: { status: 401 } }, zeitPromise)
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(CheckErrors.ZEIT_ACCESS_DENIED_ERROR))
    })
  })

  describe('when zeit throws 404', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      const zeitPromise = mockAxios
        .getReqByUrl(`/v2/domains/${options.domainName}/records`)
        .promise

      mockAxios.mockError({ isAxiosError: true, response: { status: 404 } }, zeitPromise)
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(CheckErrors.DOMAIN_NOT_FOUND_ERROR))
    })
  })

  describe('when zeit throws 500', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      const zeitPromise = mockAxios
        .getReqByUrl(`/v2/domains/${options.domainName}/records`)
        .promise

      mockAxios.mockError({ isAxiosError: true, response: { status: 500 } }, zeitPromise)
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(CheckErrors.ZEIT_UNKNOWN_ERROR))
    })
  })

  describe('when zeit throws unknown error', () => {
    beforeEach(() => {
      mockAxios.mockResponseFor(
        { url: 'https://wtfismyip.com/text' },
        { status: 200, data: currentIP }
      )

      const zeitPromise = mockAxios
        .getReqByUrl(`/v2/domains/${options.domainName}/records`)
        .promise

      mockAxios.mockError({}, zeitPromise)
    })

    it('errors', () => {
      return expect(result).rejects.toEqual(new Error(CheckErrors.ZEIT_UNKNOWN_ERROR))
    })
  })
})
