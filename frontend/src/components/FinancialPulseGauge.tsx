import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeProps {
  value: number; // Survival months
  maxValue?: number;
}

const FinancialPulseGauge: React.FC<GaugeProps> = ({ value, maxValue = 12 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const getColor = (val: number) => {
    if (val < 1) return '#f44336'; // Red
    if (val < 3) return '#ff9800'; // Orange
    if (val < 6) return '#4caf50'; // Green
    return '#2196f3'; // Blue
  };

  const data = [
    { name: 'Filled', value: percentage },
    { name: 'Empty', value: 100 - percentage }
  ];

  const colors = [getColor(value), '#e0e0e0'];

  return (
    <div style={{ position: 'relative', width: '200px', height: '200px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value.toFixed(1)}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>Months</div>
      </div>
    </div>
  );
};

export default FinancialPulseGauge;