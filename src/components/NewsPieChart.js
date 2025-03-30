import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from "recharts";

const NewsPieChart = () => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Professional color palette - more muted, corporate colors
  const COLORS = ["#3366CC", "#4CA3DD", "#67B7DC", "#91CAE8", "#AED4E9", "#D9E9F5"];
  
  // Categories we want to analyze
  const categories = ["business", "entertainment", "health", "science", "sports", "technology"];
  
  // News API configuration
  const API_KEY = "6171dfb4014340828818d844c444da95"; // 🔥 Replace with your API Key
  const BASE_URL = "https://newsapi.org/v2/top-headlines";

  useEffect(() => {
    const fetchCategoryData = async (country = "us") => {
      try {
        setLoading(true);
        const categoryData = [];
        
        for (const category of categories) {
          const response = await axios.get(BASE_URL, {
            params: {
              category,
              country,
              apiKey: API_KEY
            }
          });

          categoryData.push({ 
            name: category.charAt(0).toUpperCase() + category.slice(1), 
            count: response.data.articles.length 
          });
        }

        setData(categoryData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category data:", error);
        setError("Failed to load news data. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategoryData();
     // eslint-disable-next-line
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-medium text-gray-800">{`${payload[0].name}`}</p>
          <p className="text-white">{`${payload[0].value} articles`}</p>
          <p className="text-white text-sm">{`${((payload[0].value / getTotalCount()) * 100).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Get total count for percentage calculations
  const getTotalCount = () => {
    return data.reduce((sum, item) => sum + item.count, 0);
  };

  // Active shape for hover effect
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom formatter for legend
  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    return (
      <span className="text-gray-700 font-medium">{payload.name}</span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-96">
        <div className="text-gray-600">Loading news data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-dark p-6 rounded-lg shadow-md" style={{marginTop: "180px"}}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">News Category Distribution</h2>
      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                dataKey="count"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                layout="horizontal" 
                formatter={renderLegendText}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-sm text-gray-500 text-center mt-4">
            Based on {getTotalCount()} articles from our news database
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No news data available</p>
        </div>
      )}
    </div>
  );
};

export default NewsPieChart;