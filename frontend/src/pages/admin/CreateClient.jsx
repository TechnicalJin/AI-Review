import React, { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import ClientForm from '../../components/features/clients/ClientForm';
import AdminLayout from '../../components/layout/AdminLayout';

const CreateClient = () => {
  const navigate = useNavigate();
  const { createClient } = useClients();

  const handleSubmit = async (formData) => {
    const success = await createClient(formData);
    if (success) {
      setTimeout(() => navigate('/admin'), 1500);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin')}
        />
      </div>
    </AdminLayout>
  );
};

export default CreateClient;