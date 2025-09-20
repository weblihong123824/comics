export async function loader() {
  // 返回一个简单的 favicon 响应
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
