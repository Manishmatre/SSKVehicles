import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Subscription = () => {
  const { user, organization, subscriptionStatus, refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(
    organization?.subscription?.plan || 'basic'
  );

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Redirect if user doesn't have an organization
  useEffect(() => {
    if (user && !organization) {
      navigate('/register-organization');
    }
  }, [user, organization, navigate]);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update subscription
      const response = await api.put('/api/organization/subscription', {
        plan: selectedPlan
      });
      
      if (response.data.success) {
        // Refresh user data to get updated subscription info
        await refreshUserData();
        navigate('/dashboard');
      } else {
        setError(response.data.error || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err.response?.data?.error || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const getPlanDetails = (plan) => {
    switch (plan) {
      case 'basic':
        return {
          name: 'Basic',
          price: 'Free',
          vehicleLimit: 5,
          features: [
            '5 vehicles',
            'Basic maintenance tracking',
            'Fuel consumption tracking',
            'Document storage'
          ]
        };
      case 'standard':
        return {
          name: 'Standard',
          price: '$9.99/month',
          vehicleLimit: 25,
          features: [
            '25 vehicles',
            'Advanced maintenance tracking',
            'Fuel consumption analytics',
            'Document management',
            'Insurance tracking'
          ]
        };
      case 'premium':
        return {
          name: 'Premium',
          price: '$29.99/month',
          vehicleLimit: 100,
          features: [
            '100 vehicles',
            'Full maintenance management',
            'Advanced analytics dashboard',
            'Document management with OCR',
            'Insurance tracking with alerts',
            'Priority support'
          ]
        };
      default:
        return {
          name: 'Unknown',
          price: '',
          vehicleLimit: 0,
          features: []
        };
    }
  };

  const currentPlan = organization?.subscription?.plan || 'basic';
  const currentPlanDetails = getPlanDetails(currentPlan);
  const subscriptionEndDate = organization?.subscription?.endDate
    ? new Date(organization.subscription.endDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Subscription Management
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your fleet management subscription
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Current Subscription
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentPlanDetails.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentPlanDetails.price}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Vehicle Limit</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentPlanDetails.vehicleLimit}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{subscriptionEndDate}</dd>
              </div>
            </dl>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Select a Plan
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                {['basic', 'standard', 'premium'].map((plan) => {
                  const planDetails = getPlanDetails(plan);
                  return (
                    <div 
                      key={plan}
                      className={`relative rounded-lg border p-4 shadow-sm focus:outline-none ${
                        selectedPlan === plan 
                          ? 'border-blue-500 ring-2 ring-blue-500' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handlePlanChange(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{planDetails.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{planDetails.price}</p>
                        </div>
                        <div className="flex items-center h-5">
                          <input
                            id={`plan-${plan}`}
                            name="plan"
                            type="radio"
                            checked={selectedPlan === plan}
                            onChange={() => handlePlanChange(plan)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">Features:</p>
                        <ul className="mt-2 space-y-2">
                          {planDetails.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="ml-2 text-sm text-gray-500">{feature}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedPlan === currentPlan}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || selectedPlan === currentPlan
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Updating...' : 'Update Subscription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Subscription;
