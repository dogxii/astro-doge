import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatYMD(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatMD(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date)
  if (!d || Number.isNaN(d.getTime())) return ''
  const month = d.getMonth() + 1
  const day = d.getDate()
  const pad2 = (n: number) => n.toString().padStart(2, '0')
  return `${pad2(month)}.${pad2(day)}`
}

/**
 * 计算文章阅读时间
 * 支持中英文混合内容
 * 中文阅读速度约 300-500 字/分钟，英文约 200-250 词/分钟
 * 这里取中间值：中文 400 字/分钟，英文 200 词/分钟
 */
export function readingTime(content: string): string {
  if (!content) return '1 分钟'

  // 移除 HTML 标签和代码块
  const plainText = content
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')

  // 计算中文字符数（包括中文标点）
  const chineseChars = (
    plainText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []
  ).length

  // 计算英文单词数（移除中文后按空格分割）
  const englishText = plainText.replace(
    /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g,
    ' ',
  )
  const englishWords = englishText
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  // 计算阅读时间（分钟）
  const chineseTime = chineseChars / 400
  const englishTime = englishWords / 200
  const totalMinutes = Math.ceil(chineseTime + englishTime)

  // 至少 1 分钟
  return `${Math.max(1, totalMinutes)} 分钟`
}

/**
 * 计算文章字数
 * 返回中文字符数 + 英文单词数
 */
export function wordCount(content: string): number {
  if (!content) return 0

  // 移除 HTML 标签
  const plainText = content.replace(/<[^>]+>/g, '')

  // 计算中文字符
  const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length

  // 计算英文单词
  const englishText = plainText.replace(/[\u4e00-\u9fa5]/g, ' ')
  const englishWords = englishText
    .split(/\s+/)
    .filter((word) => /[a-zA-Z]/.test(word)).length

  return chineseChars + englishWords
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString('default', { month: 'short' })
  const startYear = startDate.getFullYear().toString()
  let endMonth: string = ''
  let endYear: string = ''

  if (endDate) {
    if (typeof endDate === 'string') {
      endMonth = ''
      endYear = endDate
    } else {
      endMonth = endDate.toLocaleString('default', { month: 'short' })
      endYear = endDate.getFullYear().toString()
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`
}

export function timeAgo(date: Date): string {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) {
    return `刚刚`
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} 分钟前`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo} 小时前`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 30) {
    return `${daysAgo} 天前`
  }

  const monthsAgo = Math.floor(daysAgo / 30)
  if (monthsAgo < 12) {
    return `${monthsAgo} 个月前`
  }

  const yearsAgo = Math.floor(monthsAgo / 12)
  return `${yearsAgo} 年前`
}

export function getWeekday(date: Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

/**
 * 格式化碎碎念时间
 * - 同年：MM-DD HH:mm
 * - 跨年：YYYY-MM-DD HH:mm
 */
export function formatThoughtDate(date: Date): string {
  const now = new Date()
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hour = pad2(date.getHours())
  const minute = pad2(date.getMinutes())
  const time = `${hour}:${minute}`
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${time}`
  }
  return `${date.getFullYear()}-${month}-${day} ${time}`
}
