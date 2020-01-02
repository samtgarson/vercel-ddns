import axios, { AxiosError, AxiosResponse } from 'axios'
import { createClient } from './util/client'
import { DDNSOptions } from '@/types/options'
import { DNSResponse } from '@/types/now'
import { CheckErrors } from './util/errors'

const {
  FETCH_CURRENT_IP_ERROR,
  ZEIT_ACCESS_DENIED_ERROR,
  DOMAIN_NOT_FOUND_ERROR,
  ZEIT_UNKNOWN_ERROR,
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
    const client = createClient(token)
    const { data: { records } } = await client.get<DNSResponse>(`/v2/domains/${domainName}/records`)

    const { value, id } = records.find(r => r.name === name) || {}
    return { value, id }
  } catch (e) {
    if (isAxiosError(e) && [401,403].includes(e.response.status)) {
      throw new Error(ZEIT_ACCESS_DENIED_ERROR)
    } else if (isAxiosError(e) && e.response.status === 404) {
      throw new Error(DOMAIN_NOT_FOUND_ERROR)
    } else {
      throw new Error(ZEIT_UNKNOWN_ERROR)
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

  if (currentIP !== nowDNS.value && options.errorOnMismatch) {
    throw new Error(MISMATCH_ERROR)
  }
  return { currentIP, nowDNS }
}


