import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Shield,
  MapPin,
  Building,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApiKeyStore } from '../../store/apiKeyStore';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const ManageApiKeysPage = () => {
  const {
    apiKeys,
    isLoading,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey
  } = useApiKeyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // Filter API keys based on search and filters
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = 
      key.keyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || key.department === departmentFilter;
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'static' && key.isStatic) ||
      (typeFilter === 'dynamic' && !key.isStatic);

    return matchesSearch && matchesDepartment && matchesType;
  });

  // Get unique departments for filter
  const departments = [...new Set(apiKeys.map(key => key.department).filter(Boolean))];

  const handleCreateKey = async (keyData) => {
    try {
      setIsSubmitting(true);
      await createApiKey(keyData);
      setShowApiKeyForm(false);
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateKey = async (keyData) => {
    try {
      setIsSubmitting(true);
      await updateApiKey(editingKey.keyId, keyData);
      setShowApiKeyForm(false);
      setEditingKey(null);
    } catch (error) {
      console.error('Error updating API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteApiKey(keyToDelete.keyId);
      setShowDeleteModal(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (key) => {
    setEditingKey(key);
    setShowApiKeyForm(true);
  };

  const openDeleteModal = (key) => {
    setKeyToDelete(key);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowApiKeyForm(false);
    setEditingKey(null);
    setShowDeleteModal(false);
    setKeyToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            Manage API Keys
          </h1>
          <p className="text-gray-400">
            Add, edit, and manage all API keys in the system
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search API keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="static">Static Keys</option>
                <option value="dynamic">Dynamic Keys</option>
              </select>
            </div>

            {/* Add Key Button */}
            <button
              onClick={() => setShowApiKeyForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New API Key
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{apiKeys.length}</div>
              <div className="text-sm text-gray-400">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {apiKeys.filter(k => k.isActive).length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {apiKeys.filter(k => k.isStatic).length}
              </div>
              <div className="text-sm text-gray-400">Static</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {departments.length}
              </div>
              <div className="text-sm text-gray-400">Departments</div>
            </div>
          </div>
        </motion.div>

        {/* API Keys Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No API keys found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery || departmentFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first API key to get started'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Key Info</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Permissions</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Usage</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredKeys.map((key) => (
                    <ApiKeyTableRow
                      key={key.id}
                      keyData={key}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && keyToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeModals}
          onConfirm={handleDeleteKey}
          keyData={keyToDelete}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

// API Key Table Row Component
const ApiKeyTableRow = ({ keyData, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    handleSuccess('API key copied to clipboard');
  };

  const getPermissionBadges = (permissions) => {
    const badges = [];
    if (permissions.read) badges.push({ label: 'R', color: 'bg-green-600' });
    if (permissions.write) badges.push({ label: 'W', color: 'bg-yellow-600' });
    if (permissions.delete) badges.push({ label: 'D', color: 'bg-red-600' });
    return badges;
  };

  return (
    <tr className="hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{keyData.keyId}</span>
              {keyData.isStatic && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                  Static
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">{keyData.keyName}</div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showApiKey ? 'Hide' : 'Show'} Key
              </button>
              {showApiKey && (
                <button
                  onClick={() => copyToClipboard(keyData.apiKey)}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              )}
            </div>
            {showApiKey && (
              <div className="text-xs text-gray-500 font-mono mt-1 break-all">
                {keyData.apiKey}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{keyData.department}</span>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {keyData.rateLimit.requestsPerMinute}/min, {keyData.rateLimit.requestsPerHour}/hr
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1">
          {getPermissionBadges(keyData.permissions).map((badge, index) => (
            <span
              key={index}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium text-white ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-300">{keyData.usageCount || 0}</div>
        <div className="text-sm text-gray-400">
          {keyData.lastUsed ? new Date(keyData.lastUsed).toLocaleDateString() : 'Never'}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(keyData);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-600 flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              {!keyData.isStatic && (
                <button
                  onClick={() => {
                    onDelete(keyData);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-600 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, keyData, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Delete API Key</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete API key <strong>{keyData.keyId}</strong>? 
            This action cannot be undone and will revoke access for all applications using this key.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageApiKeysPage;
