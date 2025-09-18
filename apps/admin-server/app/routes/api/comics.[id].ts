import { json } from 'react-router';
import { createDatabase } from '../../db';
import { ComicService } from '../../services/comic.service';

interface Env {
  DB: any;
}

export async function loader({ params, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  try {
    const comic = await comicService.getComicById(params.id);
    if (!comic) {
      return json({ success: false, error: 'Comic not found' }, { status: 404 });
    }
    return json({ success: true, data: comic });
  } catch (error) {
    console.error('Error fetching comic:', error);
    return json(
      { success: false, error: 'Failed to fetch comic' },
      { status: 500 }
    );
  }
}

export async function action({ request, params, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  if (request.method === 'PUT' || request.method === 'PATCH') {
    try {
      const data = await request.json();
      const updatedComic = await comicService.updateComic(params.id, data);
      if (!updatedComic) {
        return json({ success: false, error: 'Comic not found' }, { status: 404 });
      }
      return json({ 
        success: true, 
        data: updatedComic,
        message: '漫画更新成功' 
      });
    } catch (error) {
      console.error('Error updating comic:', error);
      return json(
        { success: false, error: 'Failed to update comic' },
        { status: 500 }
      );
    }
  }
  
  if (request.method === 'DELETE') {
    try {
      await comicService.deleteComic(params.id);
      return json({ 
        success: true, 
        message: '漫画删除成功' 
      });
    } catch (error) {
      console.error('Error deleting comic:', error);
      return json(
        { success: false, error: 'Failed to delete comic' },
        { status: 500 }
      );
    }
  }
  
  return json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
