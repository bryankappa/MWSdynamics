import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MilitaryWorkforceApp = () => {
  // Model parameters
  const [params, setParams] = useState({
    recruitmentCombat: 100,
    recruitmentTechnical: 120,
    recruitmentSupport: 80,
    promotionRate: 20,
    attritionJunior: 15,
    attritionMid: 10,
    attritionSenior: 8,
    simulationYears: 10
  });

  // Selected scenario
  const [scenario, setScenario] = useState('baseline');
  
  // Active tab for charts
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulation results
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Run simulation when parameters or scenario changes
  useEffect(() => {
    runSimulation();
  }, [params, scenario]);

  // Simplified simulation logic
  const runSimulation = () => {
    setIsLoading(true);
    
    // Generate sample data for demonstration
    const timePoints = [];
    const totalForce = [];
    const experiencedPersonnel = [];
    const specialtyDistribution = [];
    const rankDistribution = [];
    
    // Time steps (years)
    const years = params.simulationYears;
    const steps = years * 4; // Quarterly
    
    // Initial values based on scenario
    let initialTotal = 0;
    let initialExperienced = 0;
    
    if (scenario === 'baseline') {
      initialTotal = 10000;
      initialExperienced = 3000;
    } else if (scenario === 'expansion') {
      initialTotal = 12000;
      initialExperienced = 3500;
    } else if (scenario === 'reduction') {
      initialTotal = 8000;
      initialExperienced = 2500;
    } else if (scenario === 'technical') {
      initialTotal = 10000;
      initialExperienced = 3000;
    }
    
    // Growth rates based on parameters
    const totalRecruitment = params.recruitmentCombat + params.recruitmentTechnical + params.recruitmentSupport;
    const avgAttrition = (params.attritionJunior + params.attritionMid + params.attritionSenior) / 3 / 100;
    
    // Generate data
    let currentTotal = initialTotal;
    let currentExperienced = initialExperienced;
    
    for (let i = 0; i <= steps; i++) {
      const year = i / 4;
      timePoints.push(year);
      
      // Calculate force changes
      currentTotal = currentTotal + totalRecruitment/4 - currentTotal * avgAttrition/4;
      
      // Experienced personnel (grows with promotions, shrinks with attrition)
      const promotions = (currentTotal - currentExperienced) * (params.promotionRate/100)/4;
      const expAttrition = currentExperienced * (params.attritionSenior/100)/4;
      currentExperienced = currentExperienced + promotions - expAttrition;
      
      // Store values
      totalForce.push(currentTotal);
      experiencedPersonnel.push(currentExperienced);
      
      // Generate specialty distribution
      const combatPct = params.recruitmentCombat / totalRecruitment;
      const technicalPct = params.recruitmentTechnical / totalRecruitment;
      const supportPct = params.recruitmentSupport / totalRecruitment;
      
      specialtyDistribution.push({
        time: year,
        Combat: Math.round(currentTotal * combatPct),
        Technical: Math.round(currentTotal * technicalPct),
        Support: Math.round(currentTotal * supportPct)
      });
      
      // Generate rank distribution
      rankDistribution.push({
        time: year,
        E1: Math.round(currentTotal * 0.3),
        E2: Math.round(currentTotal * 0.25),
        E3: Math.round(currentTotal * 0.2),
        E4: Math.round(currentTotal * 0.15),
        E5: Math.round(currentTotal * 0.07),
        E6: Math.round(currentTotal * 0.03)
      });
    }
    
    // Prepare chart data
    const chartData = timePoints.map((time, i) => ({
      time: time,
      totalForce: totalForce[i],
      experiencedPersonnel: experiencedPersonnel[i]
    }));
    
    // Set results
    setResults({
      chartData,
      specialtyDistribution,
      rankDistribution,
      finalMetrics: {
        totalForce: totalForce[totalForce.length - 1],
        juniorSeniorRatio: (totalForce[totalForce.length - 1] - experiencedPersonnel[experiencedPersonnel.length - 1]) / 
                           experiencedPersonnel[experiencedPersonnel.length - 1],
        experiencedPersonnel: experiencedPersonnel[experiencedPersonnel.length - 1],
        growthRate: ((totalForce[totalForce.length - 1] / initialTotal) - 1) * 100
      }
    });
    
    setIsLoading(false);
  };
  
  // Handle parameter changes
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Handle scenario selection
  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    
    // Update parameters based on scenario
    if (newScenario === 'baseline') {
      setParams({
        recruitmentCombat: 100,
        recruitmentTechnical: 120,
        recruitmentSupport: 80,
        promotionRate: 20,
        attritionJunior: 15,
        attritionMid: 10,
        attritionSenior: 8,
        simulationYears: 10
      });
    } else if (newScenario === 'expansion') {
      setParams({
        recruitmentCombat: 200,
        recruitmentTechnical: 240,
        recruitmentSupport: 160,
        promotionRate: 25,
        attritionJunior: 10,
        attritionMid: 8,
        attritionSenior: 5,
        simulationYears: 10
      });
    } else if (newScenario === 'reduction') {
      setParams({
        recruitmentCombat: 60,
        recruitmentTechnical: 70,
        recruitmentSupport: 50,
        promotionRate: 15,
        attritionJunior: 18,
        attritionMid: 12,
        attritionSenior: 10,
        simulationYears: 10
      });
    } else if (newScenario === 'technical') {
      setParams({
        recruitmentCombat: 70,
        recruitmentTechnical: 200,
        recruitmentSupport: 60,
        promotionRate: 20,
        attritionJunior: 15,
        attritionMid: 10,
        attritionSenior: 8,
        simulationYears: 10
      });
    }
  };
  
  // Colors for charts
  const COLORS = {
    Combat: "#8884d8",
    Technical: "#82ca9d",
    Support: "#ffc658",
    E1: "#003f5c",
    E2: "#2f4b7c",
    E3: "#665191",
    E4: "#a05195",
    E5: "#d45087",
    E6: "#f95d6a"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Military Workforce Planning Model</h1>
          <p className="text-gray-600 mt-2">System Dynamics Simulation for Force Structure Management</p>
        </div>
        
        {/* Scenario Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scenario Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleScenarioChange('baseline')}
              className={`p-4 rounded-lg transition-all ${
                scenario === 'baseline' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Baseline</div>
              <div className="text-sm mt-1 opacity-80">Current force projection</div>
            </button>
            
            <button
              onClick={() => handleScenarioChange('expansion')}
              className={`p-4 rounded-lg transition-all ${
                scenario === 'expansion' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Force Expansion</div>
              <div className="text-sm mt-1 opacity-80">Increased recruitment</div>
            </button>
            
            <button
              onClick={() => handleScenarioChange('reduction')}
              className={`p-4 rounded-lg transition-all ${
                scenario === 'reduction' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Force Reduction</div>
              <div className="text-sm mt-1 opacity-80">Lower recruitment</div>
            </button>
            
            <button
              onClick={() => handleScenarioChange('technical')}
              className={`p-4 rounded-lg transition-all ${
                scenario === 'technical' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">Technical Focus</div>
              <div className="text-sm mt-1 opacity-80">Emphasis on technical</div>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parameters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Model Parameters
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Combat Recruitment
                    </label>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {params.recruitmentCombat}/year
                    </span>
                  </div>
                  <input
                    type="range"
                    name="recruitmentCombat"
                    min="50"
                    max="300"
                    step="10"
                    value={params.recruitmentCombat}
                    onChange={handleParamChange}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Technical Recruitment
                    </label>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {params.recruitmentTechnical}/year
                    </span>
                  </div>
                  <input
                    type="range"
                    name="recruitmentTechnical"
                    min="50"
                    max="300"
                    step="10"
                    value={params.recruitmentTechnical}
                    onChange={handleParamChange}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Support Recruitment
                    </label>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {params.recruitmentSupport}/year
                    </span>
                  </div>
                  <input
                    type="range"
                    name="recruitmentSupport"
                    min="50"
                    max="300"
                    step="10"
                    value={params.recruitmentSupport}
                    onChange={handleParamChange}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Promotion Rate
                    </label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                      {params.promotionRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    name="promotionRate"
                    min="10"
                    max="40"
                    step="5"
                    value={params.promotionRate}
                    onChange={handleParamChange}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Junior Attrition (E1-E3)
                    </label>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                      {params.attritionJunior}%
                    </span>
                  </div>
                  <input
                    type="range"
                    name="attritionJunior"
                    min="5"
                    max="30"
                    step="1"
                    value={params.attritionJunior}
                    onChange={handleParamChange}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Results Summary Card */}
            {results && !isLoading && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">End-State Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">Total Force</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {Math.round(results.finalMetrics.totalForce).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600">Junior:Senior Ratio</div>
                    <div className="text-2xl font-bold text-green-800">
                      {results.finalMetrics.juniorSeniorRatio.toFixed(1)}:1
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            {/* Chart Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Force Overview
                </button>
                <button 
                  onClick={() => setActiveTab('specialty')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'specialty' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Specialty Mix
                </button>
              </div>
            </div>
            
            {/* Charts Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                {activeTab === 'overview' ? 'Force Structure Overview' : 'Specialty Distribution'}
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-t-blue-600 border-r-blue-200 border-b-blue-200 border-l-blue-200 rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-600">Simulating workforce dynamics...</p>
                  </div>
                </div>
              ) : (
                <div className="h-96">
                  {activeTab === 'overview' && results && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Personnel', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalForce" stroke="#8884d8" name="Total Force" />
                        <Line type="monotone" dataKey="experiencedPersonnel" stroke="#82ca9d" name="Experienced Personnel" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  
                  {activeTab === 'specialty' && results && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={results.specialtyDistribution}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Combat" stackId="1" stroke={COLORS.Combat} fill={COLORS.Combat} />
                        <Area type="monotone" dataKey="Technical" stackId="1" stroke={COLORS.Technical} fill={COLORS.Technical} />
                        <Area type="monotone" dataKey="Support" stackId="1" stroke={COLORS.Support} fill={COLORS.Support} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
              
              {/* System Dynamics Insights */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="text-md font-semibold text-indigo-800 mb-2">System Dynamics Insights</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This military workforce planning model demonstrates key system dynamics principles including:
                </p>
                <ul className="mt-2 text-sm text-gray-700 space-y-1">
                  <li>• <span className="font-medium">Stocks and flows</span>: Personnel at each rank represent stocks, with recruitment, promotion, and attrition as flows</li>
                  <li>• <span className="font-medium">Feedback loops</span>: Experienced personnel influence promotion capabilities</li>
                  <li>• <span className="font-medium">Time delays</span>: Career progression creates inherent delays between recruitment and leadership development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilitaryWorkforceApp;