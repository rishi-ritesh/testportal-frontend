import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor({ value, onChange, minimal = false }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
        onChange(html);
      }
    },
  });

  // ✅ THIS IS THE FIX (SYNC EXTERNAL VALUE → EDITOR)
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    const incoming = value || "<p></p>";

    // only update if different (prevents cursor jump)
    if (current !== incoming) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "6px" }}>
      
      {/* Toolbar */}
      <div style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>
        
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>

        {!minimal && (
          <>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>
              I
            </button>

            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
              •
            </button>

            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              1.
            </button>
          </>
        )}
      </div>

      {/* Editor Area */}
      <div style={{ padding: "8px", minHeight: minimal ? "60px" : "120px" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}