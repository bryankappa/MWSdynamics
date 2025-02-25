import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

class MilitaryWorkforceModel:
    """
    System dynamics model for military workforce planning.
    
    This model simulates the flow of personnel through different ranks and specialties,
    accounting for recruitment, promotion, retention, and retirement/separation.
    """
    
    def __init__(self):
        # Model parameters (default values)
        self.num_ranks = 6  # E1 to E6 (enlisted ranks)
        self.num_specialties = 3  # Combat, Technical, Support
        
        # Initialize population matrix: ranks × specialties
        self.initial_population = np.zeros((self.num_ranks, self.num_specialties))
        
        # Default initial population distribution
        # More junior ranks, with technical specialties having slightly higher numbers
        self.initial_population[0, :] = [1000, 1200, 800]  # E1 (Combat, Technical, Support)
        self.initial_population[1, :] = [900, 1000, 700]   # E2
        self.initial_population[2, :] = [700, 800, 600]    # E3
        self.initial_population[3, :] = [500, 600, 400]    # E4
        self.initial_population[4, :] = [300, 400, 200]    # E5
        self.initial_population[5, :] = [100, 150, 80]     # E6
        
        # Set default rates
        # Recruitment rates (only for E1)
        self.recruitment_rates = np.array([100, 120, 80])  # Combat, Technical, Support
        
        # Promotion rates for each rank
        self.promotion_rates = np.array([0.3, 0.25, 0.2, 0.15, 0.1, 0])
        
        # Attrition rates for each rank (increases with rank)
        self.attrition_rates = np.array([0.15, 0.12, 0.10, 0.08, 0.05, 0.15])
        
        # Training time (years) for each specialty
        self.training_times = np.array([0.5, 0.75, 0.33])  # Combat, Technical, Support
        
        # Retirement maximum service years
        self.max_service_years = 20
        
        # Cross-training rates between specialties (probability matrix)
        self.cross_training_matrix = np.array([
            [0.90, 0.05, 0.05],  # From Combat to Combat, Technical, Support
            [0.05, 0.90, 0.05],  # From Technical to Combat, Technical, Support
            [0.05, 0.05, 0.90]   # From Support to Combat, Technical, Support
        ])

    def simulate(self, years, dt=0.1):
        """
        Run the military workforce simulation for the specified number of years.
        
        Parameters:
        -----------
        years : float
            Number of years to simulate
        dt : float
            Time step (fraction of a year)
            
        Returns:
        --------
        time : ndarray
            Time points
        population : ndarray
            Population matrix at each time point
        metrics : dict
            Key performance metrics from the simulation
        """
        # Initialize time and population arrays
        time_points = np.arange(0, years, dt)
        num_steps = len(time_points)
        
        # Reshape initial population to a 1D array for the solver
        initial_pop_flat = self.initial_population.flatten()
        
        # Define the system of differential equations
        def workforce_ode(t, pop_flat):
            # Reshape to 2D array
            pop = pop_flat.reshape(self.num_ranks, self.num_specialties)
            
            # Initialize rate of change matrix
            dpop = np.zeros_like(pop)
            
            # Add recruitment (only to E1 rank)
            dpop[0, :] += self.recruitment_rates
            
            # Process promotions, attrition, and transfers for each rank and specialty
            for rank in range(self.num_ranks):
                for specialty in range(self.num_specialties):
                    # Current population in this rank and specialty
                    current_pop = pop[rank, specialty]
                    
                    # Calculate attrition
                    attrition = current_pop * self.attrition_rates[rank]
                    dpop[rank, specialty] -= attrition
                    
                    # Calculate promotions (outflow from this rank)
                    if rank < self.num_ranks - 1:  # Not the highest rank
                        promotion_outflow = current_pop * self.promotion_rates[rank]
                        dpop[rank, specialty] -= promotion_outflow
                        dpop[rank + 1, specialty] += promotion_outflow
                    
                    # Calculate cross-training transfers
                    for target_specialty in range(self.num_specialties):
                        if target_specialty != specialty:
                            transfer_rate = self.cross_training_matrix[specialty, target_specialty]
                            transfer = current_pop * transfer_rate * 0.05  # 5% annual cross-training
                            dpop[rank, specialty] -= transfer
                            dpop[rank, target_specialty] += transfer
            
            return dpop.flatten()
        
        # Solve the ODE system
        solution = solve_ivp(
            workforce_ode,
            [0, years],
            initial_pop_flat,
            t_eval=time_points,
            method='RK45'
        )
        
        # Reshape results back to 3D array (time, rank, specialty)
        population_over_time = solution.y.T.reshape(num_steps, self.num_ranks, self.num_specialties)
        
        # Calculate metrics
        metrics = self.calculate_metrics(time_points, population_over_time)
        
        return time_points, population_over_time, metrics
    
    def calculate_metrics(self, time, population):
        """Calculate key workforce metrics from simulation results."""
        num_steps = len(time)
        
        # Initialize metrics dictionary
        metrics = {
            'total_force': np.zeros(num_steps),
            'combat_ratio': np.zeros(num_steps),
            'technical_ratio': np.zeros(num_steps),
            'support_ratio': np.zeros(num_steps),
            'junior_to_senior_ratio': np.zeros(num_steps),
            'experienced_personnel': np.zeros(num_steps)
        }
        
        for t in range(num_steps):
            # Current population snapshot
            pop = population[t]
            
            # Total force size
            metrics['total_force'][t] = np.sum(pop)
            
            # Specialty distributions
            metrics['combat_ratio'][t] = np.sum(pop[:, 0]) / metrics['total_force'][t]
            metrics['technical_ratio'][t] = np.sum(pop[:, 1]) / metrics['total_force'][t]
            metrics['support_ratio'][t] = np.sum(pop[:, 2]) / metrics['total_force'][t]
            
            # Junior (E1-E3) to senior (E4-E6) ratio
            junior = np.sum(pop[0:3, :])
            senior = np.sum(pop[3:, :])
            metrics['junior_to_senior_ratio'][t] = junior / max(senior, 1)  # Avoid division by zero
            
            # Experienced personnel (E4 and above)
            metrics['experienced_personnel'][t] = senior
        
        return metrics
    
    def plot_results(self, time, population, metrics, title="Military Workforce Simulation"):
        """Plot simulation results."""
        # Create a figure with multiple subplots
        fig = plt.figure(figsize=(15, 12))
        
        # 1. Total force over time
        ax1 = fig.add_subplot(3, 2, 1)
        ax1.plot(time, metrics['total_force'], 'b-', linewidth=2)
        ax1.set_xlabel('Years')
        ax1.set_ylabel('Personnel')
        ax1.set_title('Total Force Size')
        ax1.grid(True)
        
        # 2. Forces by specialty over time
        ax2 = fig.add_subplot(3, 2, 2)
        specialties = ['Combat', 'Technical', 'Support']
        for s in range(len(specialties)):
            ax2.plot(time, np.sum(population[:, :, s], axis=1), label=specialties[s])
        ax2.set_xlabel('Years')
        ax2.set_ylabel('Personnel')
        ax2.set_title('Personnel by Specialty')
        ax2.legend()
        ax2.grid(True)
        
        # 3. Junior to senior ratio
        ax3 = fig.add_subplot(3, 2, 3)
        ax3.plot(time, metrics['junior_to_senior_ratio'], 'g-', linewidth=2)
        ax3.set_xlabel('Years')
        ax3.set_ylabel('Ratio')
        ax3.set_title('Junior to Senior Ratio')
        ax3.grid(True)
        
        # 4. Experienced personnel
        ax4 = fig.add_subplot(3, 2, 4)
        ax4.plot(time, metrics['experienced_personnel'], 'r-', linewidth=2)
        ax4.set_xlabel('Years')
        ax4.set_ylabel('Personnel')
        ax4.set_title('Experienced Personnel (E4+)')
        ax4.grid(True)
        
        # 5. Personnel by rank (stacked area chart)
        ax5 = fig.add_subplot(3, 2, 5)
        ranks = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']
        rank_data = [np.sum(population[:, r, :], axis=1) for r in range(self.num_ranks)]
        ax5.stackplot(time, rank_data, labels=ranks, alpha=0.7)
        ax5.set_xlabel('Years')
        ax5.set_ylabel('Personnel')
        ax5.set_title('Force Structure by Rank')
        ax5.legend(loc='upper left', bbox_to_anchor=(1, 1))
        ax5.grid(True)
        
        # 6. Specialty ratios over time
        ax6 = fig.add_subplot(3, 2, 6)
        ax6.plot(time, metrics['combat_ratio'], 'r-', label='Combat')
        ax6.plot(time, metrics['technical_ratio'], 'b-', label='Technical')
        ax6.plot(time, metrics['support_ratio'], 'g-', label='Support')
        ax6.set_xlabel('Years')
        ax6.set_ylabel('Proportion')
        ax6.set_title('Specialty Distribution')
        ax6.legend()
        ax6.grid(True)
        
        plt.tight_layout()
        plt.suptitle(title, fontsize=16)
        plt.subplots_adjust(top=0.92)
        
        return fig
    
    def run_scenario(self, scenario_name, years=10, **kwargs):
        """
        Run a specific scenario by temporarily modifying model parameters.
        
        Parameters:
        -----------
        scenario_name : str
            Name of the scenario
        years : float
            Number of years to simulate
        **kwargs : dict
            Parameters to modify for this scenario
            
        Returns:
        --------
        results : tuple
            (time, population, metrics) from the simulation
        """
        # Save original parameters
        original_params = {}
        for key, value in kwargs.items():
            if hasattr(self, key):
                original_params[key] = getattr(self, key)
                setattr(self, key, value)
            else:
                print(f"Warning: Parameter '{key}' not recognized.")
        
        # Run simulation
        results = self.simulate(years)
        
        # Restore original parameters
        for key, value in original_params.items():
            setattr(self, key, value)
        
        return results

# Example usage
if __name__ == "__main__":
    # Create model
    model = MilitaryWorkforceModel()
    
    # Run baseline simulation
    time, population, metrics = model.simulate(years=10)
    
    # Plot results
    fig = model.plot_results(time, population, metrics, "Baseline Military Workforce Projection")
    plt.savefig("military_workforce_baseline.png", dpi=300, bbox_inches='tight')
    
    # Run alternative scenario: increased recruitment
    increased_recruitment = model.recruitment_rates * 1.5
    time2, population2, metrics2 = model.run_scenario(
        "Increased Recruitment",
        years=10,
        recruitment_rates=increased_recruitment
    )
    
    # Plot alternative scenario
    fig2 = model.plot_results(time2, population2, metrics2, "Increased Recruitment Scenario")
    plt.savefig("military_workforce_increased_recruitment.png", dpi=300, bbox_inches='tight')
    
    # Compare total force size under both scenarios
    plt.figure(figsize=(10, 6))
    plt.plot(time, metrics['total_force'], 'b-', label='Baseline')
    plt.plot(time2, metrics2['total_force'], 'r--', label='Increased Recruitment')
    plt.xlabel('Years')
    plt.ylabel('Total Force Size')
    plt.title('Impact of Increased Recruitment on Force Size')
    plt.legend()
    plt.grid(True)
    plt.savefig("military_workforce_comparison.png", dpi=300, bbox_inches='tight')
    
    plt.show()