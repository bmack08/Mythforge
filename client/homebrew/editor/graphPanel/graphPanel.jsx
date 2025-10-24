import './graphPanel.less';
import React from 'react';
import createClass from 'create-react-class';

const GraphPanel = createClass({
	displayName : 'GraphPanel',

	getInitialState : function() {
		return {
			isExpanded: false,
			isLoading: false,
			graph: null,
			error: null,
			selectedNode: null,
			searchQuery: '',
			searchResults: null
		};
	},

	toggleExpanded : function() {
		this.setState({
			isExpanded: !this.state.isExpanded
		}, () => {
			if (this.state.isExpanded && !this.state.graph) {
				this.loadProjectGraph();
			}
		});
	},

	loadProjectGraph : function() {
		const brewId = this.props.brew?.editId || this.props.brew?.shareId;
		if (!brewId) return;

		this.setState({ isLoading: true, error: null });

		fetch(`/api/story-ide/graph/${brewId}`)
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.setState({
						graph: data.graph,
						isLoading: false
					});
				} else {
					this.setState({
						error: data.error || 'Failed to load project graph',
						isLoading: false
					});
				}
			})
			.catch(error => {
				console.error('Error loading project graph:', error);
				this.setState({
					error: 'Network error loading project graph',
					isLoading: false
				});
			});
	},

	handleSearch : function() {
		const query = this.state.searchQuery.trim();
		if (!query) return;

		const brewId = this.props.brew?.editId || this.props.brew?.shareId;
		if (!brewId) return;

		this.setState({ isLoading: true });

		fetch(`/api/story-ide/search/${brewId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: query })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.setState({
						searchResults: data.results,
						isLoading: false
					});
				} else {
					this.setState({
						error: data.error || 'Search failed',
						isLoading: false
					});
				}
			})
			.catch(error => {
				console.error('Error searching project:', error);
				this.setState({
					error: 'Network error during search',
					isLoading: false
				});
			});
	},

	handleSearchInputChange : function(e) {
		this.setState({ searchQuery: e.target.value });
	},

	handleSearchKeyPress : function(e) {
		if (e.key === 'Enter') {
			this.handleSearch();
		}
	},

	selectNode : function(node) {
		this.setState({ selectedNode: node });
	},

	getNodeColor : function(type) {
		const colors = {
			npc: '#8b5cf6',      // Purple
			location: '#10b981',  // Green
			item: '#f59e0b',     // Orange
			event: '#ef4444',    // Red
			faction: '#3b82f6',  // Blue
			spell: '#ec4899',    // Pink
			monster: '#dc2626'   // Dark Red
		};
		return colors[type] || '#6b7280'; // Gray default
	},

	renderNode : function(node) {
		const color = this.getNodeColor(node.type);
		const isSelected = this.state.selectedNode && this.state.selectedNode.id === node.id;
		
		return (
			<div 
				key={node.id} 
				className={`graph-node ${node.type} ${isSelected ? 'selected' : ''}`}
				style={{ borderColor: color }}
				onClick={() => this.selectNode(node)}
			>
				<div className="node-icon" style={{ backgroundColor: color }}>
					{this.getNodeIcon(node.type)}
				</div>
				<div className="node-content">
					<div className="node-name">{node.name}</div>
					<div className="node-type">{node.type}</div>
				</div>
			</div>
		);
	},

	getNodeIcon : function(type) {
		const icons = {
			npc: '👤',
			location: '🏰',
			item: '⚔️',
			event: '⚡',
			faction: '🛡️',
			spell: '✨',
			monster: '🐉'
		};
		return icons[type] || '📄';
	},

	renderEntityList : function() {
		if (!this.state.graph || !this.state.graph.nodes) return null;

		const groupedNodes = {};
		this.state.graph.nodes.forEach(node => {
			if (!groupedNodes[node.type]) {
				groupedNodes[node.type] = [];
			}
			groupedNodes[node.type].push(node);
		});

		return (
			<div className="entity-list">
				{Object.entries(groupedNodes).map(([type, nodes]) => (
					<div key={type} className="entity-group">
						<h4 className="entity-group-title">
							{this.getNodeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}s ({nodes.length})
						</h4>
						<div className="entity-group-items">
							{nodes.map(node => this.renderNode(node))}
						</div>
					</div>
				))}
			</div>
		);
	},

	renderSearchResults : function() {
		if (!this.state.searchResults) return null;

		const { relevantChunks, relatedEntities } = this.state.searchResults;

		return (
			<div className="search-results">
				<h4>Search Results</h4>
				
				{relatedEntities.length > 0 && (
					<div className="search-section">
						<h5>Related Entities ({relatedEntities.length})</h5>
						{relatedEntities.map(entity => (
							<div key={entity.id} className="search-entity">
								<span className="entity-name">{entity.name}</span>
								<span className="entity-type">({entity.type})</span>
								<div className="entity-description">{entity.description}</div>
							</div>
						))}
					</div>
				)}

				{relevantChunks.length > 0 && (
					<div className="search-section">
						<h5>Relevant Content ({relevantChunks.length})</h5>
						{relevantChunks.map((chunk, index) => (
							<div key={index} className="search-chunk">
								<div className="chunk-type">{chunk.chunk_type}</div>
								<div className="chunk-content">
									{chunk.content.substring(0, 150)}
									{chunk.content.length > 150 ? '...' : ''}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	},

	renderNodeDetails : function() {
		if (!this.state.selectedNode) return null;

		const node = this.state.selectedNode;
		const connections = this.state.graph?.edges?.filter(edge => 
			edge.source === node.id || edge.target === node.id
		) || [];

		return (
			<div className="node-details">
				<h4>
					{this.getNodeIcon(node.type)} {node.name}
				</h4>
				<div className="node-meta">
					<span className="node-type-badge" style={{ backgroundColor: this.getNodeColor(node.type) }}>
						{node.type}
					</span>
				</div>
				{node.description && (
					<div className="node-description">
						{node.description}
					</div>
				)}
				{connections.length > 0 && (
					<div className="node-connections">
						<h5>Connections ({connections.length})</h5>
						{connections.map((connection, index) => {
							const otherNodeId = connection.source === node.id ? connection.target : connection.source;
							const otherNode = this.state.graph.nodes.find(n => n.id === otherNodeId);
							if (!otherNode) return null;

							return (
								<div key={index} className="connection">
									<span className="connection-type">{connection.type}</span>
									<span className="connection-target" onClick={() => this.selectNode(otherNode)}>
										{this.getNodeIcon(otherNode.type)} {otherNode.name}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
	},

	render : function() {
		if (!this.state.isExpanded) {
			return (
				<div className='graph-panel collapsed'>
					<div className='graph-toggle' onClick={this.toggleExpanded}>
						<i className='fas fa-project-diagram'></i>
						<span>Project Graph</span>
					</div>
				</div>
			);
		}

		return (
			<div className='graph-panel expanded'>
				<div className='graph-header'>
					<h3>
						<i className='fas fa-project-diagram'></i>
						Project Graph
					</h3>
					<button className='close-btn' onClick={this.toggleExpanded}>
						<i className='fas fa-times'></i>
					</button>
				</div>

				<div className='graph-content'>
					<div className='graph-search'>
						<div className='search-input'>
							<input
								type="text"
								placeholder="Search entities, content..."
								value={this.state.searchQuery}
								onChange={this.handleSearchInputChange}
								onKeyPress={this.handleSearchKeyPress}
							/>
							<button className='search-btn' onClick={this.handleSearch}>
								<i className="fas fa-search"></i>
							</button>
						</div>
					</div>

					{this.state.isLoading && (
						<div className='loading'>
							<i className='fas fa-spinner fa-spin'></i> Loading...
						</div>
					)}

					{this.state.error && (
						<div className='error'>
							<i className='fas fa-exclamation-triangle'></i> {this.state.error}
							<button className='btn btn-sm' onClick={this.loadProjectGraph}>Retry</button>
						</div>
					)}

					{this.state.searchResults && this.renderSearchResults()}

					{!this.state.isLoading && !this.state.error && this.state.graph && (
						<div className="graph-main">
							<div className="graph-stats">
								<span>{this.state.graph.nodes.length} entities</span>
								<span>{this.state.graph.edges.length} connections</span>
							</div>
							
							<div className="graph-view">
								{this.renderEntityList()}
							</div>
						</div>
					)}

					{this.state.selectedNode && this.renderNodeDetails()}

					{!this.state.isLoading && !this.state.error && !this.state.graph && (
						<div className='empty-state'>
							<i className='fas fa-project-diagram'></i>
							<h4>No Project Data</h4>
							<p>Start writing your story to see entities and relationships appear here.</p>
						</div>
					)}
				</div>
			</div>
		);
	}
});

export default GraphPanel;
