import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    salary: '',
    salaryType: 'fixed',
    duration: '',
    experienceLevel: 'intermediate',
    requirements: '',
    deadline: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert tags and requirements to arrays
      const jobData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        salary: Number(formData.salary),
      };

      await companyAPI.postJob(jobData);
      toast.success('Job posted successfully!');
      navigate('/company/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <Input
            label="Job Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Full Stack Developer"
            required
          />

          <div>
            <label className="label">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job in detail..."
              rows="6"
              required
              className="input-field"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="label">Experience Level *</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <Input
            label="Skills/Tags (comma-separated)"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Budget/Salary"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="5000"
              required
            />

            <div>
              <label className="label">Salary Type *</label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Duration"
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 2 months"
              required
            />

            <Input
              label="Deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Requirements (one per line)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="- 3+ years of experience&#10;- Strong knowledge of React&#10;- Portfolio required"
              rows="6"
              className="input-field"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Post Job
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/company/jobs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;