const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

const AIAssistantNavItem = createClass({
  displayName: 'AIAssistantNavItem',

  getInitialState: function() {
    return {
      showModal: false,
      chatMessages: [],
      currentMessage: '',
      isProcessing: false,
      previewChanges: null,
      showPreview: false
    };
  },

  toggleModal: function() {
    this.setState({ showModal: !this.state.showModal });
  },

  handleInputChange: function(e) {
    this.setState({ currentMessage: e.target.value });
  },

  handleKeyPress: function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  },

  sendMessage: function() {
    const message = this.state.currentMessage.trim();
    if (!message || this.state.isProcessing) return;

    // Add user message to chat
    const newMessages = [...this.state.chatMessages, {
      type: 'user',
      content: message,
      timestamp: new Date()
    }];

    this.setState({
      chatMessages: newMessages,
      currentMessage: '',
      isProcessing: true
    });

    // Get current document context
    const documentText = this.getCurrentDocumentText();
    const documentMetadata = this.getCurrentDocumentMetadata();

    // Send to AI story assistant API
    this.callStoryAssistantAPI(message, documentText, documentMetadata)
      .then(response => {
        // Add AI response to chat
        const updatedMessages = [...newMessages, {
          type: 'assistant',
          content: response.message,
          timestamp: new Date(),
          hasChanges: response.hasChanges,
          previewChanges: response.previewChanges
        }];

        this.setState({
          chatMessages: updatedMessages,
          isProcessing: false,
          previewChanges: response.hasChanges ? response.previewChanges : null,
          showPreview: response.hasChanges
        });
      })
      .catch(error => {
        console.error('AI Assistant error:', error);
        const errorMessages = [...newMessages, {
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
          isError: true
        }];

        this.setState({
          chatMessages: errorMessages,
          isProcessing: false
        });
      });
  },

  getCurrentDocumentText: function() {
    // Get text from the editor if available
    if (window.editor && window.editor.getValue) {
      return window.editor.getValue();
    }
    
    // Fallback: try to get from textarea
    const textArea = document.querySelector('.editor textarea');
    if (textArea) {
      return textArea.value;
    }
    
    return '';
  },

  getCurrentDocumentMetadata: function() {
    // Extract metadata from the current page
    return {
      title: document.title,
      url: window.location.href,
      editId: window.location.pathname.includes('/edit/') ? 
        window.location.pathname.split('/edit/')[1] : null
    };
  },

  callStoryAssistantAPI: function(message, documentText, metadata) {
    return fetch('/api/story-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        documentText: documentText,
        metadata: metadata
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      return data;
    });
  },

  applyChanges: function() {
    if (!this.state.previewChanges) return;

    // Apply changes to the editor
    if (window.editor && window.editor.setValue) {
      window.editor.setValue(this.state.previewChanges);
    } else {
      // Fallback: update textarea
      const textArea = document.querySelector('.editor textarea');
      if (textArea) {
        textArea.value = this.state.previewChanges;
        // Trigger change event
        const event = new Event('input', { bubbles: true });
        textArea.dispatchEvent(event);
      }
    }

    // Add confirmation message
    const confirmationMessage = {
      type: 'system',
      content: '✅ Changes applied to your document!',
      timestamp: new Date()
    };

    this.setState({
      chatMessages: [...this.state.chatMessages, confirmationMessage],
      showPreview: false,
      previewChanges: null
    });
  },

  rejectChanges: function() {
    this.setState({
      showPreview: false,
      previewChanges: null
    });
  },

  renderChatMessage: function(message, index) {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div key={index} className={`chat-message ${message.type}`}>
        <div className="message-header">
          <i className={`fas ${isUser ? 'fa-user' : isSystem ? 'fa-cog' : 'fa-robot'}`}></i>
          <span className="message-sender">
            {isUser ? 'You' : isSystem ? 'System' : 'Story Assistant'}
          </span>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        <div className="message-content">
          {message.content}
          {message.hasChanges && (
            <div className="message-actions">
              <button className="preview-btn" onClick={() => this.setState({showPreview: true})}>
                <i className="fas fa-eye"></i> Preview Changes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },

  renderModal: function() {
    if (!this.state.showModal) return null;

    return (
      <div className="ai-assistant-modal-overlay" onClick={(e) => {
        if (e.target.classList.contains('ai-assistant-modal-overlay')) {
          this.toggleModal();
        }
      }}>
        <div className="ai-assistant-modal">
          <div className="modal-header">
            <h3><i className="fas fa-robot"></i> Story Assistant</h3>
            <button className="close-btn" onClick={this.toggleModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="chat-container">
              <div className="chat-messages">
                {this.state.chatMessages.length === 0 && (
                  <div className="welcome-message">
                    <i className="fas fa-dragon"></i>
                    <h4>Welcome to your Story Assistant!</h4>
                    <p>I can help you enhance your D&D campaign with:</p>
                    <ul>
                      <li>✨ Adding new plot elements and characters</li>
                      <li>🏰 Creating detailed locations and encounters</li>
                      <li>⚔️ Building NPCs with stat blocks</li>
                      <li>🛍️ Designing shops and magic items</li>
                      <li>📜 Writing authentic D&D dialogue</li>
                    </ul>
                    <p><strong>Just tell me what you'd like to add or change!</strong></p>
                  </div>
                )}
                
                {this.state.chatMessages.map(this.renderChatMessage)}
                
                {this.state.isProcessing && (
                  <div className="chat-message assistant processing">
                    <div className="message-header">
                      <i className="fas fa-robot"></i>
                      <span className="message-sender">Story Assistant</span>
                    </div>
                    <div className="message-content">
                      <i className="fas fa-spinner fa-spin"></i> Analyzing your story and crafting changes...
                    </div>
                  </div>
                )}
              </div>
              
              <div className="chat-input-container">
                <div className="chat-input">
                  <textarea
                    value={this.state.currentMessage}
                    onChange={this.handleInputChange}
                    onKeyPress={this.handleKeyPress}
                    placeholder="Tell me what you'd like to add or change in your story..."
                    rows="3"
                    disabled={this.state.isProcessing}
                  />
                  <button 
                    className="send-btn" 
                    onClick={this.sendMessage}
                    disabled={this.state.isProcessing || !this.state.currentMessage.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {this.state.showPreview && this.state.previewChanges && (
              <div className="preview-panel">
                <div className="preview-header">
                  <h4><i className="fas fa-eye"></i> Preview Changes</h4>
                  <div className="preview-actions">
                    <button className="apply-btn" onClick={this.applyChanges}>
                      <i className="fas fa-check"></i> Apply Changes
                    </button>
                    <button className="reject-btn" onClick={this.rejectChanges}>
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </div>
                </div>
                <div className="preview-content">
                  <textarea
                    value={this.state.previewChanges}
                    readOnly
                    rows="20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },

  render: function() {
    return (
      <>
        <Nav.item
          color='purple'
          icon='fas fa-robot'
          onClick={this.toggleModal}
          style={{ cursor: 'pointer' }}
        >
          AI Assistant
        </Nav.item>
        {this.renderModal()}
      </>
    );
  }
});

module.exports = AIAssistantNavItem;
