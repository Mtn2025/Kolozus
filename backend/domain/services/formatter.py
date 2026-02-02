from typing import List, Dict
from domain.models import Product, ProductSection, StyleFamily

class Formatter:
    """
    Renders the Product into a publishable format (HTML for now)
    applying the selected Style Family.
    """
    
    @staticmethod
    def render_html(product: Product) -> str:
        css = Formatter._get_css(product.style_family, product.design_overrides)
        
        body_content = ""
        for section in product.sections:
            body_content += Formatter._render_section(section, level=1)
            
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{product.title}</title>
            <style>
                {css}
            </style>
        </head>
        <body>
            <header class="product-header">
                <h1>{product.title}</h1>
                <p class="meta">{product.archetype} | {product.style_family}</p>
            </header>
            <main>
                {body_content}
            </main>
        </body>
        </html>
        """

    @staticmethod
    def _render_section(section: ProductSection, level: int) -> str:
        h_tag = f"h{min(level+1, 6)}"
        content = section.content or "<p class='placeholder'>[Empty Section]</p>"
        
        html = f"""
        <section class="level-{level}" id="sec-{section.id}">
            <{h_tag}>{section.title}</{h_tag}>
            <div class="content">{content}</div>
        """
        
        if section.subsections:
            for sub in section.subsections:
                html += Formatter._render_section(sub, level + 1)
                
        html += "</section>"
        return html

    @staticmethod
    def render_markdown(product: Product) -> str:
        md = f"# {product.title}\n\n"
        md += f"**{product.archetype}** | *{product.style_family}*\n\n---\n\n"
        
        for section in product.sections:
            md += Formatter._render_section_md(section, level=1)
        
        return md

    @staticmethod
    def _render_section_md(section: ProductSection, level: int) -> str:
        hashes = "#" * min(level + 1, 6)
        content = section.content or "_[Empty Section]_"
        # Naive HTML to Markdown conversion (just stripping tags or assuming content is somewhat clean)
        # For a real implementation, we'd use 'markdownify' lib.
        # Here we just pass content assuming the user might want raw HTML or simple text.
        
        md = f"{hashes} {section.title}\n\n{content}\n\n"
        
        if section.subsections:
            for sub in section.subsections:
                md += Formatter._render_section_md(sub, level + 1)
        
        return md

    @staticmethod
    def _get_css(style: StyleFamily, overrides: Dict = {}) -> str:
        # Resolve overrides
        font_base = overrides.get("font_base", "system-ui")
        primary_color = overrides.get("primary_color", "#1e293b")
        accent_color = overrides.get("accent_color", "#3b82f6")
        
        # Defaults
        base_css = f"""
            :root {{
                --font-base: {font_base};
                --color-primary: {primary_color};
                --color-accent: {accent_color};
            }}
            body {{ max-width: 800px; margin: 0 auto; padding: 40px; font-family: var(--font-base); line-height: 1.6; }}
            h1, h2, h3 {{ color: var(--color-primary); }}
            .placeholder {{ color: #94a3b8; font-style: italic; }}
            section {{ margin-bottom: 2rem; }}
            .product-header {{ text-align: center; margin-bottom: 4rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 2rem; }}
            .meta {{ color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; }}
        """
        
        if style == StyleFamily.ACADEMIC_RIGOR:
            return base_css + """
                body { font-family: "Times New Roman", Serif; text-align: justify; }
                h1 { font-size: 24pt; text-align: center; text-transform: uppercase; }
                h2 { font-size: 18pt; border-bottom: 1px solid black; }
                section { margin-bottom: 3rem; }
                .content { text-indent: 2em; }
            """
        elif style == StyleFamily.MODERN_STARTUP:
            return base_css + """
                body { font-family: "Inter", sans-serif; background: #fff; color: #0f172a; }
                h1 { font-size: 3rem; font-weight: 800; letter-spacing: -0.05em; background: -webkit-linear-gradient(45deg, #090979, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                h2 { font-size: 2rem; font-weight: 700; letter-spacing: -0.03em; }
                .content { font-size: 1.1rem; color: #334155; }
            """
        elif style == StyleFamily.CLASSIC_PUBLISHER:
            return base_css + """
                body { font-family: "Georgia", serif; color: #111; max-width: 650px; }
                h1 { font-family: "Baskerville", serif; font-style: italic; font-size: 3rem; margin-bottom: 0.5rem; }
                h2 { font-family: "Baskerville", serif; font-variant: small-caps; letter-spacing: 0.1em; text-align: center; margin-top: 3rem; }
                p { margin-bottom: 0; text-indent: 1.5em; }
                p:first-of-type { text-indent: 0; }
                p:first-of-type::first-letter { font-size: 3em; float: left; line-height: 1; padding-right: 0.1em; }
            """
        elif style == StyleFamily.SWISS_GRID:
            return base_css + """
                body { font-family: "Helvetica Neue", Arial, sans-serif; max-width: 100%; padding: 0; display: grid; grid-template-columns: 1fr 3fr; gap: 2rem; }
                .product-header { grid-column: 1 / -1; text-align: left; padding: 2rem; border-bottom: 4px solid black; }
                h1 { font-size: 4rem; text-transform: uppercase; line-height: 0.9; }
                section { grid-column: 2; padding-right: 2rem; border-left: 1px solid #ccc; padding-left: 2rem; }
                h2 { text-transform: uppercase; font-size: 1.2rem; margin-bottom: 1rem; }
            """
        elif style == StyleFamily.SCREEN_FLOW:
            return base_css + """
                body { background: #0f172a; color: #e2e8f0; font-family: "Segoe UI", sans-serif; max-width: 900px; }
                h1, h2, h3 { color: #f8fafc; }
                .product-header { border-color: #334155; }
                .content { line-height: 1.8; font-size: 1.125rem; }
            """
            
        return base_css
