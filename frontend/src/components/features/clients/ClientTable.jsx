import React from 'react';
import Button from '../../common/Button';
import './ClientTable.css';

const ClientTable = ({ clients, loading, onEdit, onDelete }) => {
  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  if (!clients || clients.length === 0) {
    return <div className="empty-state">No clients found</div>;
  }

  const handleDelete = (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      onDelete(client.id);
    }
  };

  return (
    <div className="table-responsive">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>
                <div className="client-cell">
                  {client.logoUrl && (
                    <img src={client.logoUrl} alt={client.name} className="client-thumb" />
                  )}
                  <span>{client.name}</span>
                </div>
              </td>
              <td>{client.email}</td>
              <td>{client.mobile}</td>
              <td>
                <div className="tags-cell">
                  {client.chatText?.split(',').map((tag, idx) => (
                    <span key={idx} className="tag-badge">{tag.trim()}</span>
                  ))}
                </div>
              </td>
              <td>
                <div className="actions-cell">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(client)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(client)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;