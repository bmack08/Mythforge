require('./mythwrightModal.less');
const React = require('react');
const createClass = require('create-react-class');

const MythwrightModal = createClass({
	displayName : 'MythwrightModal',

	getInitialState : function() {
		return {
			isOpen: false,
			step: 1,
			totalSteps: 6,
			campaignData: {
				title: '',
				level: 'low',
				adventureType: 'dungeon',
				theme: 'classic-fantasy',
				partySize: 4,
				sessionCount: 3,
				complexity: 'moderate',
				playerExperience: 'mixed',
				genres: ['fantasy'],
				goals: ['combat', 'exploration'],
				budgetPreferences: {
					combatWeight: 50,
					explorationWeight: 30,
					socialWeight: 20,
					treasureLevel: 'standard',
					difficultyVariance: 'moderate'
				}
			},
			generating: false
		};
	},

	openModal : function() {
		this.setState({ isOpen: true });
	},

	closeModal : function() {
		this.setState({ 
			isOpen: false,
			step: 1,
			generating: false 
		});
	},

	nextStep : function() {
		this.setState({
			step: Math.min(this.state.step + 1, this.state.totalSteps)
		});
	},

	prevStep : function() {
		this.setState({
			step: Math.max(this.state.step - 1, 1)
		});
	},

	handleInputChange : function(field, value) {
		if (field.startsWith('budgetPreferences.')) {
			const budgetField = field.split('.')[1];
			this.setState({
				campaignData: {
					...this.state.campaignData,
					budgetPreferences: {
						...this.state.campaignData.budgetPreferences,
						[budgetField]: value
					}
				}
			});
		} else {
			this.setState({
				campaignData: {
					...this.state.campaignData,
					[field]: value
				}
			});
		}
	},

	handleArrayToggle : function(field, value) {
		const currentArray = this.state.campaignData[field] || [];
		const newArray = currentArray.includes(value)
			? currentArray.filter(item => item !== value)
			: [...currentArray, value];
		
		this.setState({
			campaignData: {
				...this.state.campaignData,
				[field]: newArray
			}
		});
	},

	calculateBudget : function() {
		const { campaignData } = this.state;
		const partyLevel = campaignData.level === 'low' ? 3 : campaignData.level === 'mid' ? 8 : campaignData.level === 'high' ? 13 : 18;
		const baseXPPerSession = partyLevel * campaignData.partySize * 500;
		const totalXPBudget = baseXPPerSession * campaignData.sessionCount;
		
		return {
			totalXPBudget,
			xpPerSession: baseXPPerSession,
			partyLevel,
			combatBudget: Math.round(totalXPBudget * (campaignData.budgetPreferences.combatWeight / 100)),
			explorationBudget: Math.round(totalXPBudget * (campaignData.budgetPreferences.explorationWeight / 100)),
			socialBudget: Math.round(totalXPBudget * (campaignData.budgetPreferences.socialWeight / 100))
		};
	},

	generateCampaign : function() {
		this.setState({ generating: true });

		// Calculate budget and prepare enhanced campaign data
		const budgetCalculation = this.calculateBudget();
		const enhancedCampaignData = {
			...this.state.campaignData,
			budgetCalculation,
			writingStyleRules: '/server/services/ai/writing-style-rules.json'
		};
		
		// Call the actual Mythwright AI generation API
		fetch('/api/mythwright/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(enhancedCampaignData)
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

	renderStep1 : function() {
		return (
			<div className='step-content'>
				<h3>Campaign Basics</h3>
				<div className='form-group'>
					<label>Adventure Title</label>
					<input 
						type='text'
						value={this.state.campaignData.title}
						onChange={(e) => this.handleInputChange('title', e.target.value)}
						placeholder='The Crystal Caverns'
					/>
				</div>
				<div className='form-group'>
					<label>Adventure Level</label>
					<select 
						value={this.state.campaignData.level}
						onChange={(e) => this.handleInputChange('level', e.target.value)}
					>
						<option value='low'>Level 1-5 (Low Level)</option>
						<option value='mid'>Level 6-10 (Mid Level)</option>
						<option value='high'>Level 11-16 (High Level)</option>
						<option value='epic'>Level 17-20 (Epic Level)</option>
					</select>
				</div>
				<div className='form-group'>
					<label>Party Size</label>
					<select 
						value={this.state.campaignData.partySize}
						onChange={(e) => this.handleInputChange('partySize', parseInt(e.target.value))}
					>
						<option value={3}>3 Players</option>
						<option value={4}>4 Players</option>
						<option value={5}>5 Players</option>
						<option value={6}>6 Players</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep2 : function() {
		return (
			<div className='step-content'>
				<h3>Adventure Type & Theme</h3>
				<div className='form-group'>
					<label>Adventure Type</label>
					<div className='radio-grid'>
						{[
							{ value: 'dungeon', label: '🏰 Dungeon Crawl', desc: 'Classic dungeon exploration' },
							{ value: 'mystery', label: '🔍 Investigation Mystery', desc: 'Solve crimes and uncover secrets' },
							{ value: 'intrigue', label: '🎭 Social Intrigue', desc: 'Politics and diplomacy' },
							{ value: 'wilderness', label: '🌲 Wilderness Exploration', desc: 'Survive the wild lands' },
							{ value: 'city', label: '🏘️ City Adventure', desc: 'Urban quests and encounters' },
							{ value: 'planar', label: '✨ Planar Adventure', desc: 'Travel between planes' }
						].map(type => (
							<div 
								key={type.value}
								className={`radio-option ${this.state.campaignData.adventureType === type.value ? 'selected' : ''}`}
								onClick={() => this.handleInputChange('adventureType', type.value)}
							>
								<div className='radio-label'>{type.label}</div>
								<div className='radio-desc'>{type.desc}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	},

	renderStep3 : function() {
		return (
			<div className='step-content'>
				<h3>Campaign Settings</h3>
				<div className='form-group'>
					<label>Theme & Setting</label>
					<select 
						value={this.state.campaignData.theme}
						onChange={(e) => this.handleInputChange('theme', e.target.value)}
					>
						<option value='classic-fantasy'>Classic Fantasy</option>
						<option value='dark-fantasy'>Dark Fantasy</option>
						<option value='high-fantasy'>High Fantasy</option>
						<option value='steampunk'>Steampunk</option>
						<option value='modern'>Modern</option>
						<option value='sci-fi'>Science Fiction</option>
					</select>
				</div>
				<div className='form-group'>
					<label>Expected Session Count</label>
					<select 
						value={this.state.campaignData.sessionCount}
						onChange={(e) => this.handleInputChange('sessionCount', parseInt(e.target.value))}
					>
						<option value={1}>One-Shot (1 session)</option>
						<option value={3}>Short Arc (3 sessions)</option>
						<option value={6}>Medium Arc (6 sessions)</option>
						<option value={12}>Long Campaign (12+ sessions)</option>
					</select>
				</div>
				<div className='form-group'>
					<label>Complexity Level</label>
					<select 
						value={this.state.campaignData.complexity}
						onChange={(e) => this.handleInputChange('complexity', e.target.value)}
					>
						<option value='simple'>Simple - Basic encounters and plot</option>
						<option value='moderate'>Moderate - Multiple plot threads</option>
						<option value='complex'>Complex - Intricate storylines and politics</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep4 : function() {
		return (
			<div className='step-content'>
				<h3>Player Experience & Goals</h3>
				<div className='form-group'>
					<label>Player Experience Level</label>
					<select 
						value={this.state.campaignData.playerExperience}
						onChange={(e) => this.handleInputChange('playerExperience', e.target.value)}
					>
						<option value='beginner'>Mostly New Players</option>
						<option value='mixed'>Mixed Experience</option>
						<option value='experienced'>Experienced Players</option>
						<option value='veteran'>Veteran Players</option>
					</select>
				</div>
				<div className='form-group'>
					<label>Campaign Goals (Select Multiple)</label>
					<div className='checkbox-grid'>
						{[
							{ value: 'combat', label: '⚔️ Tactical Combat', desc: 'Strategic battles and encounters' },
							{ value: 'exploration', label: '🗺️ World Exploration', desc: 'Discover new lands and secrets' },
							{ value: 'roleplay', label: '🎭 Character Roleplay', desc: 'Deep character interactions' },
							{ value: 'mystery', label: '🔍 Problem Solving', desc: 'Puzzles and investigations' },
							{ value: 'politics', label: '👑 Political Intrigue', desc: 'Social maneuvering and diplomacy' },
							{ value: 'survival', label: '🏕️ Survival Elements', desc: 'Resource management and harsh environments' }
						].map(goal => (
							<div 
								key={goal.value}
								className={`checkbox-option ${this.state.campaignData.goals.includes(goal.value) ? 'selected' : ''}`}
								onClick={() => this.handleArrayToggle('goals', goal.value)}
							>
								<div className='checkbox-label'>{goal.label}</div>
								<div className='checkbox-desc'>{goal.desc}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	},

	renderStep5 : function() {
		const { budgetPreferences } = this.state.campaignData;
		return (
			<div className='step-content'>
				<h3>Budget & Balance Settings</h3>
				<div className='form-group'>
					<label>Activity Distribution</label>
					<div className='slider-group'>
						<div className='slider-item'>
							<label>Combat Focus: {budgetPreferences.combatWeight}%</label>
							<input 
								type='range' 
								min='10' 
								max='80' 
								value={budgetPreferences.combatWeight}
								onChange={(e) => {
									const newValue = parseInt(e.target.value);
									const remaining = 100 - newValue;
									const explorationRatio = budgetPreferences.explorationWeight / (budgetPreferences.explorationWeight + budgetPreferences.socialWeight);
									this.handleInputChange('budgetPreferences.combatWeight', newValue);
									this.handleInputChange('budgetPreferences.explorationWeight', Math.round(remaining * explorationRatio));
									this.handleInputChange('budgetPreferences.socialWeight', remaining - Math.round(remaining * explorationRatio));
								}}
							/>
						</div>
						<div className='slider-item'>
							<label>Exploration Focus: {budgetPreferences.explorationWeight}%</label>
							<input 
								type='range' 
								min='10' 
								max='60' 
								value={budgetPreferences.explorationWeight}
								onChange={(e) => {
									const newValue = parseInt(e.target.value);
									const remaining = 100 - budgetPreferences.combatWeight - newValue;
									this.handleInputChange('budgetPreferences.explorationWeight', newValue);
									this.handleInputChange('budgetPreferences.socialWeight', remaining);
								}}
							/>
						</div>
						<div className='slider-item'>
							<label>Social Focus: {budgetPreferences.socialWeight}%</label>
							<span className='slider-readonly'>{budgetPreferences.socialWeight}%</span>
						</div>
					</div>
				</div>
				<div className='form-group'>
					<label>Treasure & Rewards Level</label>
					<select 
						value={budgetPreferences.treasureLevel}
						onChange={(e) => this.handleInputChange('budgetPreferences.treasureLevel', e.target.value)}
					>
						<option value='minimal'>Minimal Rewards (Low Magic)</option>
						<option value='standard'>Standard Rewards (Moderate Magic)</option>
						<option value='generous'>Generous Rewards (High Magic)</option>
					</select>
				</div>
				<div className='form-group'>
					<label>Difficulty Variance</label>
					<select 
						value={budgetPreferences.difficultyVariance}
						onChange={(e) => this.handleInputChange('budgetPreferences.difficultyVariance', e.target.value)}
					>
						<option value='consistent'>Consistent Difficulty</option>
						<option value='moderate'>Moderate Variation</option>
						<option value='dynamic'>Dynamic Challenge Scaling</option>
					</select>
				</div>
			</div>
		);
	},

	renderStep6 : function() {
		const { campaignData } = this.state;
		const budgetCalculation = this.calculateBudget();
		
		return (
			<div className='step-content'>
				<h3>Review & Generate</h3>
				<div className='campaign-summary'>
					<div className='summary-section'>
						<h4>Campaign Summary</h4>
						<div className='summary-grid'>
							<div><strong>Title:</strong> {campaignData.title || 'Untitled Adventure'}</div>
							<div><strong>Level:</strong> {campaignData.level} (Avg Level {budgetCalculation.partyLevel})</div>
							<div><strong>Type:</strong> {campaignData.adventureType}</div>
							<div><strong>Theme:</strong> {campaignData.theme}</div>
							<div><strong>Party Size:</strong> {campaignData.partySize} players</div>
							<div><strong>Sessions:</strong> {campaignData.sessionCount}</div>
							<div><strong>Complexity:</strong> {campaignData.complexity}</div>
							<div><strong>Player Experience:</strong> {campaignData.playerExperience}</div>
							<div><strong>Focus Goals:</strong> {campaignData.goals.join(', ')}</div>
						</div>
					</div>
					
					<div className='summary-section'>
						<h4>Budget Breakdown</h4>
						<div className='budget-grid'>
							<div><strong>Total XP Budget:</strong> {budgetCalculation.totalXPBudget.toLocaleString()}</div>
							<div><strong>XP Per Session:</strong> {budgetCalculation.xpPerSession.toLocaleString()}</div>
							<div><strong>Combat XP:</strong> {budgetCalculation.combatBudget.toLocaleString()} ({campaignData.budgetPreferences.combatWeight}%)</div>
							<div><strong>Exploration XP:</strong> {budgetCalculation.explorationBudget.toLocaleString()} ({campaignData.budgetPreferences.explorationWeight}%)</div>
							<div><strong>Social XP:</strong> {budgetCalculation.socialBudget.toLocaleString()} ({campaignData.budgetPreferences.socialWeight}%)</div>
							<div><strong>Treasure Level:</strong> {campaignData.budgetPreferences.treasureLevel}</div>
						</div>
					</div>
				</div>
				
				<div className='ai-features'>
					<h4>AI Will Generate:</h4>
					<ul>
						<li>✨ Complete adventure storyline with budget-balanced encounters</li>
						<li>🐉 {budgetCalculation.combatBudget.toLocaleString()} XP worth of combat encounters</li>
						<li>🗺️ {budgetCalculation.explorationBudget.toLocaleString()} XP worth of exploration challenges</li>
						<li>🎭 {budgetCalculation.socialBudget.toLocaleString()} XP worth of social encounters</li>
						<li>👥 Memorable NPCs tailored to {campaignData.playerExperience} players</li>
						<li>🏰 Detailed locations matching {campaignData.theme} theme</li>
						<li>💰 {campaignData.budgetPreferences.treasureLevel} treasure distribution</li>
						<li>📜 Handouts and materials for {campaignData.sessionCount} sessions</li>
					</ul>
				</div>
			</div>
		);
	},

	render : function() {
		if (!this.state.isOpen) return null;

		return (
			<div className='mythwright-modal-overlay'>
				<div className='mythwright-modal'>
					<div className='modal-header'>
						<h2>
							<i className='fas fa-magic'></i>
							Create Mythwright Campaign
						</h2>
						<button className='close-btn' onClick={this.closeModal}>
							<i className='fas fa-times'></i>
						</button>
					</div>

					<div className='progress-bar'>
						<div className='progress-fill' style={{width: `${(this.state.step / this.state.totalSteps) * 100}%`}}></div>
					</div>

					<div className='modal-content'>
						{this.state.generating ? (
							<div className='generation-screen'>
								<div className='generation-animation'>
									<div className='dragon-breathing-fire'>
										<i className='fas fa-dragon'></i>
										<div className='fire-effect'>
											<i className='fas fa-fire'></i>
											<i className='fas fa-fire'></i>
											<i className='fas fa-fire'></i>
										</div>
										<div className='book-icon'>
											<i className='fas fa-book'></i>
										</div>
									</div>
									<h3>Breathing Life Into Your Story...</h3>
									<p>Our dragon is forging your complete adventure with encounters, NPCs, storylines, and Homebrewery formatting.</p>
									<p>This may take 30-60 seconds depending on campaign complexity.</p>
									<div className='progress-dots'>
										<span>.</span><span>.</span><span>.</span>
									</div>
								</div>
							</div>
						) : (
							<>
								{this.state.step === 1 && this.renderStep1()}
								{this.state.step === 2 && this.renderStep2()}
								{this.state.step === 3 && this.renderStep3()}
								{this.state.step === 4 && this.renderStep4()}
								{this.state.step === 5 && this.renderStep5()}
								{this.state.step === 6 && this.renderStep6()}

								<div className='modal-footer'>
									{this.state.step > 1 && (
										<button className='btn secondary' onClick={this.prevStep}>
											<i className='fas fa-arrow-left'></i>
											Previous
										</button>
									)}
									
									{this.state.step < this.state.totalSteps ? (
										<button className='btn primary' onClick={this.nextStep}>
											Next
											<i className='fas fa-arrow-right'></i>
										</button>
									) : (
										<button className='btn generate' onClick={this.generateCampaign}>
											<i className='fas fa-magic'></i>
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

// Make it available globally so it can be triggered from navbar
if (typeof window !== 'undefined') {
	window.MythwrightModal = MythwrightModal;
}

module.exports = MythwrightModal;