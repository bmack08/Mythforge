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
			error               : null
		};
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
			content        : response.summary || response.message || 'No response provided.',
			summary        : response.summary || null,
			patch          : response.patch || null,
			story          : response.story || null,
			rawResponse    : response.raw || null,
			historyContent : response.summary || response.message || '',
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
		return fetch('/api/story-assistant', {
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
			this.appendSystemMessage(result.error || 'Unable to apply the proposed changes.', 'error');
			return;
		}
		this.setDocumentText(result.text);
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
				const originalLines = originalText.replace(/\r/g, '\n').split('\n');
			const outputLines = [];
				const diffLines = diffText.replace(/\r/g, '\n').split('\n');
			let linePtr = 0;
			let index = 0;
			while (index < diffLines.length && (diffLines[index].startsWith('---') || diffLines[index].startsWith('+++'))) {
				index++;
			}
			while (index < diffLines.length) {
				const header = diffLines[index++];
				if(!header || !header.startsWith('@@')) continue;
				const match = /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
				if(!match) return { success: false, error: 'Invalid diff hunk header.' };
				const startOriginal = parseInt(match[1], 10);
				const targetIndex = Math.max(startOriginal - 1, 0);
				while (linePtr < targetIndex && linePtr < originalLines.length) {
					outputLines.push(originalLines[linePtr]);
					linePtr++;
				}
				while (index < diffLines.length && !diffLines[index].startsWith('@@')) {
					const line = diffLines[index++];
					if(!line.length) {
						outputLines.push('');
						if(linePtr < originalLines.length) linePtr++;
						continue;
					}
					const indicator = line[0];
					const content = line.slice(1);
					if(indicator === ' ') {
						const expected = originalLines[linePtr] ?? '';
						if(expected !== content) {
							return { success: false, error: 'Patch does not match the current document context.' };
						}
						outputLines.push(content);
						linePtr++;
					} else if(indicator === '-') {
						const expected = originalLines[linePtr] ?? '';
						if(expected !== content) {
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
			return {
			success : true,
			text    : outputLines.join('\n')
			};
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
					<button className='close-btn' onClick={this.toggleExpanded}>
						<i className='fas fa-times' />
					</button>
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
						
						{/* New AI Request Section */}
						<div className='ai-request-section'>
							<h4>AI Assistant</h4>
							<button
								className='ai-request-btn'
								disabled={this.state.isProcessing}
								onClick={() => this.handleAiRequest("change title to something mature and spooky")}
							>
								{this.state.isProcessing ? "Thinking..." : "Test: Change Title"}
							</button>
							
							{this.state.error && (
								<div className='error-message'>
									<i className='fas fa-exclamation-triangle' /> {this.state.error}
								</div>
							)}
							
							{this.state.storyChunks.length > 0 && (
								<div className='story-chunks'>
									<h5>Story Chunks:</h5>
									{this.state.storyChunks.map((chunk) => (
										<div key={chunk.id} className='chunk-item'>
											<pre>{JSON.stringify(chunk, null, 2)}</pre>
										</div>
									))}
								</div>
							)}
						</div>
						
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















