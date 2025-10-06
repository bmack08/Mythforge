import './inlineEditor.less';
import React from 'react';
import createClass from 'create-react-class';

const InlineEditor = createClass({
	displayName : 'InlineEditor',

	getInitialState : function() {
		return {
			isVisible: false,
			selectedText: '',
			selectionStart: 0,
			selectionEnd: 0,
			suggestions: [],
			isLoading: false,
			activeOperation: null
		};
	},

	componentDidMount : function() {
		document.addEventListener('mouseup', this.handleTextSelection);
		document.addEventListener('keyup', this.handleKeySelection);
	},

	componentWillUnmount : function() {
		document.removeEventListener('mouseup', this.handleTextSelection);
		document.removeEventListener('keyup', this.handleKeySelection);
	},

	handleTextSelection : function(e) {
		const selection = window.getSelection();
		const selectedText = selection.toString().trim();
		
		if (selectedText && selectedText.length > 0) {
			const editorElement = document.querySelector('.editor textarea');
			if (editorElement && selection.anchorNode) {
				// Check if selection is within the editor
				const isInEditor = editorElement.contains(selection.anchorNode) || 
					editorElement === selection.anchorNode;
				
				if (isInEditor) {
					const range = selection.getRangeAt(0);
					const rect = range.getBoundingClientRect();
					
					this.setState({
						isVisible: true,
						selectedText: selectedText,
						selectionStart: editorElement.selectionStart,
						selectionEnd: editorElement.selectionEnd,
						position: {
							x: rect.left + rect.width / 2,
							y: rect.top - 10
						}
					});
					return;
				}
			}
		}
		
		// Hide if no valid selection
		this.setState({ isVisible: false });
	},

	handleKeySelection : function(e) {
		// Handle keyboard-based text selection
		if (e.ctrlKey || e.shiftKey) {
			setTimeout(() => this.handleTextSelection(e), 10);
		}
	},

	performInlineEdit : function(operation) {
		if (!this.state.selectedText || this.state.isLoading) return;

		this.setState({ 
			isLoading: true, 
			activeOperation: operation,
			suggestions: []
		});

		const brewId = this.props.brew?.editId || this.props.brew?.shareId;
		const documentText = this.props.getText ? this.props.getText() : '';

		// Call legacy Story Assistant endpoint for inline edits (keeps existing suggestion shape)
		fetch('/api/story-assistant', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				message: this.getOperationPrompt(operation),
				documentText: documentText,
				metadata: { 
					editId: brewId,
					selectedText: this.state.selectedText,
					selectionStart: this.state.selectionStart,
					selectionEnd: this.state.selectionEnd
				},
				editType: 'inline_edit'
			})
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				this.setState({
					suggestions: [data],
					isLoading: false
				});
			} else {
				console.error('Inline edit failed:', data.error);
				this.setState({ 
					isLoading: false,
					suggestions: [{
						success: false,
						message: data.error || 'Failed to process inline edit'
					}]
				});
			}
		})
		.catch(error => {
			console.error('Inline edit error:', error);
			this.setState({ 
				isLoading: false,
				suggestions: [{
					success: false,
					message: 'Network error during inline edit'
				}]
			});
		});
	},

	getOperationPrompt : function(operation) {
		const selectedText = this.state.selectedText;
		
		const prompts = {
			expand: `Expand this text with rich D&D detail while maintaining the original meaning: "${selectedText}"`,
			rewrite: `Rewrite this text to improve clarity and flow while preserving the meaning: "${selectedText}"`,
			summarize: `Create a concise summary of this text: "${selectedText}"`,
			tone_formal: `Rewrite this text in a more formal, professional tone: "${selectedText}"`,
			tone_casual: `Rewrite this text in a more casual, conversational tone: "${selectedText}"`,
			tone_dramatic: `Rewrite this text with more dramatic, epic language: "${selectedText}"`,
			add_detail: `Add more descriptive detail to this text: "${selectedText}"`,
			fix_grammar: `Fix any grammar, spelling, or style issues in this text: "${selectedText}"`,
			make_dialogue: `Convert this text into natural D&D dialogue: "${selectedText}"`
		};

		return prompts[operation] || `Improve this text: "${selectedText}"`;
	},

	applySuggestion : function(suggestion) {
		if (!suggestion.success || !suggestion.newText) return;

		// Apply the change using the editor callback
		if (this.props.onInlineEdit) {
			this.props.onInlineEdit(
				this.state.selectionStart,
				this.state.selectionEnd,
				suggestion.newText
			);
		} else if (this.props.setText && this.props.getText) {
			// Fallback: replace the selected text
			const currentText = this.props.getText();
			const beforeSelection = currentText.substring(0, this.state.selectionStart);
			const afterSelection = currentText.substring(this.state.selectionEnd);
			const newText = beforeSelection + suggestion.newText + afterSelection;
			this.props.setText(newText);
		}

		// Hide the inline editor
		this.setState({ 
			isVisible: false, 
			suggestions: [],
			selectedText: ''
		});
	},

	dismissSuggestions : function() {
		this.setState({ 
			suggestions: [],
			activeOperation: null
		});
	},

	hideInlineEditor : function() {
		this.setState({ 
			isVisible: false,
			suggestions: [],
			selectedText: '',
			activeOperation: null
		});
	},

	renderOperationButtons : function() {
		const operations = [
			{ id: 'expand', icon: 'fas fa-expand-arrows-alt', label: 'Expand', color: '#10b981' },
			{ id: 'rewrite', icon: 'fas fa-edit', label: 'Rewrite', color: '#3b82f6' },
			{ id: 'summarize', icon: 'fas fa-compress-arrows-alt', label: 'Summarize', color: '#f59e0b' },
			{ id: 'tone_dramatic', icon: 'fas fa-fire', label: 'Epic Tone', color: '#ef4444' },
			{ id: 'add_detail', icon: 'fas fa-plus-circle', label: 'Add Detail', color: '#8b5cf6' },
			{ id: 'fix_grammar', icon: 'fas fa-spell-check', label: 'Fix Grammar', color: '#06b6d4' }
		];

		return (
			<div className="operation-buttons">
				{operations.map(op => (
					<button
						key={op.id}
						className={`operation-btn ${this.state.activeOperation === op.id ? 'active' : ''}`}
						onClick={() => this.performInlineEdit(op.id)}
						disabled={this.state.isLoading}
						style={{ borderColor: op.color }}
						title={op.label}
					>
						<i className={op.icon} style={{ color: op.color }}></i>
						<span>{op.label}</span>
					</button>
				))}
			</div>
		);
	},

	renderSuggestions : function() {
		if (this.state.suggestions.length === 0) return null;

		return (
			<div className="suggestions-panel">
				<div className="suggestions-header">
					<h4>
						<i className="fas fa-lightbulb"></i>
						Suggestions
					</h4>
					<button className="dismiss-btn" onClick={this.dismissSuggestions}>
						<i className="fas fa-times"></i>
					</button>
				</div>
				
				<div className="suggestions-list">
					{this.state.suggestions.map((suggestion, index) => (
						<div key={index} className={`suggestion ${suggestion.success ? 'success' : 'error'}`}>
							{suggestion.success ? (
								<>
									<div className="suggestion-header">
										<span className="suggestion-type">{this.state.activeOperation}</span>
										{suggestion.reasoning && (
											<span className="suggestion-reasoning">{suggestion.reasoning}</span>
										)}
									</div>
									<div className="suggestion-content">
										<div className="original-text">
											<strong>Original:</strong>
											<div className="text-preview">{suggestion.originalText || this.state.selectedText}</div>
										</div>
										<div className="new-text">
											<strong>Suggested:</strong>
											<div className="text-preview">{suggestion.newText}</div>
										</div>
									</div>
									<div className="suggestion-actions">
										<button className="apply-btn" onClick={() => this.applySuggestion(suggestion)}>
											<i className="fas fa-check"></i> Apply
										</button>
										<button className="reject-btn" onClick={this.dismissSuggestions}>
											<i className="fas fa-times"></i> Reject
										</button>
									</div>
								</>
							) : (
								<div className="error-message">
									<i className="fas fa-exclamation-triangle"></i>
									{suggestion.message}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	},

	render : function() {
		if (!this.state.isVisible && this.state.suggestions.length === 0) return null;

		const style = this.state.position ? {
			position: 'fixed',
			left: this.state.position.x,
			top: this.state.position.y,
			transform: 'translateX(-50%)',
			zIndex: 2000
		} : {};

		return (
			<div className="inline-editor" style={style}>
				{this.state.isVisible && this.state.selectedText && (
					<div className="inline-toolbar">
						<div className="selected-text-info">
							<i className="fas fa-i-cursor"></i>
							<span>"{this.state.selectedText.substring(0, 30)}{this.state.selectedText.length > 30 ? '...' : ''}"</span>
						</div>
						
						{this.state.isLoading ? (
							<div className="loading-operations">
								<i className="fas fa-spinner fa-spin"></i>
								<span>Processing...</span>
							</div>
						) : (
							this.renderOperationButtons()
						)}

						<button className="close-btn" onClick={this.hideInlineEditor}>
							<i className="fas fa-times"></i>
						</button>
					</div>
				)}

				{this.renderSuggestions()}
			</div>
		);
	}
});

export default InlineEditor;
