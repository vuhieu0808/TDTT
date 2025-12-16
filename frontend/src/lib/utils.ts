export const formatChatTime = (timestamp: {
	_seconds: number;
	_nanoseconds: number;
}): string => {
	if (!timestamp) return "";

	const date = new Date(
		timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
	);

	// return date.toString();

	// Sử dụng 'en-GB' để có định dạng dd/mm/yyyy
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false, // false = 24h (17:00), true = 12h (5:00 PM)
		timeZone: "Asia/Ho_Chi_Minh",
	}).format(date);
};

export const isImageFile = (fileName: string): boolean => {
	const imageExtensions = [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".bmp",
		".webp",
		".tiff",
		".svg",
	];
	const lowerCaseFileName = fileName.toLowerCase();
	return imageExtensions.some((ext) => lowerCaseFileName.endsWith(ext));
};

export const formatFileSize = (sizeInBytes: number): string => {
	if (sizeInBytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
	const size = parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2));
	return `${size} ${sizes[i]}`;
};

export const formatMarkdownToHTML = (markdown: string): string => {
	if (!markdown) return "";

	let html = markdown;

	// Escape HTML to prevent XSS
	html = html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	// Code blocks (```language\ncode\n```)
	html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
		const language = lang ? ` class="language-${lang}"` : "";
		return `<pre><code${language}>${code.trim()}</code></pre>`;
	});

	// Inline code (`code`)
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

	// Bold (**text** or __text__)
	html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

	// Italic (*text* or _text_)
	html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
	html = html.replace(/_(.+?)_/g, "<em>$1</em>");

	// Strikethrough (~~text~~)
	html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

	// Links ([text](url))
	html = html.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
	);

	// Images (![alt](url))
	html = html.replace(
		/!\[([^\]]*)\]\(([^)]+)\)/g,
		'<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />'
	);

	// Headers (# to ######)
	html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
	html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
	html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
	html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
	html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

	// Blockquotes (> text)
	html = html.replace(/^&gt; (.+)$/gim, "<blockquote>$1</blockquote>");

	// Unordered lists (- or * or +)
	html = html.replace(/^\s*[-*+] (.+)$/gim, "<li>$1</li>");
	html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

	// Line breaks
	html = html.replace(/\n/g, "<br>");

	return html.trim();
};
