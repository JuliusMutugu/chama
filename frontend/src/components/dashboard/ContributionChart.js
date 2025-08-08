import React from 'react';
import { Card, AreaChart } from '@tremor/react';

const ContributionChart = ({ data }) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contribution History</h3>
      <AreaChart
        className="h-72 mt-4"
        data={data}
        index="date"
        categories={["amount"]}
        colors={["blue"]}
        valueFormatter={(number) => `KES ${number.toLocaleString()}`}
        yAxisWidth={60}
      />
    </Card>
  );
};

export default ContributionChart;
