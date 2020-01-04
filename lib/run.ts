import { DDNSOptions } from '@/types/options'
import { NowClient } from './util/now-client'
import { check } from './check'
import { DNSRecord } from '@/types/now'
import { Errors } from './util/errors'

const updateDNS = async (
  options: DDNSOptions,
  nowDNS: DNSRecord,
  currentIP: string
) => {
  const client = new NowClient({
    token: options.token,
    domain: options.domainName
  })
  let uid: string

  try {
    uid = await client.createRecord(options.name, currentIP)
  } catch (e) {
    throw new Error(Errors.NOW_CREATE_ERROR)
  }

  try {
    if (nowDNS) await client.deleteRecord(nowDNS.id)
  } catch (e) {
    throw new Error(Errors.NOW_DELETE_ERROR)
  }

  return uid
}

export const run = async (options: DDNSOptions) => {
  const { match, currentIP, nowDNS } = await check(options, { errorOnMismatch: false })

  if (match) return

  return await updateDNS(options, nowDNS, currentIP)
}

