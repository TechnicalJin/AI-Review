import React, { useLocation, useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import ClientForm from '../../components/features/clients/ClientForm';
import AdminLayout from '../../components/layout/AdminLayout';

const EditClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateClient } = useClients();
  const client = location.state?.client;

  if (!client) {
    return <div>Client not found</div>;
  }

  const handleSubmit = async (formData, clientId) => {
    const success = await updateClient(clientId, formData);
    if (success) {
      setTimeout(() => navigate('/admin'), 1500);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin')}
        />
      </div>
    </AdminLayout>
  );
};

export default EditClient;