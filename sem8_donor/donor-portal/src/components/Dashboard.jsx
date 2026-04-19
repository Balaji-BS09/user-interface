import React, { useState, useEffect } from 'react';
import { donorAPI } from '../services/api';
import { Heart, Target, TrendingUp, Award, Clock, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const donorData = JSON.parse(localStorage.getItem('donorData') || '{}');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch user data with profile - NO token in body needed
            const userResponse = await donorAPI.getUser();
            console.log('User Response:', userResponse.data);

            if (userResponse.data.user) {
                setUserData(userResponse.data.user);
            }
            if (userResponse.data.profile) {
                setProfile(userResponse.data.profile);
            }

            // Fetch recommendations
            try {
                const recommendationsRes = await donorAPI.getRecommendations();
                console.log('Recommendations Response:', recommendationsRes.data);
                setRecommendations(recommendationsRes.data.data || []);
            } catch (recError) {
                console.error('Recommendations error:', recError);
                setRecommendations([]);
            }

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats based on available data
    const stats = [
        {
            title: 'Profile Status',
            value: profile?.isCompleted ? 'Completed' : 'Incomplete',
            icon: User,
            color: profile?.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
        },
        {
            title: 'Interests',
            value: profile?.interests?.length || 0,
            icon: Heart,
            color: 'bg-red-500'
        },
        {
            title: 'Recommendations',
            value: recommendations.length,
            icon: TrendingUp,
            color: 'bg-blue-500'
        },
        {
            title: 'Impact Score',
            value: profile?.participationScore || 0,
            icon: Award,
            color: 'bg-purple-500'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">Welcome back, <strong>{userData?.name || donorData.name}</strong>!</p>
                <p className="text-blue-600 text-sm mt-1">Email: {userData?.email || donorData.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-full`}>
                                <stat.icon className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Summary */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Profile Summary</h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {profile?.bio && (
                            <div>
                                <p className="text-sm text-gray-500">Bio</p>
                                <p className="text-gray-700">{profile.bio}</p>
                            </div>
                        )}
                        {profile?.address && profile.address.city && (
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="text-gray-700">{profile.address.city}, {profile.address.state}</p>
                            </div>
                        )}
                        {profile?.interests && profile.interests.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500">Interests</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile.interests.slice(0, 5).map((interest, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                            {interest}
                                        </span>
                                    ))}
                                    {profile.interests.length > 5 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                            +{profile.interests.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {!profile?.isCompleted && (
                            <div className="mt-4 pt-3 border-t">
                                <a href="/profile" className="text-red-600 hover:text-red-700 text-sm font-medium">
                                    Complete your profile →
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {!profile?.isCompleted && (
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <p className="text-yellow-800 font-medium">Complete Your Profile</p>
                                <p className="text-yellow-600 text-sm mt-1">Add your interests and preferences to get personalized campaign recommendations</p>
                                <a href="/profile" className="mt-2 inline-block text-yellow-700 text-sm font-medium">Update Profile →</a>
                            </div>
                        )}

                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-red-800 font-medium">Make a Difference Today</p>
                            <p className="text-red-600 text-sm mt-1">Discover campaigns that match your interests</p>
                            <a href="/recommendations" className="mt-2 inline-block text-red-700 text-sm font-medium">Explore Campaigns →</a>
                        </div>

                        {profile?.isCompleted && recommendations.length === 0 && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-blue-800 font-medium">No Recommendations Yet</p>
                                <p className="text-blue-600 text-sm mt-1">We're preparing personalized recommendations for you. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;