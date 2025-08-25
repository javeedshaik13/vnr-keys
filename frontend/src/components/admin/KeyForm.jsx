import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';

const KeyForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isLoading = false,
  title = "Add New Key" 
}) => {
  const [formData, setFormData] = useState({
    keyNumber: '',
    keyName: '',
    location: '',
    description: '',
    category: '',
    block: '',
    frequentlyUsed: false
  });

  const [errors, setErrors] = useState({});

  // Categories for dropdown
  const categories = [
    'Classroom',
    'Laboratory',
    'Office',
    'Storage',
    'Maintenance',
    'Security',
    'Other'
  ];

  // Blocks for dropdown
  const blocks = [
    'A Block',
    'B Block', 
    'C Block',
    'D Block',
    'E Block',
    'F Block',
    'G Block',
    'H Block',
    'Main Building',
    'Library',
    'Auditorium',
    'Cafeteria',
    'Hostel',
    'Other'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        keyNumber: initialData.keyNumber || '',
        keyName: initialData.keyName || '',
        location: initialData.location || '',
        description: initialData.description || '',
        category: initialData.category || '',
        block: initialData.block || '',
        frequentlyUsed: initialData.frequentlyUsed || false
      });
    } else {
      setFormData({
        keyNumber: '',
        keyName: '',
        location: '',
        description: '',
        category: '',
        block: '',
        frequentlyUsed: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.keyNumber.trim()) {
      newErrors.keyNumber = 'Key number is required';
    }

    if (!formData.keyName.trim()) {
      newErrors.keyName = 'Key name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.block) {
      newErrors.block = 'Block is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {initialData ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Key Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Number *
            </label>
            <input
              type="text"
              value={formData.keyNumber}
              onChange={(e) => handleInputChange('keyNumber', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.keyNumber ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="e.g., CSE-101, LAB-A-01"
              disabled={isLoading}
            />
            {errors.keyNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.keyNumber}</p>
            )}
          </div>

          {/* Key Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Name *
            </label>
            <input
              type="text"
              value={formData.keyName}
              onChange={(e) => handleInputChange('keyName', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.keyName ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="e.g., Computer Lab 1, Faculty Room"
              disabled={isLoading}
            />
            {errors.keyName && (
              <p className="text-red-400 text-sm mt-1">{errors.keyName}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="e.g., Ground Floor, Room 101"
              disabled={isLoading}
            />
            {errors.location && (
              <p className="text-red-400 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Category and Block - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Block */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Block *
              </label>
              <select
                value={formData.block}
                onChange={(e) => handleInputChange('block', e.target.value)}
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.block ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={isLoading}
              >
                <option value="">Select Block</option>
                {blocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
              {errors.block && (
                <p className="text-red-400 text-sm mt-1">{errors.block}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details about this key..."
              disabled={isLoading}
            />
          </div>

          {/* Frequently Used */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="frequentlyUsed"
              checked={formData.frequentlyUsed}
              onChange={(e) => handleInputChange('frequentlyUsed', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <label htmlFor="frequentlyUsed" className="ml-2 text-sm text-gray-300">
              Mark as frequently used
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {initialData ? 'Update Key' : 'Create Key'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default KeyForm;
