/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // 关键：新增这一行
  images: {
    unoptimized: true,   // 静态导出必须关闭图片优化
  },
}

module.exports = nextConfig