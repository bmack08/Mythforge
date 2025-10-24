import './mythwright-project-wizard.less';
import React from 'react';
import createClass from 'create-react-class';

const MythwrightProjectWizard = createClass({
	displayName : 'MythwrightProjectWizard',

	getInitialState : function() {
		return {
			isOpen: false,
			currentStep: 1,
			totalSteps: 6,
			generating: false,
			campaignParameters: {
				campaignName: '',
				campaignDescription: '',
				expectedSessions: 8,
				sessionDuration: 4,
				startingLevel: 1,
				endingLevel: 5,
				playerExperience: 'some',
				preferredGenres: [],
				contentRating: 'teen',
				specialRequirements: '',
				inspirationSources: '',
				campaignGoals: []
			}
		};
	},

	openModal : function() {
		this.setState({ isOpen: true });
	},

	closeModal : function() {
		this.setState({ 
			isOpen: false,
			currentStep: 1,
			generating: false,
			campaignParameters: {
				campaignName: '',
				campaignDescription: '',
				expectedSessions: 8,
				sessionDuration: 4,
				startingLevel: 1,
				endingLevel: 5,
				playerExperience: 'some',
				preferredGenres: [],
				contentRating: 'teen',
				specialRequirements: '',
				inspirationSources: '',
				campaignGoals: []
			}
		});
	},

	nextStep : function() {
		if (this.validateCurrentStep()) {
			this.setState({
				currentStep: Math.min(this.state.currentStep + 1, this.state.totalSteps)
			});
		}
	},

	prevStep : function() {
		this.setState({
			currentStep: Math.max(this.state.currentStep - 1, 1)
		});
	},

	validateCurrentStep : function() {
		const { currentStep, campaignParameters } = this.state;
		
		switch (currentStep) {
			case 1:
				if (!campaignParameters.campaignName.trim()) {
					alert('Please enter a campaign name');
					return false;
				}
				if (!campaignParameters.campaignDescription.trim()) {
					alert('Please enter a campaign description');
					return false;
				}
				return true;
			case 2:
				if (campaignParameters.expectedSessions < 1) {
					alert('Please enter a valid number of sessions');
					return false;
				}
				return true;
			default:
				return true;
		}
	},

	handleParameterChange : function(field, value) {
		this.setState({
			campaignParameters: {
				...this.state.campaignParameters,
				[field]: value
			}
		});
	},

	handleGenreToggle : function(genre) {
		const { preferredGenres } = this.state.campaignParameters;
		const updated = preferredGenres.includes(genre)
			? preferredGenres.filter(g => g !== genre)
			: [...preferredGenres, genre];
		
		this.handleParameterChange('preferredGenres', updated);
	},

	handleGoalToggle : function(goal) {
		const { campaignGoals } = this.state.campaignParameters;
		const updated = campaignGoals.includes(goal)
			? campaignGoals.filter(g => g !== goal)
			: [...campaignGoals, goal];
		
		this.handleParameterChange('campaignGoals', updated);
	},

	generateCampaign : function() {
		this.setState({ generating: true });

		// Map the 6-step questionnaire data to the AI generation format
		const { campaignParameters } = this.state;
		const campaignData = {
			title: campaignParameters.campaignName,
			level: campaignParameters.startingLevel <= 5 ? 'low' : 
			       campaignParameters.startingLevel <= 10 ? 'mid' :
			       campaignParameters.startingLevel <= 16 ? 'high' : 'epic',
			adventureType: this.determineAdventureType(campaignParameters.preferredGenres),
			theme: this.determineTheme(campaignParameters.preferredGenres, campaignParameters.contentRating),
			partySize: 4, // Default party size
			sessionCount: campaignParameters.expectedSessions,
			complexity: campaignParameters.playerExperience === 'new' ? 'simple' :
			            campaignParameters.playerExperience === 'veteran' ? 'complex' : 'moderate'
		};

		// Call the Mythwright AI generation API
		fetch('/api/mythwright/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(campaignData)
		})
		.then(response => {
			console.log('Response status:', response.status);
			console.log('Response ok:', response.ok);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			return response.text(); // Get as text first
		})
		.then(text => {
			console.log('Raw response length:', text.length);
			console.log('First 200 chars:', text.substring(0, 200));
			
			try {
				const data = JSON.parse(text);
				console.log('Parsed JSON:', data);
				
				if (data.success) {
					console.log('✨ Campaign generated successfully:', data.title);
					
					// Redirect to the editor with the generated content
					window.location.href = data.url || `/edit/${data.editId}`;
				} else {
					console.error('Campaign generation failed:', data.error);
					alert(`Campaign generation failed: ${data.error || 'Unknown error'}\n\nDetails: ${data.details || 'Unknown error'}`);
					this.setState({ generating: false });
				}
			} catch (parseError) {
				console.error('JSON parse error:', parseError);
				console.error('Response text:', text);
				alert(`Campaign generation failed: JSON parse error\n\nError: ${parseError.message}\n\nPlease try again.`);
				this.setState({ generating: false });
			}
		})
		.catch(error => {
			console.error('Error during campaign generation:', error);
			alert(`Campaign generation failed: ${error.message}\n\nPlease check your internet connection and try again.`);
			this.setState({ generating: false });
		});
	},

	// Helper function to determine adventure type from genres
	determineAdventureType : function(genres) {
		if (genres.includes('mystery') || genres.includes('investigation')) return 'mystery';
		if (genres.includes('political-intrigue')) return 'intrigue';
		if (genres.includes('exploration') || genres.includes('survival')) return 'wilderness';
		if (genres.includes('urban-fantasy')) return 'city';
		if (genres.includes('planar-travel')) return 'planar';
		return 'dungeon'; // Default
	},

	// Helper function to determine theme from genres and content rating
	determineTheme : function(genres, contentRating) {
		if (genres.includes('dark-fantasy') || genres.includes('horror')) return 'dark-fantasy';
		if (genres.includes('high-fantasy')) return 'high-fantasy';
		if (genres.includes('steampunk')) return 'steampunk';
		if (genres.includes('urban-fantasy')) return 'modern';
		if (genres.includes('post-apocalyptic')) return 'sci-fi';
		return 'classic-fantasy'; // Default
	},

	renderStep1 : function() {
		return (
			<div className='step-content'>
				<h3>Campaign Basics</h3>
				<div className='form-group'>
					<label>Campaign Name</label>
					<input 
						type='text'
						value={this.state.campaignParameters.campaignName}
						onChange={(e) => this.handleParameterChange('campaignName', e.target.value)}
						placeholder='The Crystal Caverns of Shadowpeak'
					/>
				</div>
				<div className='form-group'>
					<label>Campaign Description</label>
					<textarea 
						value={this.state.campaignParameters.campaignDescription}
						onChange={(e) => this.handleParameterChange('campaignDescription', e.target.value)}
						placeholder='A thrilling adventure for brave heroes...'
						rows='4'
					/>
				</div>
			</div>
		);
	},

	renderStep2 : function() {
		return (
			<div className='step-content'>
				<h3>Session Planning</h3>
				<div className='form-group'>
					<label>Expected Sessions</label>
					<input 
						type='number'
						min='1'
						max='50'
						value={this.state.campaignParameters.expectedSessions}
						onChange={(e) => this.handleParameterChange('expectedSessions', parseInt(e.target.value))}
					/>
				</div>
				<div className='form-group'>
					<label>Session Duration (hours)</label>
					<select 
						value={this.state.campaignParameters.sessionDuration}
						onChange={(e) => this.handleParameterChange('sessionDuration', parseInt(e.target.value))}
					>
						<option value={2}>2 hours</option>
						<option value={3}>3 hours</option>
						<option value={4}>4 hours</option>
						<option value={5}>5 hours</option>
						<option value={6}>6 hours</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep3 : function() {
		return (
			<div className='step-content'>
				<h3>Character Levels</h3>
				<div className='form-group'>
					<label>Starting Level</label>
					<select 
						value={this.state.campaignParameters.startingLevel}
						onChange={(e) => this.handleParameterChange('startingLevel', parseInt(e.target.value))}
					>
						{Array.from({length: 20}, (_, i) => i + 1).map(level => (
							<option key={level} value={level}>Level {level}</option>
						))}
					</select>
				</div>
				<div className='form-group'>
					<label>Ending Level</label>
					<select 
						value={this.state.campaignParameters.endingLevel}
						onChange={(e) => this.handleParameterChange('endingLevel', parseInt(e.target.value))}
					>
						{Array.from({length: 20}, (_, i) => i + 1).map(level => (
							<option key={level} value={level}>Level {level}</option>
						))}
					</select>
				</div>
				<div className='form-group'>
					<label>Player Experience</label>
					<select 
						value={this.state.campaignParameters.playerExperience}
						onChange={(e) => this.handleParameterChange('playerExperience', e.target.value)}
					>
						<option value='new'>New Players</option>
						<option value='some'>Some Experience</option>
						<option value='experienced'>Experienced</option>
						<option value='veteran'>Veteran Players</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep4 : function() {
		const genreOptions = [
			'high-fantasy', 'low-fantasy', 'urban-fantasy', 'dark-fantasy',
			'adventure', 'mystery', 'horror', 'comedy', 'drama',
			'political-intrigue', 'exploration', 'survival', 'steampunk'
		];

		return (
			<div className='step-content'>
				<h3>Genre & Style</h3>
				<div className='form-group'>
					<label>Preferred Genres (select multiple)</label>
					<div className='genre-grid'>
						{genreOptions.map(genre => (
							<div 
								key={genre}
								className={`genre-option ${this.state.campaignParameters.preferredGenres.includes(genre) ? 'selected' : ''}`}
								onClick={() => this.handleGenreToggle(genre)}
							>
								{genre.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
							</div>
						))}
					</div>
				</div>
				<div className='form-group'>
					<label>Content Rating</label>
					<select 
						value={this.state.campaignParameters.contentRating}
						onChange={(e) => this.handleParameterChange('contentRating', e.target.value)}
					>
						<option value='family'>Family Friendly</option>
						<option value='teen'>Teen (mild violence/themes)</option>
						<option value='mature'>Mature (dark themes/violence)</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep5 : function() {
		return (
			<div className='step-content'>
				<h3>Special Requirements & Inspiration</h3>
				<div className='form-group'>
					<label>Special Requirements</label>
					<textarea 
						value={this.state.campaignParameters.specialRequirements}
						onChange={(e) => this.handleParameterChange('specialRequirements', e.target.value)}
						placeholder='Any special requirements or constraints...'
						rows='3'
					/>
				</div>
				<div className='form-group'>
					<label>Inspiration Sources</label>
					<textarea 
						value={this.state.campaignParameters.inspirationSources}
						onChange={(e) => this.handleParameterChange('inspirationSources', e.target.value)}
						placeholder='Books, movies, shows, games that inspire this campaign...'
						rows='3'
					/>
				</div>
			</div>
		);
	},

	renderStep6 : function() {
		const goalOptions = [
			'introduce-new-players', 'character-development', 'epic-story',
			'world-building', 'problem-solving', 'social-interaction',
			'mystery-solving', 'exploration', 'political-intrigue'
		];

		return (
			<div className='step-content'>
				<h3>Campaign Goals & Summary</h3>
				<div className='form-group'>
					<label>Campaign Goals (select multiple)</label>
					<div className='goals-grid'>
						{goalOptions.map(goal => (
							<div 
								key={goal}
								className={`goal-option ${this.state.campaignParameters.campaignGoals.includes(goal) ? 'selected' : ''}`}
								onClick={() => this.handleGoalToggle(goal)}
							>
								{goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
							</div>
						))}
					</div>
				</div>
				
				<div className='campaign-summary'>
					<h4>Campaign Summary</h4>
					<div className='summary-item'><strong>Name:</strong> {this.state.campaignParameters.campaignName || 'Untitled Campaign'}</div>
					<div className='summary-item'><strong>Sessions:</strong> {this.state.campaignParameters.expectedSessions}</div>
					<div className='summary-item'><strong>Levels:</strong> {this.state.campaignParameters.startingLevel} - {this.state.campaignParameters.endingLevel}</div>
					<div className='summary-item'><strong>Experience:</strong> {this.state.campaignParameters.playerExperience}</div>
					<div className='summary-item'><strong>Genres:</strong> {this.state.campaignParameters.preferredGenres.join(', ') || 'None selected'}</div>
				</div>
			</div>
		);
	},

	render : function() {
		if (!this.state.isOpen) return null;

		return (
			<div className='mythwright-wizard-overlay'>
				<div className='mythwright-wizard'>
					<div className='wizard-header'>
						<h2>
							<i className='fas fa-dragon'></i>
							Create AI-Generated Campaign
						</h2>
						<button className='close-btn' onClick={this.closeModal}>
							<i className='fas fa-times'></i>
						</button>
					</div>

					<div className='progress-bar'>
						<div className='progress-fill' style={{width: `${(this.state.currentStep / this.state.totalSteps) * 100}%`}}></div>
						<div className='step-indicator'>Step {this.state.currentStep} of {this.state.totalSteps}</div>
					</div>

					<div className='wizard-content'>
						{this.state.generating ? (
							<div className='generation-screen'>
								<div className='generation-animation'>
									<i className='fas fa-dragon fa-spin'></i>
									<h3>Generating Your Campaign...</h3>
									<p>AI is crafting your complete adventure with encounters, NPCs, storylines, and Homebrewery formatting.</p>
									<p>This may take 30-60 seconds depending on campaign complexity.</p>
									<div className='progress-dots'>
										<span>.</span><span>.</span><span>.</span>
									</div>
								</div>
							</div>
						) : (
							<>
								{this.state.currentStep === 1 && this.renderStep1()}
								{this.state.currentStep === 2 && this.renderStep2()}
								{this.state.currentStep === 3 && this.renderStep3()}
								{this.state.currentStep === 4 && this.renderStep4()}
								{this.state.currentStep === 5 && this.renderStep5()}
								{this.state.currentStep === 6 && this.renderStep6()}

								<div className='wizard-footer'>
									{this.state.currentStep > 1 && (
										<button className='btn secondary' onClick={this.prevStep}>
											<i className='fas fa-arrow-left'></i>
											Previous
										</button>
									)}
									
									{this.state.currentStep < this.state.totalSteps ? (
										<button className='btn primary' onClick={this.nextStep}>
											Next
											<i className='fas fa-arrow-right'></i>
										</button>
									) : (
										<button className='btn generate' onClick={this.generateCampaign}>
											<i className='fas fa-dragon'></i>
											Generate Campaign
										</button>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}
});

// Make it available globally
if (typeof window !== 'undefined') {
	window.MythwrightProjectWizard = MythwrightProjectWizard;
}

export default MythwrightProjectWizard;