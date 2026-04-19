import React, { useState, useEffect } from 'react';
import { donorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Save, MapPin, Phone, Heart, Users, Droplet, Calendar as CalendarIcon } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        bio: '',
        address: {
            city: '',
            state: '',
            country: 'India',
            landmark: ''
        },
        skills: [],
        interests: [],
        donationTypes: [],
        availability: 'anytime',
        preferences: {
            volunteerInvolvement: true,
            monetaryDonation: true,
            donationCategories: [],
            preferredFrequency: 'one-time'
        },
        bloodType: '',
        lastBloodDonationDate: ''
    });

    const interestOptions = [
        'Education', 'Healthcare', 'Environment & Cleanliness', 'Disaster Relief',
        'Animal Welfare', 'Women Empowerment', 'Child Welfare', 'Afforestation & Tree Plantation',
        'Rural Development', 'Technology for Social Good', 'Farmer Welfare & Agriculture',
        'Climate Change Action', 'Food Donation'
    ];

    const donationTypeOptions = ['money', 'time', 'goods', 'blood'];

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    const availabilityOptions = ['weekdays', 'weekends', 'anytime', 'specific events'];

    const frequencyOptions = ['one-time', 'monthly', 'quarterly', 'yearly'];

    useEffect(() => {
        fetchProfile();
    }, []);

    // Update the fetchProfile function
    const fetchProfile = async () => {
  try {
    const response = await donorAPI.getUser(); // No token in body
    console.log('Profile fetch response:', response.data);
    
    if (response.data.profile) {
      const profileData = response.data.profile;
      setFormData({
        bio: profileData.bio || '',
        address: profileData.address || { city: '', state: '', country: 'India', landmark: '' },
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        donationTypes: profileData.donationTypes || [],
        availability: profileData.availability || 'anytime',
        preferences: profileData.preferences || {
          volunteerInvolvement: true,
          monetaryDonation: true,
          donationCategories: [],
          preferredFrequency: 'one-time'
        },
        bloodType: profileData.bloodType || '',
        lastBloodDonationDate: profileData.lastBloodDonationDate?.split('T')[0] || ''
      });
    } else {
      console.log('No profile found, creating new one');
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    toast.error('Failed to fetch profile');
  } finally {
    setLoading(false);
  }
};

    // Update the handleSubmit function


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            if (type === 'checkbox') {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: checked
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...formData.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const addSkill = () => {
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { name: '', level: 'beginner' }]
        }));
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await donorAPI.createOrUpdateProfile(formData);
            console.log('Profile save response:', response.data);
            toast.success('Profile saved successfully!');
            fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Profile save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">About Me</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="Tell us about yourself and your passion for social causes..."
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <MapPin size={20} className="mr-2" />
                        Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                            <input
                                type="text"
                                name="address.landmark"
                                value={formData.address.landmark}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Skill name"
                                value={skill.name}
                                onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <select
                                value={skill.level}
                                onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                                className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSkill}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm"
                    >
                        + Add Skill
                    </button>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Heart size={20} className="mr-2" />
                        Areas of Interest
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {interestOptions.map(interest => (
                            <label key={interest} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.interests.includes(interest)}
                                    onChange={() => handleArrayField('interests', interest)}
                                    className="w-4 h-4 text-red-600"
                                />
                                <span className="text-sm text-gray-700">{interest}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Donation Types */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Ways to Contribute</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {donationTypeOptions.map(type => (
                            <label key={type} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.donationTypes.includes(type)}
                                    onChange={() => handleArrayField('donationTypes', type)}
                                    className="w-4 h-4 text-red-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Blood Donation Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Droplet size={20} className="mr-2 text-red-500" />
                        Blood Donation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                            <select
                                name="bloodType"
                                value={formData.bloodType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select blood type</option>
                                {bloodTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Blood Donation Date</label>
                            <input
                                type="date"
                                name="lastBloodDonationDate"
                                value={formData.lastBloodDonationDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Availability & Preferences */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Users size={20} className="mr-2" />
                        Availability & Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                            <select
                                name="availability"
                                value={formData.availability}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {availabilityOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Frequency</label>
                            <select
                                name="preferences.preferredFrequency"
                                value={formData.preferences.preferredFrequency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {frequencyOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="preferences.volunteerInvolvement"
                                checked={formData.preferences.volunteerInvolvement}
                                onChange={handleChange}
                                className="w-4 h-4 text-red-600"
                            />
                            <span className="text-gray-700">Interested in volunteering opportunities</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="preferences.monetaryDonation"
                                checked={formData.preferences.monetaryDonation}
                                onChange={handleChange}
                                className="w-4 h-4 text-red-600"
                            />
                            <span className="text-gray-700">Interested in making monetary donations</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;