import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'

export default function Markdown({ content }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-a:text-indigo-600 prose-a:decoration-indigo-300 prose-a:underline-offset-2 dark:prose-a:text-indigo-400 dark:prose-a:decoration-indigo-700 prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
