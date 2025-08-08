import React from 'react';
import { Card, DonutChart, Legend } from '@tremor/react';

const PayoutDistributionChart = ({ data }) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payout Distribution</h3>
      <div className="flex flex-col items-center">
        <DonutChart
          className="h-52 mt-4"
          data={data}
          category="amount"
          index="status"
          colors={["green", "yellow", "blue"]}
          valueFormatter={(number) => `KES ${number.toLocaleString()}`}
        />
        <Legend
          className="mt-4"
          categories={["Received", "Pending", "Future"]}
          colors={["green", "yellow", "blue"]}
        />
      </div>
    </Card>
  );
};

export default PayoutDistributionChart;
