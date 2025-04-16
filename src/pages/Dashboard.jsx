import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import "../styles/dashboard.css";
import { Calendar, CheckCircle, Clock, Edit, Trash2, Plus, LogOut, Image as ImageIcon } from 'lucide-react';
import React from 'react';

const Dashboard = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    deadline: '',
    status: '',
    image: null,
  });

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/tasks/get', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tasksWithFullImageUrls = res.data.data.map(task => ({
        ...task,
        imageUrl: task.imageUrl 
          ? task.imageUrl.startsWith('http') 
            ? task.imageUrl 
            : `http://localhost:5000/${task.imageUrl}`
          : null
      }));

      setTasks(tasksWithFullImageUrls || []);
    } catch (err) {
      console.error('Error fetching tasks:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Error fetching tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // If updated task is passed through location
    if (location.state?.updatedTask) {
      const updated = location.state.updatedTask;

      setTasks(prev =>
        prev.map(task =>
          task._id === updated._id
            ? {
                ...updated,
                imageUrl: updated.imageUrl
                  ? updated.imageUrl.startsWith('http')
                    ? updated.imageUrl
                    : `http://localhost:5000/${updated.imageUrl}`
                  : null,
              }
            : task
        )
      );

      // Clear location state after applying update
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Optionally refresh on state trigger (like after adding a new task)
    if (location.state?.shouldRefresh) {
      fetchTasks();
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      fetchTasks();
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/tasks/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    
      // 🛠 Extract correct task object
      const createdTask = response.data?.task;
    
      const newTask = {
        ...createdTask,
        imageUrl: createdTask?.imageUrl
          ? `http://localhost:5000${createdTask.imageUrl}`
          : null,
      };
    
      // ✅ Update tasks
      setTasks(prev => [newTask, ...prev]);
    
      // ✅ Show success
      toast.success('Task created successfully!');
    
      // ✅ Reset form
      setForm({
        title: '',
        description: '',
        category: '',
        deadline: '',
        status: '',
        image: null,
      });
      setImagePreview(null);
    
    } catch (err) {
      console.error('Error creating task:', err.response?.data || err.message);
    
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Error creating task');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setForm({ ...form, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Task deleted');
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Error deleting task');
      }
    }
  };

  const filteredTasks = tasks.filter((task) =>
    filter === 'all' ? true : task.status === filter
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      
      
      
        {/* Header */}
        <header className="flex justify-between items-center mb-8 w-full">
  {/* Left Side - Heading */}
 
 
  <div className="flex items-center gap-2">
    <Calendar className="w-8 h-8 text-indigo-600" />
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Task Manager</h1>
  </div>



  {/* Right Side - Logout Button */}
  <button
      onClick={() => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login');
      }}
      className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-red px-4 py-2 rounded-lg transition-all"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
</header>



        {/* Form */}
        <section className="bg-white p-6 rounded-xl shadow-sm mb-10 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Task Title"
                  className="input-style"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Category"
                  className="input-style"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  className="input-style"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-style"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Task Description"
                className="input-style h-24 resize-none"
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="file-input-style"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>
            </div>
            <button type="submit" className="btn-submit flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </form>
        </section>



        {/* Filter Bar */}
        <section className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all filter-btn ${
              filter === 'all' ? 'active' : ''
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all filter-btn ${
              filter === 'pending' ? 'active' : ''
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-all filter-btn ${
              filter === 'in-progress' ? 'active' : ''
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all filter-btn ${
              filter === 'completed' ? 'active' : ''
            }`}
          >
            Completed
          </button>
        </section>


        {/* Task List */}
        {loading ? (
          <div className="text-center py-10">
            <div className="loader"></div>
            <p className="text-gray-600 mt-4">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
            <p className="text-gray-600 mt-4">No tasks found. Create one to get started!</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="task-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {task.imageUrl ? (
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                    className="w-full h-40 object-cover rounded-t-xl"
                    onError={(e) => {
                       e.target.src = 'https://via.placeholder.com/300x160?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-xl">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                  <div className="mt-4 text-sm text-gray-500 space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <strong>Status:</strong>{' '}
                      <span
                        className={`capitalize ${
                          task.status === 'completed'
                            ? 'text-green-600'
                            : task.status === 'in-progress'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {task.status}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <strong>Category:</strong> {task.category}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <strong>Deadline:</strong>{' '}
                      {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between mt-4 gap-2">
                    <button
                      onClick={() => navigate(`/update-task/${task._id}`)}
                      className="btn-update flex items-center justify-center gap-2 flex-1"
                    >
                      <Edit className="w-4 h-4" />
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="btn-delete flex items-center justify-center gap-2 flex-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Dashboard;