import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import extensions from '../extensions/index.js';

/**
 * ChapterEditor Component
 * TipTap editor for individual chapter content
 * Part of the D&D Beyond-style book layout
 */
export default function ChapterEditor({ content, onChange }) {
	const editor = useEditor({
		extensions,
		content: content || { type: 'doc', content: [] },
		editable: true,
		onUpdate: ({ editor }) => {
			const json = editor.getJSON();
			onChange(json);
		},
		editorProps: {
			attributes: {
				class: 'chapter-editor-content',
				spellcheck: 'false',
			},
		},
	}, []); // Empty deps - editor created only once

	// Update content when prop changes
	useEffect(() => {
		if (!editor || !content) return;

		// Avoid unnecessary updates that cause cursor jump
		const currentJSON = JSON.stringify(editor.getJSON());
		const newJSON = JSON.stringify(content);

		if (currentJSON !== newJSON) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	if (!editor) {
		return <div className="chapter-editor">Loading editor...</div>;
	}

	return (
		<div className="chapter-editor">
			<div className="chapter-editor-toolbar">
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive('headingWithId', { level: 1 }) ? 'active' : ''}
					title="Heading 1"
				>
					H1
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={editor.isActive('headingWithId', { level: 2 }) ? 'active' : ''}
					title="Heading 2"
				>
					H2
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					className={editor.isActive('headingWithId', { level: 3 }) ? 'active' : ''}
					title="Heading 3"
				>
					H3
				</button>
				<span className="separator" />
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive('bold') ? 'active' : ''}
					title="Bold"
				>
					<strong>B</strong>
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive('italic') ? 'active' : ''}
					title="Italic"
				>
					<em>I</em>
				</button>
				<span className="separator" />
				<button
					onClick={() => editor.chain().focus().setPageBreak().run()}
					title="Page Break"
				>
					📄 Page
				</button>
				<button
					onClick={() => editor.chain().focus().setColumnBreak().run()}
					title="Column Break"
				>
					⫼ Column
				</button>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
}
