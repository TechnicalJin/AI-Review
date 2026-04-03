import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import APIService from '../../services/APIService';
import TagInput from '../../components/form/TagInput';

const inputClass =
  'w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none';

const CreateClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    reviewLink: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});

  const isValidURL = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setErrors((prev) => ({ ...prev, logo: '' }));
  };

  const addTag = () => {
    const values = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (values.length === 0) {
      return;
    }

    setTags((prev) => {
      const next = [...prev];
      values.forEach((tag) => {
        if (!next.includes(tag)) {
          next.push(tag);
        }
      });
      return next;
    });

    setTagInput('');
    setErrors((prev) => ({ ...prev, chatText: '' }));
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) nextErrors.email = 'Email is required.';
    else if (!emailRegex.test(formData.email.trim())) nextErrors.email = 'Invalid email address.';

    if (!formData.password.trim()) nextErrors.password = 'Password is required.';
    else if (formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';

    const mobileRegex = /^\d{10}$/;
    if (!formData.mobile.trim()) nextErrors.mobile = 'Mobile number is required.';
    else if (!mobileRegex.test(formData.mobile.trim())) nextErrors.mobile = 'Enter a valid 10-digit mobile number.';

    if (!formData.reviewLink.trim()) nextErrors.reviewLink = 'Review Link is required.';
    else if (!isValidURL(formData.reviewLink.trim())) nextErrors.reviewLink = 'Please enter a valid HTTP/HTTPS URL.';

    if (!logoFile) nextErrors.logo = 'Please upload a logo.';
    else if (logoFile.size > 2 * 1024 * 1024) nextErrors.logo = 'File size exceeds 2 MB.';
    else if (!['image/jpeg', 'image/png'].includes(logoFile.type)) nextErrors.logo = 'Only JPEG or PNG files are allowed.';

    if (tags.length < 10) nextErrors.chatText = 'Please add at least 10 tags.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('password', formData.password);
      submitData.append('mobile', formData.mobile.trim());
      submitData.append('reviewLink', formData.reviewLink.trim());
      submitData.append('chatText', tags.join(', '));
      submitData.append('logo', logoFile);

      await APIService.createClient(submitData);
      navigate('/user/home');
    } catch (error) {
      setGlobalError(error.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6">
      <div className="mx-auto w-full md:w-2/3 max-w-4xl">
        <div className="relative mb-4 flex items-center justify-center">
          <Link to="/user/home" className="absolute left-0 rounded bg-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-300">
            &larr; Back
          </Link>
          <h1 className="text-center text-xl font-semibold">New Client</h1>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {globalError && <p className="mb-4 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700">{globalError}</p>}

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
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass} />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="mobile" className="col-span-12 md:col-span-4 font-semibold">Mobile</label>
              <div className="col-span-12 md:col-span-8">
                <input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} />
                {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="reviewLink" className="col-span-12 md:col-span-4 font-semibold">Review Link</label>
              <div className="col-span-12 md:col-span-8">
                <input id="reviewLink" name="reviewLink" value={formData.reviewLink} onChange={handleChange} className={inputClass} />
                {errors.reviewLink && <p className="mt-1 text-sm text-red-500">{errors.reviewLink}</p>}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 gap-3">
              <label htmlFor="logo" className="col-span-12 md:col-span-4 font-semibold">Logo</label>
              <div className="col-span-12 md:col-span-8">
                <input id="logo" type="file" accept="image/jpeg,image/png" onChange={handleLogoChange} className={inputClass} />
                <p className="mt-1 text-sm text-slate-500">Up to max 2 MB (JPEG or PNG)</p>
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
                  disabled={loading}
                  className="h-10 w-full rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
              <div className="col-span-12 md:col-span-4">
                <button
                  type="button"
                  onClick={() => navigate('/user/home')}
                  className="h-10 w-full rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
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

export default CreateClient;
