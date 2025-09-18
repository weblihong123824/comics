import { json } from 'react-router';
// import type { Route } from './+types/upload';

interface Env {
  FILES: any;
}

export async function action({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  
  if (request.method !== 'POST') {
    return json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cover' | 'page'
    
    if (!file) {
      return json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${type}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    
    // 上传到 R2
    const arrayBuffer = await file.arrayBuffer();
    await env.FILES.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // 返回文件URL
    const fileUrl = `https://your-r2-domain.com/${fileName}`;
    
    return json({
      success: true,
      data: {
        url: fileUrl,
        fileName,
        size: file.size,
        type: file.type,
      },
      message: '文件上传成功',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return json(
      { success: false, error: 'File upload failed' },
      { status: 500 }
    );
  }
}
