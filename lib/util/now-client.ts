import axios, { AxiosInstance } from 'axios'
import { DNSResponse, DNSCreateResponse } from '@/types/now'

export class NowClient {
  private client: AxiosInstance
  private domain: string

  constructor ({ token, domain }: { token: string, domain: string }) {
    if (!token) throw new Error('API Token required.')
    if (!domain) throw new Error('Domain name required.')

    this.domain = domain
    this.client = axios.create({
      baseURL: 'https://api.zeit.co',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  async fetchRecord (name: string) {
    const { data: { records } } = await this.client.get<DNSResponse>(`/v2/domains/${this.domain}/records`)
    return records.find(r => r.name === name)
  }

  async createRecord (name: string, ip: string) {
    const { data: { uid } } = await this.client.post<DNSCreateResponse>(
      `/v2/domains/${this.domain}/records`,
      { name, value: ip, type: 'A' }
    )

    return uid
  }

  async deleteRecord (id: string) {
    await this.client.delete(`/v2/domains/${this.domain}/records/${id}`)
  }
}

