require('./aiSidebar.less');
const React = require('react');
const createClass = require('create-react-class');

const MAX_REFERENCE_SIZE = 1024 * 1024 * 30; // 30 MB per reference
const MAX_REFERENCE_CHARS = 20000;
const MAX_REFERENCES = 8;
const AiSidebar = createClass({
	displayName : 'AiSidebar',

	getInitialState : function() {
		return {
			isExpanded          : false,
			chatMessages        : [],
			currentMessage      : '',
			isProcessing        : false,
			uploadedReferences  : [],
			referenceErrors     : [],
			referenceDiagnostics : [],
			statusMessage       : null,
			lastFullStory       : '',
			pendingContinuation : false,
			lastRequest         : null,
			storyChunks         : [],
			error               : null,
			// Persist user preference for auto-applying patches
			autoApplyPatches    : (typeof window !== 'undefined' && window.localStorage) ? (window.localStorage.getItem('MF_AUTO_APPLY_PATCHES') === '1') : false,
			// New: auto-index on save (RAG)
			autoIndexRetrieval  : (typeof window !== 'undefined' && window.localStorage) ? (window.localStorage.getItem('MF_AUTO_INDEX_RETRIEVAL') === '1') : false
		};
	},

	// Helper: extract the first H1 title ("# Title") from a markdown string
	extractFirstH1 : function(text) {
		if(!text) return null;
		const m = (text.replace(/\r/g, '\n') || '').match(/^#\s+(.+)$/m);
		return m ? m[1].trim() : null;
	},

	setAutoApplyPatches : function(enabled) {
		this.setState({ autoApplyPatches: !!enabled });
		try { window.localStorage.setItem('MF_AUTO_APPLY_PATCHES', enabled ? '1' : '0'); } catch(_) {}
	},

	setAutoIndexRetrieval : function(enabled) {
		this.setState({ autoIndexRetrieval: !!enabled });
		try { window.localStorage.setItem('MF_AUTO_INDEX_RETRIEVAL', enabled ? '1' : '0'); } catch(_) {}
	},

	// Debounced indexing scheduler
	scheduleRetrievalIndex : function(brewId, fullText) {
		if (!brewId || !fullText) return;
		// simple debounce using a timer on the instance
		if (this._indexTimer) clearTimeout(this._indexTimer);
		this._indexTimer = setTimeout(()=>{
			this.postRetrievalIndex(brewId, fullText).catch((err)=>{
				console.warn('Auto-index failed:', err?.message || err);
				this.appendSystemMessage('Auto-index failed. You can retry from Assistant actions.', 'error');
			});
		}, 1200);
	},

	postRetrievalIndex : async function(brewId, fullText) {
		try {
			this.setState({ statusMessage: 'Indexing latest changes for retrieval…' });
			const resp = await fetch(`/api/story/index/${brewId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fullText })
			});
			if (!resp.ok) throw new Error(`Index request failed: ${resp.status}`);
			const data = await resp.json();
			if (!data?.success) throw new Error(data?.error || 'Indexing failed');
			this.setState({ statusMessage: `Indexed ${data.count || 0} chunk(s) for retrieval.` });
			setTimeout(()=> this.setState({ statusMessage: null }), 2000);
		} catch (e) {
			this.setState({ statusMessage: null });
			throw e;
		}
	},

	saveChunkToServer : async function(chunk) {
		try {
			const response = await fetch("/api/insertChunk", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(chunk)
			});

			if (!response.ok) {
				throw new Error(`❌ Failed to save chunk: ${response.status}`);
			}

			const result = await response.json();

			// ✅ If insert succeeded
			if (result.status === "ok") {
				console.log("✅ Chunk saved:", result.chunk);
				return result.chunk;
			}

			// ⚠️ If conflict detected
			if (result.status === "conflict") {
				console.warn("⚠️ Conflict detected:", result);

				const existing = result.existing;
				const incoming = result.incoming;

				// Simple auto-merge strategy: keep latest non-empty fields
				const merged = {
					...existing,
					...incoming,
					content: this.resolveConflictText(existing.content, incoming.content),
					version: (existing.version || 1) + 1,
					merged: true,
				};

				// Retry saving merged chunk
				const retryResponse = await fetch("/api/insertChunk", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(merged)
				});

				if (retryResponse.ok) {
					const retryResult = await retryResponse.json();
					if (retryResult.status === "ok") {
						console.log("✅ Conflict resolved with merge:", retryResult.chunk);
						return retryResult.chunk;
					} else {
						throw new Error("Failed to save merged chunk");
					}
				} else {
					throw new Error("Failed to save merged chunk");
				}
			}

			throw new Error("Unexpected API response");
		} catch (err) {
			console.error("❌ Failed to save chunk:", err.message);
			throw err;
		}
	},

	/**
	 * Merge conflicting text fields.
	 * For now: if they differ, append them together.
	 * Later: replace with smarter diff/merge UI.
	 */
	resolveConflictText : function(existingText, incomingText) {
		if (!existingText) return incomingText;
		if (!incomingText) return existingText;
		if (existingText === incomingText) return existingText;

		// Append to preserve both versions
		return `${existingText}\n---\n${incomingText}`;
	},

	saveStoryChunk : function(storyText) {
		const metadata = this.getCurrentDocumentMetadata();
		const projectId = metadata.editId;
		const docId = `doc_${Date.now()}`;
		
		if (!projectId) {
			console.warn("No project ID available for chunk saving");
			return;
		}

		const chunkData = {
			projectId: projectId,
			docId: docId,
			content: storyText,
			chapterId: null,
			sceneId: null,
			entities: []
		};

		this.saveChunkToServer(chunkData)
			.then((result) => {
				if (result) {
					console.log("Story chunk saved successfully");
				}
			})
			.catch((error) => {
				console.error("Failed to save story chunk:", error);
			});
	},

	saveStructuredChunk : function(parsedData, originalMessage) {
		const metadata = this.getCurrentDocumentMetadata();
		const projectId = metadata.editId;
		const docId = `structured_${Date.now()}`;
		
		if (!projectId) {
			console.warn("No project ID available for structured chunk saving");
			return;
		}

		// Prepare structured chunk data
		const chunkData = {
			projectId: projectId,
			docId: docId,
			content: JSON.stringify(parsedData),
			chapterId: parsedData.chapterId || null,
			sceneId: parsedData.sceneId || null,
			entities: parsedData.entities || []
		};

		this.saveChunkToServer(chunkData)
			.then((result) => {
				if (result) {
					console.log("✅ Structured chunk saved successfully");
				}
			})
			.catch((error) => {
				console.error("❌ Failed to save structured chunk:", error);
			});
	},

	handleAiRequest : async function(userPrompt) {
		this.setState({ isProcessing: true, error: null });

		try {
			// Get story ID from current document metadata
			const metadata = this.getCurrentDocumentMetadata();
			const storyId = metadata.editId;
			const documentText = this.getCurrentDocumentText();
			
			if (!storyId) {
				throw new Error("No story ID available");
			}

			console.log(`[AI Request] Sending request: "${userPrompt}"`);
			console.log(`[AI Request] Document length: ${documentText.length} characters`);

			// Call GPT with system prompt + user input + document context
			const response = await fetch("/api/ai-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					storyId,
					prompt: userPrompt,
					documentText: documentText,
					metadata: metadata
				}),
			});

			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const parsed = await response.json();

			// Validate that we got a valid response
			if (!parsed || typeof parsed !== 'object') {
				throw new Error("Invalid response from AI");
			}

			// Apply the changes to the document
			await this.applyAiChanges(parsed);

			// Save to backend (handles conflicts now!)
			const result = await this.saveChunkToServer(parsed);

			if (result.status === "conflict") {
				// Handle conflict gracefully
				this.setState({ error: "⚠️ Conflict detected — manual resolution required." });
				console.warn("Conflict details:", result);
			} else {
				// Append new/updated chunk
				this.setState((prev) => {
					const exists = prev.storyChunks.find((c) => c.id === parsed.id);
					if (exists) {
						return {
							storyChunks: prev.storyChunks.map((c) => (c.id === parsed.id ? parsed : c))
						};
					} else {
						return {
							storyChunks: [...prev.storyChunks, parsed]
						};
					}
				});
			}

			console.log(`✅ AI changes applied: ${parsed.action} on ${parsed.target}`);
			return result;
		} catch (err) {
			console.error("❌ AI request failed:", err);
			this.setState({ error: err.message });
		} finally {
			this.setState({ isProcessing: false });
		}
	},

	applyAiChanges : async function(aiResponse) {
		try {
			console.log(`[Apply Changes] Processing: ${aiResponse.action} on ${aiResponse.target}`);
			
			if (aiResponse.action === "modify" && aiResponse.target === "title") {
				// Change document title
				if (aiResponse.changes.title) {
					// Update document title in the editor
					const currentText = this.getCurrentDocumentText();
					const newText = currentText.replace(/^#\s+.*$/m, `# ${aiResponse.changes.title}`);
					this.setDocumentText(newText);
					// Sync navbar/meta title if handler provided
					if (this.props.onMetaChange) {
						try { this.props.onMetaChange({ title: aiResponse.changes.title }, 'title'); } catch(_) {}
					}
					
					// Update page title
					document.title = aiResponse.changes.title;
					
					console.log(`✅ Title changed to: "${aiResponse.changes.title}"`);
					this.appendSystemMessage(`Title changed to: "${aiResponse.changes.title}"`, 'system');
				}
			}
			else if (aiResponse.action === "modify" && aiResponse.target === "content") {
				// Modify document content
				if (aiResponse.changes.content) {
					const currentText = this.getCurrentDocumentText();
					const newText = currentText + "\n\n" + aiResponse.changes.content;
					this.setDocumentText(newText);
					
					console.log(`✅ Content added: ${aiResponse.changes.content.substring(0, 100)}...`);
					this.appendSystemMessage(`Content updated: ${aiResponse.reasoning}`, 'system');
				}
			}
			else if (aiResponse.action === "create" && aiResponse.target === "npc") {
				// Add new NPC
				if (aiResponse.changes.content) {
					const currentText = this.getCurrentDocumentText();
					const npcSection = `\n\n## ${aiResponse.changes.title || 'New NPC'}\n\n${aiResponse.changes.content}`;
					const newText = currentText + npcSection;
					this.setDocumentText(newText);
					
					console.log(`✅ New NPC added: ${aiResponse.changes.title || 'Unnamed'}`);
					this.appendSystemMessage(`New NPC created: ${aiResponse.changes.title || 'Unnamed'}`, 'system');
				}
			}
			else {
				// Generic content addition
				if (aiResponse.changes.content) {
					const currentText = this.getCurrentDocumentText();
					const newText = currentText + "\n\n" + aiResponse.changes.content;
					this.setDocumentText(newText);
					
					console.log(`✅ Content added: ${aiResponse.reasoning}`);
					this.appendSystemMessage(`Changes applied: ${aiResponse.reasoning}`, 'system');
				}
			}
		} catch (error) {
			console.error("❌ Failed to apply AI changes:", error);
			this.setState({ error: `Failed to apply changes: ${error.message}` });
		}
	},

	handleAssistantResponse : function(response, baseHistory, originalMessage) {
		// Handle new action-based responses
		try {
			// Check if response contains structured data that can be parsed
			if (response.structuredData && response.mode === 'structured') {
				const aiResponse = response.structuredData;
				console.log(`[Assistant Response] Processing: ${aiResponse.action} on ${aiResponse.target}`);

				// Apply the changes to the document
				this.applyAiChanges(aiResponse);

				// Save to backend
				this.saveChunkToServer(aiResponse);

				// Update UI state
				this.setState((prev) => {
					const exists = prev.storyChunks.find((c) => c.id === aiResponse.id);
					if (exists) {
						return {
							storyChunks: prev.storyChunks.map((c) => (c.id === aiResponse.id ? aiResponse : c))
						};
					} else {
						return {
							storyChunks: [...prev.storyChunks, aiResponse]
						};
					}
				});

				console.log("✅ Action-based response processed and applied");
				return; // Exit early since we handled it
			}
		} catch (error) {
			console.error("❌ Failed to process action-based response:", error);
			// Fallback: continue with normal processing
		}

		const assistantMessage = {
			type           : 'assistant',
			mode           : response.mode || 'chat',
			content        : response.summary || response.explanation || response.message || 'No response provided.',
			summary        : response.summary || response.explanation || null,
			patch          : response.patch || null,
			story          : response.story || null,
			rawResponse    : response.raw || null,
			historyContent : response.summary || response.explanation || response.message || '',
			timestamp      : new Date(),
			patchApplied   : false,
			patchDismissed : false
		};

		const nextMessages = [...baseHistory, assistantMessage];

		this.setState({
			chatMessages        : nextMessages,
			isProcessing        : false,
			pendingContinuation : !!response.hasMore,
			statusMessage       : response.hasMore ? 'Assistant can continue writing. Type "continue" to resume.' : null,
			lastRequest         : originalMessage,
			referenceDiagnostics : Array.isArray(response.referenceDiagnostics) ? response.referenceDiagnostics : []
		});

		const unreadableReferences = (response.referenceDiagnostics || []).filter((entry)=>entry.status === 'unreadable');
		if(unreadableReferences.length) {
			const names = unreadableReferences.map((entry)=>entry.originalName || entry.name || 'reference').join(', ');
			this.appendSystemMessage(`Could not read reference file(s): ${names}.`, 'error');
		}

		if(assistantMessage.mode === 'patch' && assistantMessage.patch) {
			// If user enabled auto-apply, apply immediately
			if (this.state.autoApplyPatches) {
				const msgIdx = nextMessages.length - 1;
				setTimeout(()=> this.applyPatch(msgIdx, assistantMessage.patch), 0);
			}
			return;
		}

		if(assistantMessage.mode === 'story' && assistantMessage.story) {
			this.applyFullStoryUpdate(assistantMessage.story, response.hasMore);
			return;
		}

		if(assistantMessage.mode === 'chat' && !assistantMessage.summary && assistantMessage.story) {
			this.applyFullStoryUpdate(assistantMessage.story, response.hasMore);
		}
	},

	updateStoryFromBot : function(request, options = {}) {
		const documentText = this.getCurrentDocumentText();
		const metadata = this.getCurrentDocumentMetadata();
		const chatHistory = options.chatMessages || this.state.chatMessages;

		const payload = {
			message      : request,
			documentText : documentText,
			metadata,
			chatHistory  : this.buildChatHistoryPayload(chatHistory),
			storyState   : {
				lastStoryText       : this.state.lastFullStory || documentText,
				pendingContinuation : this.state.pendingContinuation,
				lastUserRequest     : this.state.lastRequest,
				continueRequest     : !!options.continueRequest
			},
			mode : options.mode || 'auto'
		};
		return this.callStoryAssistantAPI(payload);
	},
	buildChatHistoryPayload : function(messages) {
		return messages
			.filter((msg)=>msg.type === 'user' || msg.type === 'assistant')
			.slice(-10)
			.map((msg)=>({
				role    : msg.type === 'assistant' ? 'assistant' : 'user',
				content : msg.historyContent || msg.content || ''
			}));
	},
	callStoryAssistantAPI : function(payload) {
		return fetch('/api/story-ide', {
			method  : 'POST',
			headers : {
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify({
				...payload,
				references : this.state.uploadedReferences.map((ref)=>({
					name     : ref.name,
					content  : ref.content,
					encoding : ref.encoding,
					mimeType : ref.mimeType,
					size     : ref.size
				}))
			})
		})
			.then((response)=>{
				if(!response.ok) {
					throw new Error(`Assistant request failed with status ${response.status}`);
				}
				return response.json();
			})
			.then((data)=>{
				if(!data.success) {
					throw new Error(data.error || 'Assistant returned an error.');
				}
				return data;
			});
	},
	appendSystemMessage : function(content, variant = 'system') {
		const message = {
			type      : variant,
			content   : content,
			timestamp : new Date()
		};
		this.setState((prev)=>({ chatMessages: [...prev.chatMessages, message] }));
	},
	getCurrentDocumentText : function() {
		if(this.props.brew && this.props.brew.text) {
			return this.props.brew.text;
		}
		if(window.editor && window.editor.getValue) {
			return window.editor.getValue();
		}
		const textArea = document.querySelector('.editor textarea');
		if(textArea) {
			return textArea.value;
		}
		return '';
	},
	setDocumentText : function(newText) {
		if(this.props.onContentGenerate) {
			this.props.onContentGenerate(newText, true);
		} else if(window.editor && window.editor.setValue) {
			window.editor.setValue(newText);
		}
	},
	getCurrentDocumentMetadata : function() {
		return {
			title  : document.title,
			url    : window.location.href,
			editId : window.location.pathname.includes('/edit/') ?
				window.location.pathname.split('/edit/')[1] : null
		};
	},
	applyFullStoryUpdate : function(storyText, hasMore) {
		const cleanStory = this.sanitiseStoryText(storyText);
		if(!cleanStory) {
			this.appendSystemMessage('Story update was empty or invalid.', 'error');
			return;
		}
		this.setDocumentText(cleanStory);
		this.setState({
			lastFullStory       : cleanStory,
			pendingContinuation : !!hasMore
		});
		this.appendSystemMessage('Story updated in the editor.', 'system');
		
		// Save chunk to server
		this.saveStoryChunk(cleanStory);
	},
	sanitiseStoryText : function(text) {
		if(!text) return '';
		const withoutCodeFences = text.replace(/```[\s\S]*?```/g, '').trim();
		const withoutScripts = withoutCodeFences.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
		return withoutScripts.trim();
	},
	handleFileSelect : function(event) {
		const files = Array.from(event.target.files || []);
		if(!files.length) {
			event.target.value = null;
			return;
		}
		const errors = [...this.state.referenceErrors];
		const existing = [...this.state.uploadedReferences];
		const availableSlots = Math.max(MAX_REFERENCES - existing.length, 0);
		if(availableSlots <= 0) {
			errors.push(`Maximum of ${MAX_REFERENCES} reference files reached.`);
			this.setState({ referenceErrors: errors });
			event.target.value = null;
			return;
		}
		const queue = files.slice(0, availableSlots);
		if(files.length > queue.length) {
			errors.push(`Only the first ${availableSlots} file(s) were added.`);
		}
		const validQueue = queue.filter((file)=>{
			if(file.size > MAX_REFERENCE_SIZE) {
				errors.push(`${file.name} exceeds ${Math.round(MAX_REFERENCE_SIZE / 1024 / 1024)}MB and was skipped.`);
				return false;
			}
			return true;
		});
		if(!validQueue.length) {
			this.setState({ referenceErrors: errors });
			event.target.value = null;
			return;
		}
		Promise.all(validQueue.map(this.readReferenceFile))
			.then((results)=>{
				const next = [...existing, ...results].slice(0, MAX_REFERENCES);
				this.setState({
					uploadedReferences : next,
					referenceErrors    : errors
				});
			})
			.catch((error)=>{
				errors.push(error.message || 'Failed to read one of the files.');
				this.setState({ referenceErrors: errors });
			})
			.finally(()=>{
				event.target.value = null;
			});
	},
	readReferenceFile : function(file) {
		const extension = (file.name || '').toLowerCase();
		const isBinary = /\.(pdf|docx?|rtf)$/i.test(extension);
		return isBinary ? this.readFileAsBase64(file) : this.readFileAsText(file);
	},
	readFileAsText : function(file) {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onload = (evt)=>{
				const raw = (evt.target?.result || '').toString();
				const trimmed = raw.length > MAX_REFERENCE_CHARS ? raw.slice(0, MAX_REFERENCE_CHARS) : raw;
				resolve({
					name     : file.name,
					size     : file.size,
					content  : trimmed,
					encoding : 'text',
					mimeType : file.type || 'text/plain'
				});
			};
			reader.onerror = ()=>reject(new Error(`Failed to read ${file.name}`));
			reader.readAsText(file);
		});
	},
	readFileAsBase64 : function(file) {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onload = (evt)=>{
				const buffer = evt.target?.result;
				if(!buffer) {
					reject(new Error(`Failed to read ${file.name}`));
					return;
				}
				const bytes = new Uint8Array(buffer);
				let binary = '';
				const chunk = 0x8000;
				for (let i = 0; i < bytes.length; i += chunk) {
					binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
				}
				const base64 = btoa(binary);
				resolve({
					name     : file.name,
					size     : file.size,
					content  : base64,
					encoding : 'base64',
					mimeType : file.type || this.guessMimeType(file.name)
				});
			};
			reader.onerror = ()=>reject(new Error(`Failed to read ${file.name}`));
			reader.readAsArrayBuffer(file);
		});
	},
	guessMimeType : function(name) {
		if(!name) return 'application/octet-stream';
		if(/\.pdf$/i.test(name)) return 'application/pdf';
		if(/\.docx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		if(/\.doc$/i.test(name)) return 'application/msword';
		if(/\.rtf$/i.test(name)) return 'application/rtf';
		return 'application/octet-stream';
	},
	removeReference : function(index) {
		this.setState((prev)=>{
			const removed = prev.uploadedReferences[index];
			const targetName = (removed?.name || '').toLowerCase();
			const nextDiagnostics = (prev.referenceDiagnostics || []).filter((entry)=>{
				const key = (entry.originalName || entry.name || '').toLowerCase();
				if(!targetName) return true;
				return key !== targetName;
			});
			return {
				uploadedReferences  : prev.uploadedReferences.filter((_, i)=>i !== index),
				referenceDiagnostics : nextDiagnostics
			};
		});
	},
	clearReferences : function() {
		this.setState({ uploadedReferences: [], referenceDiagnostics: [] });
	},
	renderReferenceManager : function() {

		if(!this.state.isExpanded) return null;

		return (

			<div className='reference-manager'>

				<div className='reference-header'>

					<strong>Reference Material</strong>

					<span>{this.state.uploadedReferences.length}/{MAX_REFERENCES}</span>

				</div>

				<div className='reference-controls'>

					<label className='reference-upload'>

						<i className='fas fa-upload' /> Upload files

						<input type='file' multiple onChange={this.handleFileSelect} accept='.txt,.md,.markdown,.json,.yaml,.yml,.csv,.log,.pdf,.doc,.docx,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf' />

					</label>

					{this.state.uploadedReferences.length > 0 && (

						<button className='reference-clear' onClick={this.clearReferences}>

							<i className='fas fa-trash' /> Clear

						</button>

					)}

				</div>

				{this.state.referenceErrors.length > 0 && (

					<ul className='reference-errors'>

						{this.state.referenceErrors.map((err, idx)=>(

							<li key={idx}>{err}</li>

						))}

					</ul>

				)}

				{this.state.uploadedReferences.length > 0 && (

					<ul className='reference-list'>

						{this.state.uploadedReferences.map((ref, idx)=>(

							<li key={`${ref.name}-${idx}`}>

								<span className='reference-name'>{ref.name}</span>

								<button className='reference-remove' onClick={()=>this.removeReference(idx)}>

									<i className='fas fa-times' />

								</button>

							</li>

						))}

					</ul>

				)}

			</div>

		);

	},



	renderChatMessage : function(message, index) {
		const isUser = message.type === 'user';
		const isSystem = message.type === 'system' || message.type === 'error';
		const isAssistant = message.type === 'assistant';
		let roleIcon = 'fa-dragon';
		let senderLabel = 'Story Assistant';
		if(isUser) {
			roleIcon = 'fa-user';
			senderLabel = 'You';
		} else if(isSystem) {
			roleIcon = 'fa-cog';
			senderLabel = 'System';
		}
		const containerClass = `chat-message ${message.type}${message.patchApplied ? ' applied' : ''}${message.patchDismissed ? ' dismissed' : ''}`;
		return (
			<div key={index} className={containerClass}>
				<div className='message-header'>
					<i className={`fas ${roleIcon}`} />
					<span className='message-sender'>
						{senderLabel}
					</span>
					<span className='message-time'>
						{message.timestamp ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
					</span>
				</div>
				<div className='message-content'>
					{isAssistant && message.mode === 'patch' && message.summary && (
						<div className='patch-summary'>
							{message.summary.split('\n').map((line, idx)=>(
								<div key={idx} className='summary-line'>{line}</div>
							))}
						</div>
					)}
					{(!isAssistant || message.mode !== 'patch') && message.content && (
						<p>{message.content}</p>
					)}
					{message.patch && (
						<div className='patch-preview'>
							<pre className='patch-diff'>{message.patch}</pre>
							{!message.patchApplied && !message.patchDismissed && (
								<div className='patch-actions'>
									<button className='apply-patch-btn' onClick={()=>this.applyPatch(index, message.patch)}>
										<i className='fas fa-check' /> Apply
									</button>
									<button className='reject-patch-btn' onClick={()=>this.rejectPatch(index)}>
										<i className='fas fa-times' /> Dismiss
									</button>
								</div>
							)}
							{message.patchApplied && <div className='patch-status applied'>Patch applied</div>}
							{message.patchDismissed && <div className='patch-status dismissed'>Patch dismissed</div>}
						</div>
					)}
				</div>
			</div>
		);
	},
	applyPatch : function(messageIndex, patchText) {
		const currentText = this.getCurrentDocumentText();
		const result = this.applyUnifiedDiff(currentText, patchText || '');
		if(!result.success) {
			// Try a smart fallback for common patches (e.g., title changes)
			const smart = this.trySmartApplyFallback(currentText, patchText || '');
			if(smart && smart.applied && typeof smart.text === 'string') {
				this.setDocumentText(smart.text);
				// If H1 changed, sync meta title
				try {
					const oldTitle = this.extractFirstH1(currentText);
					const newTitle = this.extractFirstH1(smart.text);
					if (newTitle && newTitle !== oldTitle && this.props.onMetaChange) {
						this.props.onMetaChange({ title: newTitle }, 'title');
					}
				} catch(_) {}
				this.setState((prev)=>{
					const messages = prev.chatMessages.map((msg, idx)=>{
						if(idx !== messageIndex) return msg;
						return { ...msg, patchApplied: true };
					});
					return {
						chatMessages : [...messages, {
							type      : 'system',
							content   : smart.note || 'Changes applied using a smart fallback.',
							timestamp : new Date()
						}],
						statusMessage : null,
						lastFullStory : smart.text
					};
				});
				// Save version snapshot (Phase 1)
				this.saveVersionSnapshot(smart.text, patchText, 'ai', smart.note).catch(()=>{});
				return;
			}

			this.appendSystemMessage(result.error || 'Unable to apply the proposed changes.', 'error');
			return;
		}
		this.setDocumentText(result.text);
		// If H1 changed through a clean diff, sync meta title
		try {
			const oldTitle = this.extractFirstH1(currentText);
			const newTitle = this.extractFirstH1(result.text);
			if (newTitle && newTitle !== oldTitle && this.props.onMetaChange) {
				this.props.onMetaChange({ title: newTitle }, 'title');
			}
		} catch(_) {}
		this.setState((prev)=>{
			const messages = prev.chatMessages.map((msg, idx)=>{
				if(idx !== messageIndex) return msg;
				return { ...msg, patchApplied: true };
			});
			return {
				chatMessages : [...messages, {
					type      : 'system',
					content   : 'Changes applied to your document.',
					timestamp : new Date()
				}],
				statusMessage : null,
				lastFullStory : result.text
			};
		});
		// Save version snapshot (Phase 1)
		this.saveVersionSnapshot(result.text, patchText, 'ai', 'Assistant patch applied').catch(()=>{});
	},

	// Phase 1: Save version snapshot to server (simple)
	saveVersionSnapshot : async function(fullText, patch, author='ai', summary=null) {
		try {
			const meta = this.getCurrentDocumentMetadata();
			const brewId = meta.editId;
			if(!brewId) return;
			await fetch(`/api/story/version/${brewId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fullText, patch, author, summary })
			});
			// After successful version save, optionally trigger retrieval indexing
			if (this.state.autoIndexRetrieval) {
				this.scheduleRetrievalIndex(brewId, fullText);
			}
		} catch(_) {}
	},

	// Heuristic fallback when unified diff fails: handle common title-change patches
	trySmartApplyFallback : function(originalText, diffText) {
		try {
			if(!diffText) return { applied: false };

			// Normalize line breaks; some responses arrive as a single line
			const normalized = diffText.replace(/\r/g, '\n').replace(/@@/g, '\n@@\n').replace(/(\-\#|\+\#|^# )/gm, m => m);

			// Extract possible additions from the diff
			let newTitle = null;
			let newSubtitle = null; // lines starting with ##
			let newBlurb = null;    // italic single line like *...*
			const plusTitleMatch = normalized.match(/^\+\#\s+(.+)$/m);
			if (plusTitleMatch) newTitle = plusTitleMatch[1].trim();

			// 2) Try old/new pair: "-# Old" followed by "+# New"
			if (!newTitle) {
				const lines = normalized.split('\n');
				for(let i=0;i<lines.length-1;i++){
					if(/^\-\#\s+/.test(lines[i]) && /^\+\#\s+/.test(lines[i+1])){
						newTitle = lines[i+1].replace(/^\+\#\s+/, '').trim();
						break;
					}
				}
			}

			// Extract subtitle from +## line or -##/+## pair
			const plusSubtitleMatch = normalized.match(/^\+\#\#\s+(.+)$/m);
			if (plusSubtitleMatch) newSubtitle = plusSubtitleMatch[1].trim();
			if (!newSubtitle) {
				const lines = normalized.split('\n');
				for(let i=0;i<lines.length-1;i++){
					if(/^\-\#\#\s+/.test(lines[i]) && /^\+\#\#\s+/.test(lines[i+1])){
						newSubtitle = lines[i+1].replace(/^\+\#\#\s+/, '').trim();
						break;
					}
				}
			}

			// Extract blurb from added italic line
			const plusItalicMatch = normalized.match(/^\+\*([^\n]*?)\*\s*$/m);
			if (plusItalicMatch) newBlurb = `*${plusItalicMatch[1].trim()}*`;

			// 3) Fall back to quoted title in explanation text: replace “with "New Title"” or “to "New Title"”
			if (!newTitle) {
				const quoted = normalized.match(/\b(?:to|with)\s+"([^"]{1,200})"/i);
				if (quoted) newTitle = quoted[1].trim();
			}

			// 4) Very last resort: look for a single starting H1 in the diff “# Title”`
			if (!newTitle) {
				const h1 = normalized.match(/^\#\s+(.+)$/m);
				if (h1) newTitle = h1[1].trim();
			}

			// Proceed if any of title/subtitle/blurb found
			if(!newTitle && !newSubtitle && !newBlurb) return { applied: false };

			// Replace the first H1 (# ...) in the document; if missing, insert after frontCover
			const orig = originalText.replace(/\r/g, '\n');
			const lines = orig.split('\n');
			let changed = false;
			let noteParts = [];

			// Title
			if (newTitle) {
				let h1Idx = lines.findIndex(l => /^\#\s+.+$/.test(l));
				if(h1Idx >= 0) {
					lines[h1Idx] = `# ${newTitle}`;
					changed = true;
					noteParts.push(`Title → "${newTitle}"`);
				} else {
					const fcIdx = lines.findIndex(l => /\{\{\s*frontCover\s*\}\}/i.test(l));
					if(fcIdx >= 0) {
						const insertAt = Math.min(fcIdx + 1, lines.length);
						lines.splice(insertAt, 0, '', `# ${newTitle}`, '');
					} else {
						lines.unshift(`# ${newTitle}`, '');
					}
					changed = true;
					noteParts.push(`Inserted title "${newTitle}"`);
				}
			}

			// Subtitle (first H2)
			if (newSubtitle) {
				let h2Idx = lines.findIndex(l => /^\#\#\s+.+$/.test(l));
				if(h2Idx >= 0) {
					lines[h2Idx] = `## ${newSubtitle}`;
					changed = true;
					noteParts.push('Subtitle updated');
				} else {
					// Insert below H1 if exists
					let h1Idx = lines.findIndex(l => /^\#\s+.+$/.test(l));
					if (h1Idx >= 0) {
						const insertAt = Math.min(h1Idx + 1, lines.length);
						// ensure a blank line after H1
						if (lines[insertAt] !== '') {
							lines.splice(insertAt, 0, '');
						}
						lines.splice(insertAt + 1, 0, `## ${newSubtitle}`);
					} else {
						lines.unshift(`## ${newSubtitle}`);
					}
					changed = true;
					noteParts.push('Subtitle inserted');
				}
			}

			// Blurb (first italic line after H2 preferred)
			if (newBlurb) {
				// find H2 region
				let startIdx = lines.findIndex(l => /^\#\#\s+.+$/.test(l));
				if (startIdx < 0) startIdx = 0;
				// find first italic single line between startIdx and next blank separator
				let italicIdx = -1;
				for (let i = startIdx; i < lines.length; i++) {
					if (/^\*[^\n]*\*$/.test(lines[i])) { italicIdx = i; break; }
					// stop early if hit a thematic break or next header
					if (/^\s*---\s*$/.test(lines[i]) || /^\#\s+/.test(lines[i]) || /^\#\#\s+/.test(lines[i])) break;
				}
				if (italicIdx >= 0) {
					lines[italicIdx] = newBlurb;
					changed = true;
					noteParts.push('Blurb updated');
				} else {
					// Insert below subtitle or title
					let anchorIdx = lines.findIndex(l => /^\#\#\s+.+$/.test(l));
					if (anchorIdx < 0) anchorIdx = lines.findIndex(l => /^\#\s+.+$/.test(l));
					if (anchorIdx < 0) anchorIdx = 0;
					const insertAt = Math.min(anchorIdx + 1, lines.length);
					if (lines[insertAt] !== '') lines.splice(insertAt, 0, '');
					lines.splice(insertAt + 1, 0, newBlurb);
					changed = true;
					noteParts.push('Blurb inserted');
				}
			}

			if (!changed) return { applied: false };
			return { applied: true, text: lines.join('\n'), note: noteParts.join('; ') };
		} catch(err) {
			return { applied: false };
		}
	},
	rejectPatch : function(messageIndex) {
		this.setState((prev)=>{
			const messages = prev.chatMessages.map((msg, idx)=>{
				if(idx !== messageIndex) return msg;
				return { ...msg, patchDismissed: true };
			});
			return {
				chatMessages  : messages,
				statusMessage : 'Patch dismissed.'
			};
		});
	},
	applyUnifiedDiff : function(originalText, diffText) {
		try {
			const normalizeLine = (s)=> (s ?? '').replace(/\r/g, '').replace(/[ \t]+$/g, '');
			const originalLines = originalText.replace(/\r/g, '\n').split('\n');
			const outputLines = [];
			const diffLines = diffText.replace(/\r/g, '\n').split('\n');

			let linePtr = 0;
			let index = 0;

			// Skip headers
			while (index < diffLines.length && (diffLines[index].startsWith('---') || diffLines[index].startsWith('+++'))) {
				index++;
			}

			while (index < diffLines.length) {
				// Find next hunk
				while (index < diffLines.length && !diffLines[index].startsWith('@@')) index++;
				if (index >= diffLines.length) break;

				const header = diffLines[index++];
				const match = /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
				if(!match) return { success: false, error: 'Invalid diff hunk header.' };

				const startOriginal = parseInt(match[1], 10);
				const targetIndex = Math.max(startOriginal - 1, 0);

				// Copy unchanged region before hunk
				while (linePtr < targetIndex && linePtr < originalLines.length) {
					outputLines.push(originalLines[linePtr]);
					linePtr++;
				}

				// Apply hunk
				while (index < diffLines.length && !diffLines[index].startsWith('@@')) {
					const raw = diffLines[index++];
					if(raw === '') {
						outputLines.push('');
						if(linePtr < originalLines.length) linePtr++;
						continue;
					}
					const indicator = raw[0];
					const content = raw.slice(1);
					if(indicator === ' ') {
						const expected = normalizeLine(originalLines[linePtr]);
						const want = normalizeLine(content);
						if(expected !== want) {
							return { success: false, error: 'Patch does not match the current document context.' };
						}
						outputLines.push(originalLines[linePtr]);
						linePtr++;
					} else if(indicator === '-') {
						const expected = normalizeLine(originalLines[linePtr]);
						const want = normalizeLine(content);
						if(expected !== want) {
							return { success: false, error: 'Patch removal did not match the current document.' };
						}
						linePtr++;
					} else if(indicator === '+') {
						outputLines.push(content);
					} else if(indicator === '\\') {
						continue;
					} else {
						return { success: false, error: 'Unsupported diff line indicator.' };
					}
				}
			}

			while (linePtr < originalLines.length) {
				outputLines.push(originalLines[linePtr]);
				linePtr++;
			}

			return { success: true, text: outputLines.join('\n') };
		} catch (error) {
			return { success: false, error: error.message || 'Failed to apply diff.' };
		}
	},
	
	toggleExpanded : function() {
		this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
	},
	
	handleInputChange : function(event) {
		this.setState({ currentMessage: event.target.value });
	},
	
	handleKeyPress : function(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			this.sendMessage();
		}
	},
	
	sendMessage : function() {
		const message = this.state.currentMessage.trim();
		if (!message || this.state.isProcessing) return;
		
		const userMessage = {
			type: 'user',
			content: message,
			historyContent: message,
			timestamp: new Date()
		};
		
		const nextMessages = [...this.state.chatMessages, userMessage];
		
		this.setState({
			chatMessages: nextMessages,
			currentMessage: '',
			isProcessing: true,
			statusMessage: null
		});
		
		const isContinue = message.toLowerCase() === 'continue';
		const options = {
			chatMessages: nextMessages,
			continueRequest: isContinue && this.state.pendingContinuation
		};
		
		this.updateStoryFromBot(message, options)
			.then((response) => {
				this.handleAssistantResponse(response, nextMessages, message);
			})
			.catch((error) => {
				console.error('Assistant request failed:', error);
				this.setState({
					isProcessing: false,
					statusMessage: null
				});
				this.appendSystemMessage(error.message || 'Failed to get response from assistant.', 'error');
			});
	},
	
	render : function() {
		if(!this.state.isExpanded) {
			return (
				<div className='ai-sidebar collapsed'>
					<div className='ai-toggle' onClick={this.toggleExpanded}>
						<i className='fas fa-dragon' />
						<span>Story Assistant</span>
					</div>
				</div>
			);
		}
		return (
			<div className='ai-sidebar expanded'>
				<div className='ai-header'>
					<h3>
						<i className='fas fa-dragon' />
						Story Assistant
					</h3>
						<div className='ai-header-controls'>
							<label className='auto-apply-toggle' title='Automatically apply AI patches to your document'>
								<input type='checkbox' checked={this.state.autoApplyPatches} onChange={(e)=>this.setAutoApplyPatches(e.target.checked)} />
								<span>Auto-apply patches</span>
							</label>
							<label className='auto-index-toggle' title='Automatically re-index the document for retrieval after changes'>
								<input type='checkbox' checked={this.state.autoIndexRetrieval} onChange={(e)=>this.setAutoIndexRetrieval(e.target.checked)} />
								<span>Auto-index for retrieval</span>
							</label>
							<button className='close-btn' onClick={this.toggleExpanded}>
								<i className='fas fa-times' />
							</button>
						</div>
				</div>
				<div className='ai-content'>
					<div className='chat-container'>
						<div className='chat-messages'>
							{this.state.chatMessages.length === 0 && (
								<div className='welcome-message'>
									<i className='fas fa-dragon' />
									<h4>Hello! I'm your D&D Story Assistant</h4>
									<p>Ask questions, tune scenes, or request full rewrites. I can also propose patches you can apply instantly.</p>
									<ul>
										<li>Brainstorm chapters, encounters, NPCs, and world-building beats</li>
										<li>Rewrite sections in a new tone or add dramatic flair</li>
										<li>Upload reference notes (PDF, DOCX, TXT) so I can weave them into the story</li>
										<li>Type �continue� if a long response was truncated</li>
									</ul>
									<p><strong>What would you like to create or refine today?</strong></p>
								</div>
							)}
							{this.state.chatMessages.map(this.renderChatMessage)}
							{this.state.isProcessing && (
								<div className='chat-message assistant processing'>
									<div className='message-header'>
										<i className='fas fa-dragon' />
										<span className='message-sender'>Story Assistant</span>
									</div>
									<div className='message-content'>
										<i className='fas fa-spinner fa-spin' /> Thinking through your request...
									</div>
								</div>
							)}
						</div>
						{this.renderReferenceManager()}
						
						<div className='chat-input-container'>
							<div className='chat-input'>
								<textarea
									value={this.state.currentMessage}
									onChange={this.handleInputChange}
									onKeyPress={this.handleKeyPress}
									placeholder='Share an idea, ask a question, or request edits...'
									rows='3'
									disabled={this.state.isProcessing}
								/>
								<button
									className='send-btn'
									onClick={this.sendMessage}
									disabled={this.state.isProcessing || !this.state.currentMessage.trim()}
								>
									<i className='fas fa-paper-plane' />
								</button>
							</div>
							{this.state.statusMessage && (
								<div className='status-message'>
									<i className='fas fa-info-circle' /> {this.state.statusMessage}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = AiSidebar;















