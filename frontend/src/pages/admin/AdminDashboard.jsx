import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import ClientTable from '../../components/features/clients/ClientTable';
import Button from '../../components/common/Button';
import AdminLayout from '../../components/layout/AdminLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { clients, loading, pagination, fetchClients, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients(0, 10);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    navigate(`/admin/clients/${client.id}/edit`, { state: { client } });
  };

  const handleDelete = (clientId) => {
    deleteClient(clientId);
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Clients</h1>
            <p>Manage your clients and their review settings</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/clients/new')}
          >
            + New Client
          </Button>
        </div>

        <div className="dashboard-filters">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <ClientTable
          clients={filteredClients}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <p>
              Page {pagination.page + 1} of {pagination.totalPages}
              ({pagination.totalElements} total)
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;