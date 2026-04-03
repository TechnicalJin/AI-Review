import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUsers, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import APIService from '../../services/APIService';
import Sidebar from '../../components/userDashboard/Sidebar';
import Header from '../../components/userDashboard/Header';
import ClientTable from '../../components/userDashboard/ClientTable';
import Pagination from '../../components/userDashboard/Pagination';

const ITEMS_PER_PAGE = 10;

const mockClients = [
  {
    id: 1,
    name: 'ABC',
    email: 'abc@example.com',
    mobile: '9876543210',
    logo: '',
    chatText: 'Digital Marketing Services, Website and SEO package details...',
    reviewLink: 'https://g.page/r/CZ-ABC123/review',
    downloadLink: '#',
  },
  {
    id: 2,
    name: '3Ace Infotech',
    email: '3ace@example.com',
    mobile: '9620254120',
    logo: '',
    chatText: 'WhatsApp Solutions, Automation and CRM integration services...',
    reviewLink: 'https://g.page/r/CZ-DEF456/review',
    downloadLink: '#',
  },
];

const UserHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await APIService.getClients();
        const clientList = Array.isArray(data) && data.length > 0 ? data : mockClients;
        setClients(clientList);
      } catch {
        setClients(mockClients);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) => {
      return (
        (client.name || '').toLowerCase().includes(query) ||
        (client.email || '').toLowerCase().includes(query) ||
        (client.mobile || '').toLowerCase().includes(query)
      );
    });
  }, [clients, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));

  const paginatedClients = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredClients.slice(start, end).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      mobile: client.mobile,
      logo: client.logo,
      chatText: client.chatText,
      reviewLink: client.reviewLink,
      generateLink: client.generateLink,
      downloadLink: client.downloadLink,
    }));
  }, [currentPage, filteredClients]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setClientToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await APIService.deleteClient(clientToDelete.id);
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      closeDeleteModal();
    } catch {
      window.alert('Failed to delete client. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    const boundedPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(boundedPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <main className="transition-all duration-300 md:ml-64">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <section className="animate-[fadeIn_0.8s_ease-in-out] p-6">
          <div className="mb-8">
            <h2 className="mb-2 flex items-center text-3xl font-bold text-slate-800">
              <FiUsers className="mr-3 text-indigo-500" />
              Client Management
            </h2>
            <p className="text-slate-600">Manage your clients and their review links</p>
          </div>

          <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <form className="flex flex-col gap-4 md:flex-row" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search by name, mobile or email..."
                  aria-label="Search by name, mobile or email"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-indigo-500 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:shadow-xl"
              >
                <FiSearch className="mr-2" />
                Search
              </button>
            </form>

            {searchTerm && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-slate-700">
                    {filteredClients.length > 0 ? (
                      <span>
                        Found <strong className="text-indigo-500">{filteredClients.length}</strong> results for{' '}
                        <strong className="text-slate-800">"{searchTerm}"</strong>
                      </span>
                    ) : (
                      <span>
                        No results found for <strong className="text-slate-800">"{searchTerm}"</strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="flex items-center rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-300"
                  >
                    <FiX className="mr-2" />
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </section>

          <ClientTable loading={loading} clients={paginatedClients} searchTerm={searchTerm} onDelete={openDeleteModal} />

          {!loading && filteredClients.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              currentItemsCount={paginatedClients.length}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-7 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">🗑</div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">Delete Client?</h2>
              <p className="mb-6 text-sm text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-700">{clientToDelete?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
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
