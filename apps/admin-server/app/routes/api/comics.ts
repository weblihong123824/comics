import { json } from 'react-router';
import { createDatabase } from '../../db';
import { ComicService } from '../../services/comic.service';
// import type { Route } from './+types/comics';

interface Env {
  DB: any;
}

export async function loader({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') as 'ongoing' | 'completed' | undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20');
  
  try {
    const { comics, total } = await comicService.getComics({
      page,
      limit,
      search: search || undefined,
      status,
    });
    
    return json({ 
      success: true, 
      data: { comics, total, page, limit } 
    });
  } catch (error) {
    console.error('Error fetching comics:', error);
    return json(
      { success: false, error: 'Failed to fetch comics' },
      { status: 500 }
    );
  }
}

export async function action({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const newComic = await comicService.createComic(data);
      return json({ 
        success: true, 
        data: newComic,
        message: '漫画创建成功' 
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating comic:', error);
      return json(
        { success: false, error: 'Failed to create comic' },
        { status: 500 }
      );
    }
  }
  
  return json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
