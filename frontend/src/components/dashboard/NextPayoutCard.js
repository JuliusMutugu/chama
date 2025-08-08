import React from 'react';
import { Card } from '@tremor/react';
import { Calendar } from 'lucide-react';

const NextPayoutCard = ({ nextPayout }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Next Payout</h3>
          <p className="text-sm text-gray-600 mt-1">
            {nextPayout?.member}'s turn on {nextPayout?.date}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            KES {nextPayout?.amount?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {nextPayout?.daysRemaining} days remaining
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NextPayoutCard;
