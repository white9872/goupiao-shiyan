import { fileDb } from '@/lib/db/fileDb'

// MVP：默认使用本地 JSON 文件存储。
// 之后接入 Supabase 时，在这里切换为 supabaseDb。
export const db = fileDb
