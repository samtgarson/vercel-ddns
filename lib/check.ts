import axios, { AxiosError, AxiosResponse } from 'axios'
import { NowClient } from './util/now-client'
import { DDNSOptions } from '@/types/options'
import { CheckErrors } from './util/errors'
import {DNSRecord} from '@/types/now'

const {
  FETCH_CURRENT_IP_ERROR,
  NOW_ACCESS_DENIED_ERROR,
  DOMAIN_NOT_FOUND_ERROR,
  NOW_UNKNOWN_ERROR,
  MISMATCH_ERROR
} = CheckErrors

interface AxiosErrorWithResponse<T = any> extends AxiosError {
  response: AxiosResponse<T>
}

const isAxiosError = (e: any): e is AxiosErrorWithResponse => (
  e.isAxiosError && e.response
)

const getCurrentIP = async () => {
  try {
    const { data } = await axios.get<string>('https://wtfismyip.com/text')
    return data.trim()
  } catch (e) {
    throw new Error(FETCH_CURRENT_IP_ERROR)
  }
}

const getNowDNS = async ({ token, domainName, name }: DDNSOptions) => {
  try {
    const client = new NowClient({ token, domain: domainName })
    return await client.fetchRecord(name)
  } catch (e) {
    if (isAxiosError(e) && [401,403].includes(e.response.status)) {
      throw new Error(NOW_ACCESS_DENIED_ERROR)
    } else if (isAxiosError(e) && e.response.status === 404) {
      throw new Error(DOMAIN_NOT_FOUND_ERROR)
    } else {
      throw new Error(NOW_UNKNOWN_ERROR)
    }
  }
}

export interface CheckOptions {
  errorOnMismatch: boolean
}

const defaultCheckOptions = {
  errorOnMismatch: true
}

export const check = async (args: DDNSOptions, options: CheckOptions = defaultCheckOptions) => {
  const [currentIP, nowDNS] = await Promise.all([getCurrentIP(), getNowDNS(args)])

  const result = { currentIP, nowDNS, match: true }

  if (!nowDNS || currentIP !== nowDNS.value) {
    result.match = false
  }

  if (options.errorOnMismatch) {
    throw new Error(MISMATCH_ERROR)
  }

  return  result
}


