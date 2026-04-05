import React, { useState } from 'react';
import EmployeeLayout from '../../components/Layout/EmployeeLayout';
import { dayPlanAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const DayPlanEntry = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    planTitle: '',
    description: '',
    planDate: new Date().toISOString().split('T')[0],
    tasks: []
  });
  const [currentTask, setCurrentTask] = useState({
    taskTitle: '',
    taskDescription: '',
    taskTime: ''
  });

  const addTask = () => {
    if (!currentTask.taskTitle) {
      toast.error('Please enter task title');
      return;
    }
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { ...currentTask, completed: false }]
    });
    setCurrentTask({ taskTitle: '', taskDescription: '', taskTime: '' });
  };

  const removeTask = (index) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.planTitle) {
      toast.error('Please enter plan title');
      return;
    }
    
    setLoading(true);
    try {
      const planData = {
        ...formData,
        user: { id: user?.id },
        status: 'PENDING'
      };
      await dayPlanAPI.create(planData);
      toast.success('Day plan submitted for approval!');
      setFormData({
        planTitle: '',
        description: '',
        planDate: new Date().toISOString().split('T')[0],
        tasks: []
      });
    } catch (error) {
      console.error('Error creating day plan:', error);
      toast.error('Failed to submit day plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Day Plan</h1>
          <p className="text-gray-500 text-sm mt-1">Plan your daily tasks and submit for admin approval</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title *</label>
              <input
                type="text"
                value={formData.planTitle}
                onChange={(e) => setFormData({...formData, planTitle: e.target.value})}
                placeholder="e.g., Daily Sales Tasks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Brief overview of your day plan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.planDate}
                onChange={(e) => setFormData({...formData, planDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Tasks Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tasks</label>
              
              {/* Add Task Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={currentTask.taskTitle}
                  onChange={(e) => setCurrentTask({...currentTask, taskTitle: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={currentTask.taskDescription}
                  onChange={(e) => setCurrentTask({...currentTask, taskDescription: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={currentTask.taskTime}
                    onChange={(e) => setCurrentTask({...currentTask, taskTime: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              {formData.tasks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{task.taskTitle}</p>
                        {task.taskDescription && (
                          <p className="text-sm text-gray-500">{task.taskDescription}</p>
                        )}
                        {task.taskTime && (
                          <p className="text-xs text-gray-400 mt-1">🕐 {task.taskTime}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  planTitle: '',
                  description: '',
                  planDate: new Date().toISOString().split('T')[0],
                  tasks: []
                });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
};

export default DayPlanEntry;