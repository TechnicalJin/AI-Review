import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import APIService from '../../services/APIService';
import { Input, Textarea } from '../../components/form';
import { FormSection, FormGrid, FormField } from '../../components/layout';

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    reviewLink: '',
  });

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Tags
  const [tags, setTags] = useState(new Set());
  const [tagInput, setTagInput] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  // Fetch existing client data
  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const client = await APIService.getClient(id);

      setFormData({
        name: client.name || '',
        email: client.email || '',
        password: '',
        mobile: client.mobile || '',
        reviewLink: client.reviewLink || '',
      });

      // Set existing logo
      if (client.logo) {
        setExistingLogo(client.logo);
        setLogoPreview(`/uploads/${client.logo}`);
      }

      // Parse and set tags
      if (client.chatText) {
        const existingTags = client.chatText
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        setTags(new Set(existingTags));
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      showError('Failed to load client data.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // URL validation
  const isValidURL = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 3 and 50 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address.';
    }

    // Password validation (only if provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // Mobile validation
    const mobileRegex = /^\d{10}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!mobileRegex.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number.';
    }

    // Review Link validation
    if (!formData.reviewLink.trim()) {
      newErrors.reviewLink = 'Review Link is required.';
    } else if (!isValidURL(formData.reviewLink)) {
      newErrors.reviewLink = 'Please enter a valid HTTP/HTTPS URL.';
    }

    // Logo validation (must have existing or new)
    if (!logoFile && !existingLogo) {
      newErrors.logo = 'Please upload a logo.';
    }

    // Tags validation
    if (tags.size < 10) {
      newErrors.chatText = 'Please add at least 10 tags.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    processLogoFile(file);
  };

  const processLogoFile = (file) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 MB for edit

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, logo: 'File size exceeds 5 MB.' }));
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, logo: 'Only JPEG or PNG files are allowed.' }));
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, logo: '' }));
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0]);
    }
  };

  // Add tags
  const addTag = useCallback(() => {
    const inputValue = tagInput.trim();

    if (!inputValue) {
      showError('Please enter a tag.');
      return;
    }

    const newTags = inputValue
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    let added = false;
    const updatedTags = new Set(tags);

    for (const tag of newTags) {
      if (!updatedTags.has(tag)) {
        updatedTags.add(tag);
        added = true;
      } else {
        showError(`Tag "${tag}" already exists!`);
      }
    }

    if (added) {
      setTags(updatedTags);
      setErrors((prev) => ({ ...prev, chatText: '' }));
    }

    setTagInput('');
  }, [tagInput, tags]);

  // Remove tag
  const removeTag = (tagToRemove) => {
    const updatedTags = new Set(tags);
    updatedTags.delete(tagToRemove);
    setTags(updatedTags);

    if (updatedTags.size < 10) {
      setErrors((prev) => ({ ...prev, chatText: 'Please add at least 10 tags.' }));
    }
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Show global error
  const showError = (message) => {
    setGlobalError(message);
    setTimeout(() => setGlobalError(''), 5000);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('mobile', formData.mobile.trim());
      submitData.append('reviewLink', formData.reviewLink.trim());
      submitData.append('chatText', Array.from(tags).join(', '));

      // Only send password if provided
      if (formData.password) {
        submitData.append('password', formData.password);
      }

      // Only send logo if new file selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      } else if (existingLogo) {
        submitData.append('existingLogo', existingLogo);
      }

      await APIService.updateClient(id, submitData);
      setGlobalSuccess('Client updated successfully!');
      setTimeout(() => navigate('/user/home'), 1500);
    } catch (error) {
      showError(error.message || 'Failed to update client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/user/home"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 motion-fast group mb-6"
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 motion-fast"></i>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <i className="fas fa-pen-to-square text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Edit Client
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Update client information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Global Messages */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="fas fa-exclamation-circle text-red-600 dark:text-red-400"></i>
              </div>
              <span className="text-red-700 dark:text-red-300 font-medium">{globalError}</span>
            </div>
          </div>
        )}

        {globalSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">{globalSuccess}</span>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <FormSection title="Basic Information" icon="fas fa-user" iconColor="amber">
              <FormGrid>
                {/* Name */}
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  label="Company Name"
                  required
                  error={errors.name}
                  icon="fas fa-building"
                />

                {/* Email */}
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@example.com"
                  label="Email Address"
                  error={errors.email}
                  icon="fas fa-envelope"
                />

                {/* Password */}
                <div className="form-group">
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                    label="Password"
                    error={errors.password}
                    icon="fas fa-lock"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Leave blank to keep the existing password</p>
                </div>

                {/* Mobile */}
                <Input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  label="Mobile Number"
                  required
                  error={errors.mobile}
                  icon="fas fa-phone"
                />

                {/* Review Link */}
                <FormField fullWidth>
                  <Input
                    type="text"
                    name="reviewLink"
                    value={formData.reviewLink}
                    onChange={handleChange}
                    placeholder="https://g.page/r/your-business/review"
                    label="Review Link"
                    required
                    error={errors.reviewLink}
                    icon="fas fa-link"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Logo Upload Section */}
            <FormSection title="Company Logo" icon="fas fa-image" iconColor="amber">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Preview */}
                {logoPreview && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Upload Area */}
                <div className="flex-1 w-full">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center motion-normal ${
                      dragActive
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : errors.logo
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                        : 'border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-cloud-upload-alt text-2xl text-amber-600 dark:text-amber-400"></i>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {existingLogo ? 'Upload new logo to replace' : 'Drag & drop your logo here'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      or <span className="text-amber-600 dark:text-amber-400 font-medium">browse</span> to choose a file
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-3">
                      Max 5 MB (JPEG or PNG)
                    </p>
                  </div>
                  {errors.logo && <p className="form-error mt-2"><i className="fas fa-exclamation-circle"></i> {errors.logo}</p>}
                </div>
              </div>
            </FormSection>

            {/* Tags Section */}
            <FormSection title="Review Tags" icon="fas fa-tags" iconColor="amber" isLast={true}>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Update the tags that describe your business services.
              </p>

              <div className="flex gap-3 mb-4">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Enter tag (use commas for multiple)"
                  error={errors.chatText}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-md btn-primary"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>

              {/* Tag Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className={`font-semibold ${tags.size >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {tags.size} / 10 tags
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full motion-slow rounded-full ${
                      tags.size >= 10 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((tags.size / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Selected Tags */}
              {tags.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from(tags).map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white motion-fast"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </FormSection>

            {/* Action Buttons */}
            <div className="p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/50 btn-group">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn btn-lg btn-primary"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spin"></div>
                    Updating Client...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Update Client
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/user/home')}
                className="flex-1 btn btn-lg btn-secondary"
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;

