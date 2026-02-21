import React from 'react';
import BasePage from '../components/BasePage';

const News: React.FC = () => {
  return (
    <BasePage title="News & Updates" subtitle="Stay updated with the latest from RAPP">
      <div className="text-center">
        <p className="text-blue-200 text-lg">Coming soon - Latest news and updates!</p>
      </div>
    </BasePage>
  );
};

export default News;
