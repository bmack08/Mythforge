import React from 'react';
import createClass from 'create-react-class';
import Navbar from '../../navbar/navbar.jsx';

const ProjectsPage = createClass({
	displayName: 'ProjectsPage',

	getInitialState: function() {
		return {
			projects: [],
			loading: true,
			error: null
		};
	},

	componentDidMount: function() {
		this.loadProjects();
	},

	loadProjects: function() {
		this.setState({ loading: true, error: null });
		
		fetch('/api/projects')
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.setState({
						projects: data.projects,
						loading: false
					});
				} else {
					this.setState({
						error: data.error || 'Failed to load projects',
						loading: false
					});
				}
			})
			.catch(error => {
				console.error('Error loading projects:', error);
				this.setState({
					error: 'Failed to load projects',
					loading: false
				});
			});
	},

	formatDate: function(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	},

	renderProject: function(project) {
		return (
			<div key={project.editId} className="project-item">
				<div className="project-header">
					<h3 className="project-title">{project.title}</h3>
					<div className="project-meta">
						<span className="project-date">Created: {this.formatDate(project.createdAt)}</span>
						<span className="project-views">{project.views ?? 0} views</span>
					</div>
				</div>
				{project.description && (
					<p className="project-description">{project.description}</p>
				)}
				<div className="project-actions">
					<a href={project.url} className="btn btn-primary">
						<i className="fas fa-edit"></i> Edit
					</a>
					<a href={`/share/${project.shareId}`} className="btn btn-secondary" target="_blank">
						<i className="fas fa-share"></i> Share
					</a>
					<button 
						className="btn btn-danger" 
						onClick={() => this.deleteProject(project.editId || project.id)}
					>
						<i className="fas fa-trash"></i> Delete
					</button>
				</div>
			</div>
		);
	},

	deleteProject: function(editId) {
		if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
			fetch(`/api/brews/${encodeURIComponent(editId)}`, { method: 'DELETE' })
				.then(response => {
					if (response.ok) {
						// Optimistic removal from local state
						this.setState(prev => ({
							projects: prev.projects.filter(p => (p.editId || p.id) !== editId)
						}));
					} else {
						response.json().then(body => {
							alert(body?.error || 'Failed to delete project');
						}).catch(() => alert('Failed to delete project'));
					}
				})
				.catch(error => {
					console.error('Error deleting project:', error);
					alert('Failed to delete project');
				});
		}
	},

	render: function() {
		const { projects, loading, error } = this.state;

		return (
			<div className='projectsPage sitePage listPage'>
				<Navbar />
				<div className="content">
				<div className="projects-container">
					<div className="projects-header">
						<h1><i className="fas fa-folder-open"></i> My Projects</h1>
						<p>Manage your AI-generated campaigns and adventures</p>
						<button 
							className="btn btn-primary"
							onClick={() => window.location.href = '/new'}
						>
							<i className="fas fa-plus"></i> New Campaign
						</button>
					</div>

					{loading && (
						<div className="loading">
							<i className="fas fa-spinner fa-spin"></i> Loading projects...
						</div>
					)}

					{error && (
						<div className="error">
							<i className="fas fa-exclamation-triangle"></i> {error}
							<button onClick={this.loadProjects} className="btn btn-sm">
								Try Again
							</button>
						</div>
					)}

					{!loading && !error && projects.length === 0 && (
						<div className="empty-state">
							<i className="fas fa-folder-open"></i>
							<h3>No projects yet</h3>
							<p>Create your first AI-generated campaign to get started!</p>
							<a href="/new" className="btn btn-primary">
								<i className="fas fa-plus"></i> Create Campaign
							</a>
						</div>
					)}

					{!loading && !error && projects.length > 0 && (
						<div className="projects-grid">
							{projects.map(this.renderProject)}
						</div>
					)}
				</div>
				</div>
			</div>
		);
	}
});

export default ProjectsPage;
