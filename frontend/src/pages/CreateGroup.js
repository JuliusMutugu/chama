import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/forms/StepIndicator';
import FormStep from '../components/forms/FormStep';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    payoutPercentage: '90',
    maxMembers: '',
    inviteMembers: [],
    walletAddress: ''
  });

  const steps = ['Basic Info', 'Rules', 'Members', 'Wallet'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    try {
      // await createGroup(formData);
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Group</h1>
        <p className="text-gray-600 mb-8">Set up a new Chama savings group and invite members.</p>

        <Card className="p-6 relative">
          <StepIndicator steps={steps} currentStep={currentStep} />
          
          <form onSubmit={handleSubmit} className="mt-12">
            <FormStep
              isActive={currentStep === 0}
              title="Basic Information"
              description="Enter the basic details about your savings group."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </FormStep>

            <FormStep
              isActive={currentStep === 1}
              title="Group Rules"
              description="Set the contribution and payout rules for your group."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contribution Amount (KES)</label>
                  <input
                    type="number"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contribution Frequency</label>
                  <select
                    name="contributionFrequency"
                    value={formData.contributionFrequency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payout Percentage</label>
                  <select
                    name="payoutPercentage"
                    value={formData.payoutPercentage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="90">90% to member, 10% to group fund</option>
                    <option value="85">85% to member, 15% to group fund</option>
                    <option value="80">80% to member, 20% to group fund</option>
                  </select>
                </div>
              </div>
            </FormStep>

            <FormStep
              isActive={currentStep === 2}
              title="Invite Members"
              description="Set member limits and invite initial members."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Members</label>
                  <input
                    type="number"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invite Members (Optional)</label>
                  <p className="text-sm text-gray-500 mb-2">Enter email addresses of members you want to invite.</p>
                  <textarea
                    name="inviteMembers"
                    value={formData.inviteMembers.join('\\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      inviteMembers: e.target.value.split('\\n').filter(Boolean)
                    }))}
                    rows={4}
                    placeholder="Enter one email per line"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </FormStep>

            <FormStep
              isActive={currentStep === 3}
              title="Blockchain Wallet"
              description="Connect your blockchain wallet for secure transactions."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0x..."
                    required
                  />
                </div>
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Connect Wallet
                </button>
              </div>
            </FormStep>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 ${
                  currentStep === 0 ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Group
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateGroup;
