import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import "../styles/dashboard.css";
import { Calendar, CheckCircle, Plus } from 'lucide-react';

const TaskUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    deadline: '',
    status: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchTaskDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const task = res?.data.task;
      console.log('Fetched task details:', task);

      if (task) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          category: task.category || '',
          deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
          status: task.status || '',
          image: null,
        });
        if (task.imageUrl) {
          setImagePreview(`http://localhost:5000${task.imageUrl}`);
        }
      } else {
        toast.error('Task data not found');
      }
    } catch (err) {
      console.error('Fetch Error:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Error fetching task details');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for update');
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }
  
    const formData = new FormData();
    
    // Append all fields except image if it's not changed
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('deadline', form.deadline);
    formData.append('status', form.status);
    
    // Only append image if a new one was selected
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/tasks/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('✅ Task updated successfully');
      
      // Navigate to dashboard with state to trigger refresh
      navigate('/', { 
        state: { 
          shouldRefresh: true,
          updatedTask: res.data.task // Pass the updated task data
        } 
      });
      
    } catch (err) {
      console.error('Update Error:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Error updating task');
      }
    }
  };
  
  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl mt-10 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-indigo-600" />
        Update Task
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            aria-label="Task title"
          />
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
            aria-label="Task description"
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
            aria-label="Task category"
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
            aria-label="Task deadline"
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
            aria-label="Task status"
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
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
              aria-label="Upload task image"
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
        <button
          type="submit"
          className="btn-submit flex items-center justify-center gap-2"
          aria-label="Update task"
        >
          <Plus className="w-5 h-5" />
          Update Task
        </button>
      </form>
    </div>
  );
};

export default TaskUpdate;
