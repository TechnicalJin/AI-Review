import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0
  });

  const { token } = useAuth();
  const { showSuccess, showError } = useNotification();

  const fetchClients = useCallback(async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/clients?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.content);
      setPagination({
        page: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      });
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  const createClient = useCallback(async (formData) => {
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create client');
      }

      showSuccess('Client created successfully');
      fetchClients(0);
      return true;
    } catch (err) {
      showError(err.message);
      return false;
    }
  }, [token, showSuccess, showError, fetchClients]);

  const updateClient = useCallback(async (clientId, formData) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update client');
      }

      showSuccess('Client updated successfully');
      fetchClients(pagination.page);
      return true;
    } catch (err) {
      showError(err.message);
      return false;
    }
  }, [token, showSuccess, showError, pagination.page, fetchClients]);

  const deleteClient = useCallback(async (clientId) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete client');

      showSuccess('Client deleted successfully');
      fetchClients(pagination.page);
      return true;
    } catch (err) {
      showError(err.message);
      return false;
    }
  }, [token, showSuccess, showError, pagination.page, fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};