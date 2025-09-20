// json function removed in React Router v7
// import type { Route } from './+types/upload';

export async function action({ request, context }: any) {
  // 在开发环境中，我们暂时模拟文件上传
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cover' | 'page'
    
    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${type}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    
    let fileUrl: string;
    
    if (isDev) {
      // 开发环境：模拟文件上传，返回一个占位符URL
      fileUrl = `http://localhost:5174/uploads/${fileName}`;
      console.log(`Development mode: simulated file upload for ${fileName}`);
    } else {
      // 生产环境：上传到 R2
      const env = context.cloudflare.env;
      const arrayBuffer = await file.arrayBuffer();
      await env.FILES.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
      fileUrl = `https://your-r2-domain.com/${fileName}`;
    }
    
    return {
      success: true,
      data: {
        url: fileUrl,
        fileName,
        size: file.size,
        type: file.type,
      },
      message: '文件上传成功',
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { success: false, error: 'File upload failed' },
      { status: 500 }
    );
  }
}
