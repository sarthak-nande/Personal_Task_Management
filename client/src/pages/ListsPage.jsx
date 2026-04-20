import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, CheckCircle, Circle, Plus, Trash2, Edit3, Check, X, ListTodo, FolderPlus } from 'lucide-react';

export default function ListsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  
  const [newListName, setNewListName] = useState('');
  
  const [editingListId, setEditingListId] = useState(null);
  const [editListTitle, setEditListTitle] = useState('');
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  
  const [newItemTitles, setNewItemTitles] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/customlists', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        let listsData = await res.json();
        setLists(listsData);
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newListName })
      });
      if (res.ok) {
        const newList = await res.json();
        setLists([newList, ...lists]);
        setNewListName('');
      }
    } catch (e) {
      console.error('Failed to create list', e);
    }
  };

  const handleUpdateList = async (listId) => {
    if (!editListTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customlists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editListTitle })
      });
      if (res.ok) {
        setLists(lists.map(l => l._id === listId ? { ...l, name: editListTitle } : l));
        setEditingListId(null);
      }
    } catch (e) {
      console.error('Failed to update list', e);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customlists/${listId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLists(lists.filter(l => l._id !== listId));
      }
    } catch (e) {
      console.error('Failed to delete list', e);
    }
  };

  const handleAddItem = async (listId, e) => {
    e.preventDefault();
    const title = newItemTitles[listId];
    if (!title || !title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customlists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim() })
      });

      if (res.ok) {
        const newItem = await res.json();
        setLists(lists.map(l => {
            if (l._id === listId) {
                return { ...l, items: [...(l.items || []), newItem] };
            }
            return l;
        }));
        setNewItemTitles({ ...newItemTitles, [listId]: '' });
      }
    } catch (e) {
      console.error('Failed to add item', e);
    }
  };

  const toggleItemCompletion = async (listId, itemId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const targetList = lists.find(l => l._id === listId);
      const targetItem = targetList.items.find(i => i._id === itemId);
      
      const updatedLists = lists.map(l => {
          if (l._id === listId) {
              return {
                  ...l,
                  items: l.items.map(i => i._id === itemId ? { ...i, isCompleted: !currentStatus } : i)
              };
          }
          return l;
      });
      setLists(updatedLists);

      await fetch(`/api/customlists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
    } catch (e) {
      console.error('Failed to update item', e);
      fetchData();
    }
  };

  const handleUpdateItem = async (listId, itemId) => {
    if (!editItemTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customlists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editItemTitle })
      });
      if (res.ok) {
        setLists(lists.map(l => {
            if (l._id === listId) {
                return {
                    ...l,
                    items: l.items.map(i => i._id === itemId ? { ...i, title: editItemTitle } : i)
                };
            }
            return l;
        }));
        setEditingItemId(null);
      }
    } catch (e) {
      console.error('Failed to update item', e);
    }
  };

  const deleteItem = async (listId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      
      setLists(lists.map(l => {
          if (l._id === listId) {
              return { ...l, items: l.items.filter(i => i._id !== itemId) };
          }
          return l;
      }));

      await fetch(`/api/customlists/${listId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to delete item', e);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a202c]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FolderPlus className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">My Lists</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-tight">Custom checklists and notes</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Add List Input */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
             {/* Abstract background glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full"></div>
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 relative z-10">Create a New List</h2>
          <form onSubmit={handleCreateList} className="flex gap-3 relative z-10">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List Name (e.g., Grocery Shopping)"
                className="w-full bg-gray-50 dark:bg-[#0f1419] border-2 border-transparent focus:border-purple-500 dark:focus:border-purple-500 rounded-2xl px-5 py-3 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={!newListName.trim()}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-2xl px-6 py-3 font-bold transition-all flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              Create
            </button>
          </form>
        </div>

        {/* Lists Area */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading your lists...</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderPlus className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No lists yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Create your first list above to start organizing items.
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {lists.map(list => {
              const listItems = list.items || [];
              const isEditingList = editingListId === list._id;
              
              const completedCount = listItems.filter(i => i.isCompleted).length;
              const progress = listItems.length > 0 ? (completedCount / listItems.length) * 100 : 0;

              return (
                <div key={list._id} className="animate-in slide-in-from-bottom-4 duration-500 relative bg-white dark:bg-[#1a202c]/50 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden break-inside-avoid">
                  
                  {/* List Header */}
                  <div className="p-5 pb-0">
                    {isEditingList ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editListTitle}
                          onChange={(e) => setEditListTitle(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-gray-900 dark:text-white flex-1 min-w-0"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateList(list._id)}
                        />
                        <button onClick={() => handleUpdateList(list._id)} className="p-1.5 text-white bg-purple-500 rounded-lg hover:bg-purple-600">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingListId(null)} className="p-1.5 text-gray-600 bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center justify-between mb-2">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {list.name}
                        </h3>
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2">
                          <button 
                            onClick={() => { setEditingListId(list._id); setEditListTitle(list.name); }}
                            className="p-1 text-gray-400 hover:text-purple-500 rounded transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteList(list._id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 mb-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  {/* List Body */}
                  <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800/50">
                    {listItems.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No items yet.
                      </div>
                    ) : (
                      listItems.map((item) => {
                        const isEditingItem = editingItemId === item._id;

                        return (
                          <div 
                            key={item._id} 
                            className={`group flex items-center justify-between px-5 py-3 transition-colors ${
                              item.isCompleted ? 'bg-gray-50/50 dark:bg-gray-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button 
                                onClick={() => toggleItemCompletion(list._id, item._id, item.isCompleted)}
                                className={`flex-shrink-0 transition-colors ${
                                  item.isCompleted ? 'text-purple-500' : 'text-gray-300 dark:text-gray-600 hover:text-purple-400'
                                }`}
                              >
                                {item.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                              </button>
                              
                              {isEditingItem ? (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={editItemTitle}
                                    onChange={(e) => setEditItemTitle(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-2 focus:ring-purple-500 outline-none w-full text-sm text-gray-900 dark:text-white"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateItem(list._id, item._id)}
                                  />
                                  <button onClick={() => handleUpdateItem(list._id, item._id)} className="p-1 text-white bg-purple-500 rounded-md">
                                    <Check size={14} />
                                 </button>
                                </div>
                              ) : (
                                <span 
                                  onClick={() => toggleItemCompletion(list._id, item._id, item.isCompleted)}
                                  className={`text-sm transition-all truncate flex-1 cursor-pointer ${
                                    item.isCompleted 
                                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                                      : 'text-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {item.title}
                                </span>
                              )}
                            </div>
                            
                            {!isEditingItem && (
                              <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button 
                                  onClick={() => { setEditingItemId(item._id); setEditItemTitle(item.title); }}
                                  className="p-1.5 text-gray-400 hover:text-purple-500 rounded-lg"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteItem(list._id, item._id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Item form */}
                  <div className="p-3 border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20">
                     <form onSubmit={(e) => handleAddItem(list._id, e)} className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={newItemTitles[list._id] || ''}
                            onChange={(e) => setNewItemTitles({ ...newItemTitles, [list._id]: e.target.value })}
                            placeholder="Add item..."
                            className="bg-transparent border-none text-sm outline-none px-2 py-1 flex-1 text-gray-700 dark:text-gray-300 placeholder-gray-400"
                        />
                        <button type="submit" disabled={!newItemTitles[list._id]?.trim()} className="text-purple-500 disabled:opacity-50 p-1">
                            <Plus size={18} />
                        </button>
                     </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
