import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import APIService from '../../services/APIService';
import TagInput from '../../components/form/TagInput';

const inputClass =
  'w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none';

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    reviewLink: '',
  });

  const [existingLogo, setExistingLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});

  const showError = (message) => {
    setErrorMessage(message);
    window.setTimeout(() => {
      setErrorMessage('');
    }, 4000);
  };

  useEffect(() => {
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

        if (client.logo) {
          setExistingLogo(client.logo);
          setLogoPreview(`/uploads/${client.logo}`);
        }

        if (client.chatText) {
          const parsedTags = client.chatText
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
          setTags([...new Set(parsedTags)]);
        }
      } catch {
        showError('Failed to load client data.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
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
  };

  const addTag = () => {
    const values = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (values.length === 0) {
      showError('Please enter a tag.');
      return;
    }

    const nextTags = [...tags];
    values.forEach((tag) => {
      if (!nextTags.includes(tag)) {
        nextTags.push(tag);
      } else {
        showError(`Tag "${tag}" already exists!`);
      }
    });

    setTags(nextTags);
    setTagInput('');
    setErrors((prev) => ({ ...prev, chatText: '' }));
  };

  const removeTag = (tagToRemove) => {
    const next = tags.filter((tag) => tag !== tagToRemove);
    setTags(next);
    if (next.length < 10) {
      setErrors((prev) => ({ ...prev, chatText: 'You must add at least 10 tags.' }));
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const isValidURL = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Invalid email address.';
    }

    if (formData.password.trim() && formData.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile.trim())) {
      nextErrors.mobile = 'Enter a valid 10-digit mobile number.';
    }

    if (!formData.reviewLink.trim()) {
      nextErrors.reviewLink = 'Review Link is required.';
    } else if (!isValidURL(formData.reviewLink.trim())) {
      nextErrors.reviewLink = 'Invalid Review Link format.';
    }

    if (!logoFile && !existingLogo) {
      nextErrors.logo = 'Please upload a logo.';
    }

    if (tags.length < 10) {
      nextErrors.chatText = 'You must add at least 10 tags.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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
      submitData.append('chatText', tags.join(', '));

      if (formData.password.trim()) {
        submitData.append('password', formData.password.trim());
      }

      if (logoFile) {
        submitData.append('logo', logoFile);
      } else if (existingLogo) {
        submitData.append('existingLogo', existingLogo);
      }

      await APIService.updateClient(id, submitData);
      navigate('/user/home');
    } catch (error) {
      showError(error.message || 'Failed to update client.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] px-4 py-6">
        <div className="mx-auto mt-24 text-center text-slate-600">Loading client data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b bg-slate-100 px-4 py-3">
        <div className="mx-auto w-full max-w-[1200px]">
          <Link to="/user/home" className="inline-flex items-center gap-2 rounded bg-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-300">
            <FiArrowLeft />
            Back
          </Link>
        </div>
      </nav>

      <div className="px-4 py-6">
        <div className="mx-auto w-full max-w-[900px] animate-[fadeIn_0.4s_ease-out] rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-8 text-center text-2xl font-semibold">Edit Client</h2>

          {errorMessage && (
            <div className="mb-5 rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
              <div className="flex items-center gap-2">
                <FiAlertTriangle />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="name" className="col-span-12 md:col-span-4 font-semibold">Name</label>
              <div className="col-span-12 md:col-span-8">
                <input id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="email" className="col-span-12 md:col-span-4 font-semibold">Email</label>
              <div className="col-span-12 md:col-span-8">
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="password" className="col-span-12 md:col-span-4 font-semibold">Password</label>
              <div className="col-span-12 md:col-span-8">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                <p className="mt-1 text-sm text-slate-500">Leave blank to keep current password</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="mobile" className="col-span-12 md:col-span-4 font-semibold">Mobile</label>
              <div className="col-span-12 md:col-span-8">
                <input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} maxLength={10} />
                {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="reviewLink" className="col-span-12 md:col-span-4 font-semibold">Review Link</label>
              <div className="col-span-12 md:col-span-8">
                <input
                  id="reviewLink"
                  name="reviewLink"
                  value={formData.reviewLink}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.reviewLink && <p className="mt-1 text-sm text-red-500">{errors.reviewLink}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="logo" className="col-span-12 md:col-span-4 font-semibold">Logo</label>
              <div className="col-span-12 md:col-span-8">
                {logoPreview && (
                  <div className="mb-3">
                    <img src={logoPreview} alt="Current Logo" className="h-20 w-20 rounded border object-cover" />
                  </div>
                )}
                <input id="logo" type="file" accept="image/jpeg,image/png" onChange={handleLogoChange} className={inputClass} />
                <p className="mt-1 text-sm text-slate-500">Up to max 5 MB (JPEG or PNG)</p>
                {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label className="col-span-12 md:col-span-4 font-semibold">Chat Text</label>
              <div className="col-span-12 md:col-span-8">
                <TagInput
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onAdd={addTag}
                  onKeyDown={handleTagKeyDown}
                  tags={tags}
                  onRemove={removeTag}
                  error={errors.chatText}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 pt-2">
              <div className="hidden md:block md:col-span-4" />
              <div className="col-span-12 md:col-span-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 w-full rounded bg-indigo-600 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-60"
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
              <div className="col-span-12 md:col-span-4">
                <button
                  type="button"
                  onClick={() => navigate('/user/home')}
                  className="h-10 w-full rounded bg-slate-200 text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;
