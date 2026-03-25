import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import APIService from '../../services/APIService';

// Import modular components
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import StatCard from '../../components/dashboard/StatCard';
import ClientCard, { ClientCardSkeleton } from '../../components/dashboard/ClientCard';

const UserHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchClients();

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileSidebarOpen(false);
        setSidebarOpen(true);
      } else if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await APIService.getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await APIService.deleteClient(clientToDelete.id);
      setClients(clients.filter((c) => c.id !== clientToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden motion-slow">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Component with Theme Toggle */}
        <Navbar
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          user={user}
          title="Client Dashboard"
          subtitle={
            <>
              Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.username || 'Admin'}</span>
            </>
          }
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Search and Add Button */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 motion-normal shadow-sm"
                />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 motion-fast"></i>
              </div>
            </div>
            <Link
              to="/user/create"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold motion-normal flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <i className="fas fa-plus"></i>
              <span>Add Client</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              icon="fas fa-users"
              label="Total Clients"
              value={clients.length}
              color="indigo"
              trend="+12%"
            />
            <StatCard
              icon="fas fa-circle-check"
              label="Active"
              value={clients.length}
              color="emerald"
              trend="+8%"
            />
            <StatCard
              icon="fas fa-star"
              label="Reviews"
              value="-"
              color="amber"
            />
            <StatCard
              icon="fas fa-arrow-trend-up"
              label="This Month"
              value="-"
              color="purple"
            />
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <i className="fas fa-building text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clients</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {/* Clients Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ClientCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClients.map((client, index) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onDelete={() => openDeleteModal(client)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-inbox"></i>
                </div>
                <h3 className="empty-state-title">
                  {searchTerm ? 'No clients found' : 'No clients yet'}
                </h3>
                <p className="empty-state-description">
                  {searchTerm
                    ? 'Try a different search term or clear your search'
                    : 'Create your first client to get started with review generation'}
                </p>
                {!searchTerm && (
                  <Link
                    to="/user/create"
                    className="btn btn-md btn-primary"
                  >
                    <i className="fas fa-plus"></i>
                    Create Your First Client
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-trash-can text-red-500 text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Delete Client?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-300">{clientToDelete?.name}</strong>? This action cannot be undone.
              </p>

              <div className="btn-group">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 btn btn-md btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 btn btn-md btn-danger"
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash-can"></i>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;


