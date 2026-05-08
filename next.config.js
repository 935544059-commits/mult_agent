/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // 关键：必须添加这一行来启用静态导出
  images: {
    unoptimized: true, // 静态导出通常需要禁用 Next.js 的图片优化功能
  },
}

module.exports = nextConfig