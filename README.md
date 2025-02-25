# Military Workforce Planning System Dynamics Model

This interactive web application simulates military workforce dynamics using system dynamics principles. The model allows users to explore how different recruitment, promotion, and attrition rates affect the structure and composition of military forces over time.

![image](https://github.com/user-attachments/assets/1c969a99-e4cf-4013-b91a-f050b213c8c5)


## Features

- **Multiple Predefined Scenarios**: Explore baseline, force expansion, force reduction, and technical focus strategies
- **Interactive Parameter Controls**: Adjust recruitment rates, promotion rates, and attrition rates in real-time
- **Dynamic Visualizations**: View force structure changes through interactive charts
- **System Dynamics Modeling**: Experience how stocks, flows, and feedback loops create complex workforce behaviors

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/bryankappa/MWSdynamics.git
   cd military-workforce-dynamics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install the Recharts library for data visualization:
   ```bash
   npm install recharts
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. **Select a Scenario**: Choose one of the four preset scenarios as your starting point
2. **Adjust Parameters**: Use the sliders to modify recruitment rates, promotion percentages, and attrition rates
3. **View Results**: Observe how your changes affect the force structure over time in the visualization panel
4. **Toggle Views**: Switch between "Force Overview" and "Specialty Mix" to see different aspects of the workforce model

## Understanding the Model

This application implements core system dynamics principles:

- **Stocks**: Personnel at each rank and specialty represent stocks in the system
- **Flows**: Recruitment, promotion, and attrition are the flows that add to or subtract from these stocks
- **Feedback Loops**: Experienced personnel influence promotion rates, creating feedback mechanisms
- **Time Delays**: Career progression creates natural delays between actions and their full effects

## Technical Details

The application is built with:
- React.js for the user interface
- Recharts for data visualization
- Tailwind CSS for styling
- System dynamics mathematical modeling with JavaScript

## Future Enhancements

- Save and compare multiple scenarios
- Export simulation results for further analysis
- Integrate with external data sources
- Add additional workforce planning metrics

## Contributing

Contributions to improve the model or add features are welcome! Please feel free to submit a pull request or open an issue to discuss potential changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- System dynamics principles based on the work of Jay W. Forrester and the System Dynamics Society
- Military workforce planning concepts derived from standard military human resources practices

---
