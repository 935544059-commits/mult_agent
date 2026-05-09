/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,   // 静态导出必须关闭图片优化
  },
}

module.exports = nextConfig