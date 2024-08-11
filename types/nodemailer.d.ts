import { ReadStream } from 'fs'

export interface Attachment {
  filename: string // encoded in base64 ideally, but can be the path to a file
  encoding?: string
  content?: string | ReadStream
}

export interface SendMailParams {
  to: string
  from: string
  body: string
  subject: string
  refreshToken: string
  attachments?: Attachment[]
}
