import axios from 'axios'

export const createClient = (token: string) => {
  if (!token) throw new Error('API Token required.')

  return axios.create({
    baseURL: 'https://api.zeit.co',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

