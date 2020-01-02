export interface DNSRecord {
  id: string
  creator: string
  mxPriority?: number
  name: string
  priority?: number
  slug: string
  type: string
  value: string
  created: number
  updated: number
}

export interface DNSResponse<T = DNSRecord> {
  records: T[]
}
