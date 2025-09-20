import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ComicList } from './pages/ComicList';
import { ComicDetail } from './pages/ComicDetail';
import { ComicReader } from './pages/ComicReader';
import { UserCenter } from './pages/UserCenter';
import { Login } from './pages/Login';
import { Favorites } from './pages/Favorites';
import { ReadingHistory } from './pages/ReadingHistory';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/comic/:id/chapter/:chapterNumber" element={<ComicReader />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<ComicList />} />
        <Route path="comic/:id" element={<ComicDetail />} />
        <Route path="user" element={<UserCenter />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="history" element={<ReadingHistory />} />
      </Route>
    </Routes>
  );
}

export default App;