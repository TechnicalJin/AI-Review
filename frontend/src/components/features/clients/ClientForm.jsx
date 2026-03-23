import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../hooks/useNotification';
import Input from '../../common/Input';
import Button from '../../common/Button';
import './ClientForm.css';

const ClientForm = ({ client = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    reviewLink: '',
    chatText: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showError } = useNotification();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        password: '',
        mobile: client.mobile || '',
        reviewLink: client.reviewLink || '',
        chatText: client.chatText || ''
      });
      if (client.logoUrl) {
        setLogoPreview(client.logoUrl);
      }
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!client && !formData.password) newErrors.password = 'Password is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    if (!formData.reviewLink) newErrors.reviewLink = 'Review link is required';
    if (!formData.chatText) newErrors.chatText = 'Chat text/tags are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('reviewLink', formData.reviewLink);
      formDataToSend.append('chatText', formData.chatText);
      if (logo) {
        formDataToSend.append('logo', logo);
      }

      await onSubmit(formDataToSend, client?.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-section">
        <h3>{client ? 'Edit Client' : 'Create New Client'}</h3>

        <Input
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required={!client}
          placeholder={client ? 'Leave blank to keep existing' : 'Enter password'}
        />

        <Input
          label="Mobile"
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleInputChange}
          error={errors.mobile}
          required
        />

        <Input
          label="Review Link"
          type="url"
          name="reviewLink"
          value={formData.reviewLink}
          onChange={handleInputChange}
          error={errors.reviewLink}
          required
          placeholder="https://google.com/reviews/..."
        />

        <Input
          label="Chat Text / Tags (comma separated)"
          type="text"
          name="chatText"
          value={formData.chatText}
          onChange={handleInputChange}
          error={errors.chatText}
          required
          placeholder="quality, service, speed, value"
        />
      </div>

      <div className="form-section">
        <h3>Logo</h3>
        <div className="logo-upload">
          {logoPreview && (
            <img src={logoPreview} alt="Logo preview" className="logo-preview" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="file-input"
          />
          <p className="file-input-label">
            {logo ? logo.name : 'Click to upload logo'}
          </p>
        </div>
      </div>

      <div className="form-actions">
        <Button
          variant="primary"
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {client ? 'Update Client' : 'Create Client'}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;